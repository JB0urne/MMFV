import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, Optional, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MoviesService, TmdbService } from '@mmfv/frontend/data-access/movies';
import {
    MOVIE_IMPORT_BATCH_SIZE,
    MOVIE_IMPORT_PREVIEW_REQUEST_SIZE,
} from '@mmfv/constants';
import { Movie, MovieImportCommitItem, MovieImportPreviewItem, MovieTmdb } from '@mmfv/interfaces';
import { displayMovieTitle, movieMatchKeys, normalizeMovieTitle } from '@mmfv/utils';
import { EMPTY, Subject, from, of } from 'rxjs';
import { catchError, concatMap, finalize, map, takeUntil } from 'rxjs/operators';

export type ImportMoviesDialogData = {
    catalog: Movie[];
};

export type ImportRowStatus =
    | 'unresolved'
    | 'auto'
    | 'manual'
    | 'ambiguous'
    | 'none'
    | 'exists'
    | 'skipped'
    | 'title-only';

export type ImportMovieRow = {
    lineNumber: number;
    input: string;
    /** Editable query for per-row TMDB search (defaults to pasted input). */
    searchQuery: string;
    status: ImportRowStatus;
    candidates: MovieTmdb[];
    chosenTitle?: string;
    chosenYear?: number;
    chosenTmdbId?: number;
    searchOpen: boolean;
    searchLoading: boolean;
    searchError: string | null;
};

@Component({
    selector: 'app-import-movies-dialog',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './import-movies-dialog.component.html',
    styleUrl: './import-movies-dialog.component.css',
})
export class ImportMoviesDialogComponent implements OnDestroy {
    readonly batchSize = MOVIE_IMPORT_BATCH_SIZE;
    readonly previewRequestSize = MOVIE_IMPORT_PREVIEW_REQUEST_SIZE;

    rawText = '';
    readonly rows = signal<ImportMovieRow[]>([]);
    readonly previewed = signal(false);

    readonly resolveLoading = signal(false);
    readonly commitLoading = signal(false);
    readonly resolveError = signal<string | null>(null);
    readonly commitError = signal<string | null>(null);
    readonly showOfflineActions = signal(false);

    private readonly destroy$ = new Subject<void>();
    private readonly catalogByTitle: Map<string, Movie>;
    private readonly catalogTmdbIds: Set<number>;

    constructor(
        private dialogRef: MatDialogRef<ImportMoviesDialogComponent, boolean | null>,
        private moviesService: MoviesService,
        private tmdbService: TmdbService,
        @Optional() @Inject(MAT_DIALOG_DATA) data: ImportMoviesDialogData | null,
    ) {
        const catalog = data?.catalog ?? [];
        this.catalogByTitle = buildCatalogTitleIndex(catalog);
        this.catalogTmdbIds = new Set(
            catalog.map(movie => movie.tmdbId).filter((id): id is number => id != null),
        );
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get lineCount(): number {
        return this.parseLines(this.rawText).length;
    }

    get unresolvedCount(): number {
        return this.rows().filter(r => r.status === 'unresolved').length;
    }

    get resolvedCount(): number {
        return this.rows().length - this.unresolvedCount;
    }

    get autoCount(): number {
        return this.rows().filter(r => r.status === 'auto').length;
    }

    get needsReviewCount(): number {
        return this.rows().filter(
            r => r.status === 'ambiguous' || r.status === 'none' || r.status === 'unresolved',
        ).length;
    }

    get settledCount(): number {
        return this.rows().filter(r => this.isSettled(r)).length;
    }

    get allSettled(): boolean {
        const rows = this.rows();
        return rows.length > 0 && rows.every(r => this.isSettled(r));
    }

    get nextBatchSize(): number {
        return Math.min(this.unresolvedCount, this.batchSize);
    }

    onPreview(): void {
        const lines = this.parseLines(this.rawText);
        this.rows.set(
            lines.map((input, index) => {
                const row = this.createRow(index + 1, input);
                const existing = this.catalogByTitle.get(normalizeMovieTitle(input));
                if (existing) {
                    row.status = 'exists';
                    row.chosenTitle = displayMovieTitle(existing);
                    row.chosenYear = existing.year;
                    row.chosenTmdbId = existing.tmdbId;
                }
                return row;
            }),
        );
        this.previewed.set(true);
        this.resolveError.set(null);
        this.commitError.set(null);
        this.showOfflineActions.set(false);

        // Resolve the first batch immediately so small imports don't need a second click.
        if (this.unresolvedCount > 0) {
            this.onResolveNextBatch();
        }
    }

    onResolveNextBatch(): void {
        if (this.resolveLoading() || this.nextBatchSize === 0) {
            return;
        }

        const targets = this.rows()
            .filter(r => r.status === 'unresolved')
            .slice(0, this.batchSize);
        const chunks = chunkArray(targets, this.previewRequestSize);

        this.resolveLoading.set(true);
        this.resolveError.set(null);
        this.showOfflineActions.set(false);

        from(chunks)
            .pipe(
                concatMap(chunkTargets =>
                    this.moviesService.previewImport(chunkTargets.map(r => r.input)).pipe(
                        map(response => ({ chunkTargets, response })),
                        catchError(error => {
                            this.resolveError.set(
                                error?.error?.message ??
                                    'TMDB resolve failed. Abort, or mark remaining as title-only.',
                            );
                            this.showOfflineActions.set(true);
                            return EMPTY;
                        }),
                    ),
                ),
                finalize(() => {
                    this.resolveLoading.set(false);
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(({ chunkTargets, response }) => {
                this.applyPreviewItems(chunkTargets, response.items);
                this.rows.update(rows => [...rows]);
            });
    }

    onToggleSearch(row: ImportMovieRow): void {
        row.searchOpen = !row.searchOpen;
        if (row.searchOpen && row.candidates.length === 0 && !row.searchLoading) {
            this.onSearchRow(row);
        }
    }

    onSearchRow(row: ImportMovieRow): void {
        const query = row.searchQuery.trim();
        if (!query) {
            row.searchError = 'Enter a title to search TMDB.';
            return;
        }

        row.searchLoading = true;
        row.searchError = null;

        this.tmdbService
            .searchMovies(query)
            .pipe(
                catchError(error => {
                    row.searchError =
                        error?.error?.message ??
                        'Search failed. Check that TMDB_API_KEY is configured.';
                    return of(null);
                }),
                finalize(() => {
                    row.searchLoading = false;
                    this.rows.update(rows => [...rows]);
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    row.candidates = response.results;
                    this.rows.update(rows => [...rows]);
                }
            });
    }

    onAcceptCandidate(row: ImportMovieRow, result: MovieTmdb): void {
        row.chosenTitle = result.title.trim();
        row.chosenYear = this.yearFromReleaseDate(result.releaseDate);
        row.chosenTmdbId = result.id;
        row.status = this.catalogTmdbIds.has(result.id) ? 'exists' : 'manual';
        row.searchOpen = false;
        row.searchError = null;
    }

    onAcceptTitleOnly(row: ImportMovieRow): void {
        row.chosenTitle = undefined;
        row.chosenYear = undefined;
        row.chosenTmdbId = undefined;
        row.status = 'title-only';
        row.searchOpen = false;
        row.searchError = null;
    }

    onSkip(row: ImportMovieRow): void {
        row.chosenTitle = undefined;
        row.chosenYear = undefined;
        row.chosenTmdbId = undefined;
        row.status = 'skipped';
        row.searchOpen = false;
        row.searchError = null;
    }

    onClearChoice(row: ImportMovieRow): void {
        row.chosenTitle = undefined;
        row.chosenYear = undefined;
        row.chosenTmdbId = undefined;
        if (row.candidates.length > 0) {
            row.status = 'ambiguous';
        } else {
            row.status = 'unresolved';
        }
    }

    onMarkUnresolvedAsTitleOnly(): void {
        for (const row of this.rows()) {
            if (
                row.status === 'unresolved' ||
                row.status === 'ambiguous' ||
                row.status === 'none'
            ) {
                this.onAcceptTitleOnly(row);
            }
        }
        this.showOfflineActions.set(false);
        this.resolveError.set(null);
        this.rows.update(rows => [...rows]);
    }

    statusLabel(status: ImportRowStatus): string {
        switch (status) {
            case 'auto':
                return 'Auto';
            case 'manual':
                return 'Manual';
            case 'ambiguous':
                return 'Needs review';
            case 'none':
                return 'Not found';
            case 'exists':
                return 'Already in catalog';
            case 'skipped':
                return 'Skipped';
            case 'title-only':
                return 'Title only';
            default:
                return 'Unresolved';
        }
    }

    releaseYear(releaseDate: string): string {
        return releaseDate?.slice(0, 4) || '—';
    }

    chosenSummary(row: ImportMovieRow): string {
        const parts = [row.chosenTitle ?? ''];
        if (row.chosenYear) {
            parts.push(`(${row.chosenYear})`);
        }
        if (row.chosenTmdbId != null) {
            parts.push(`· TMDB ${row.chosenTmdbId}`);
        }
        return parts.join(' ');
    }

    isCatalogTmdbId(tmdbId: number): boolean {
        return this.catalogTmdbIds.has(tmdbId);
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onCommit(): void {
        if (!this.allSettled || this.commitLoading()) {
            return;
        }

        const items: MovieImportCommitItem[] = [];
        for (const row of this.rows()) {
            if (row.status === 'skipped' || row.status === 'exists') {
                continue;
            }
            if (row.chosenTmdbId != null && (row.status === 'auto' || row.status === 'manual')) {
                items.push({ type: 'tmdb', tmdbId: row.chosenTmdbId });
                continue;
            }
            if (row.status === 'title-only') {
                items.push({ type: 'title', title: row.input });
            }
        }

        this.commitLoading.set(true);
        this.commitError.set(null);

        this.moviesService
            .commitImport({ items })
            .pipe(
                catchError(error => {
                    this.commitError.set(
                        error?.error?.message ?? 'Import commit failed. Try again.',
                    );
                    return of(null);
                }),
                finalize(() => {
                    this.commitLoading.set(false);
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    this.dialogRef.close(true);
                }
            });
    }

    private isSettled(row: ImportMovieRow): boolean {
        return (
            row.status === 'auto' ||
            row.status === 'manual' ||
            row.status === 'title-only' ||
            row.status === 'skipped' ||
            row.status === 'exists'
        );
    }

    private createRow(lineNumber: number, input: string): ImportMovieRow {
        return {
            lineNumber,
            input,
            searchQuery: input,
            status: 'unresolved',
            candidates: [],
            searchOpen: false,
            searchLoading: false,
            searchError: null,
        };
    }

    /** Mark as already-in-catalog when chosen TMDB id is in the current catalog. */
    private applyCatalogDedup(row: ImportMovieRow): void {
        if (row.chosenTmdbId != null && this.catalogTmdbIds.has(row.chosenTmdbId)) {
            row.status = 'exists';
        }
    }

    private applyPreviewItems(targets: ImportMovieRow[], items: MovieImportPreviewItem[]): void {
        items.forEach((item, index) => {
            const row = targets[index];
            if (!row) {
                return;
            }
            row.status = item.status;
            row.candidates = item.candidates ?? [];
            row.chosenTmdbId = item.chosenTmdbId;
            row.chosenTitle = item.chosenTitle;
            row.chosenYear = item.chosenYear;
            row.searchError = null;
            this.applyCatalogDedup(row);
        });
    }

    private yearFromReleaseDate(releaseDate: string): number {
        const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : 0;
        return Number.isFinite(year) ? year : 0;
    }

    private parseLines(text: string): string[] {
        return text
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }
}

function buildCatalogTitleIndex(catalog: Movie[]): Map<string, Movie> {
    const index = new Map<string, Movie>();
    for (const movie of catalog) {
        for (const key of movieMatchKeys(movie)) {
            if (key && !index.has(key)) {
                index.set(key, movie);
            }
        }
    }
    return index;
}

function chunkArray<T>(items: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let index = 0; index < items.length; index += size) {
        result.push(items.slice(index, index + size));
    }
    return result;
}
