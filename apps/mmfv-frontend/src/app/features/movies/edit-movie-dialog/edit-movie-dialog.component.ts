import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TmdbService } from '@mmfv/frontend/data-access/movies';
import { Language, Movie, MovieTmdb } from '@mmfv/interfaces';
import { normalizeMovieTitle, sanitizeTitles, titlesFromLocalized } from '@mmfv/utils';
import { Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-edit-movie-dialog',
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
    templateUrl: './edit-movie-dialog.component.html',
    styleUrl: './edit-movie-dialog.component.css',
})
export class EditMovieDialogComponent implements OnDestroy {
    /** Working copy of the catalog movie (cloned so Cancel does not mutate the list). */
    movie: Movie;

    readonly proposals = signal<MovieTmdb[]>([]);
    readonly searchLoading = signal(false);
    readonly searchError = signal<string | null>(null);
    readonly searched = signal(false);

    private readonly destroy$ = new Subject<void>();

    constructor(
        @Inject(MAT_DIALOG_DATA) data: Movie,
        private dialogRef: MatDialogRef<EditMovieDialogComponent, Movie | null>,
        private tmdbService: TmdbService,
    ) {
        this.movie = structuredClone(data);
        this.movie.titles = sanitizeTitles(this.movie.titles ?? []);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    hasTitle(language: Language): boolean {
        return this.movie.titles.some(t => t.language === language);
    }

    titleValue(language: Language): string {
        return this.movie.titles.find(t => t.language === language)?.value ?? '';
    }

    setTitleValue(language: Language, value: string): void {
        this.movie.titles = sanitizeTitles([
            ...this.movie.titles.filter(t => t.language !== language),
            ...(value.trim() ? [{ language, value }] : []),
        ]);
    }

    isValid(): boolean {
        if (this.movie.originalTitle.trim().length === 0) {
            return false;
        }
        if (this.movie.year == null) {
            return true;
        }
        return Number.isFinite(this.movie.year);
    }

    onUpdateWithTmdb(): void {
        const query =
            this.movie.originalTitle.trim() ||
            this.titleValue('DE').trim() ||
            this.titleValue('EN').trim();
        if (!query) {
            this.searchError.set('Enter a title to search TMDB.');
            this.proposals.set([]);
            this.searched.set(false);
            return;
        }

        this.searchLoading.set(true);
        this.searchError.set(null);
        this.searched.set(true);
        this.proposals.set([]);

        this.tmdbService
            .searchMovies(query)
            .pipe(
                catchError(error => {
                    this.searchError.set(
                        error?.error?.message ??
                            'Search failed. Check that TMDB_API_KEY is configured.',
                    );
                    return of(null);
                }),
                finalize(() => {
                    this.searchLoading.set(false);
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    this.proposals.set(response.results);
                }
            });
    }

    onAcceptProposal(result: MovieTmdb): void {
        const nextOriginal = (result.originalTitle || result.title).trim();
        const nextYear = this.yearFromReleaseDate(result.releaseDate);
        const nextTmdbId = result.id;
        const nextDeTitles = titlesFromLocalized(nextOriginal, result.title);

        const overwritten = this.overwrittenFields(nextOriginal, nextYear, nextTmdbId);
        if (overwritten.length > 0) {
            const confirmed = window.confirm(
                `This will overwrite the current ${overwritten.join(', ')}. Continue?`,
            );
            if (!confirmed) {
                return;
            }
        }

        this.movie.originalTitle = nextOriginal;
        this.movie.year = nextYear;
        this.movie.tmdbId = nextTmdbId;

        const kept = this.movie.titles.filter(t => t.language !== 'DE');
        this.movie.titles = sanitizeTitles([...kept, ...nextDeTitles]);

        this.proposals.set([]);
        this.searched.set(false);
        this.searchError.set(null);
    }

    releaseYear(releaseDate: string): string {
        return releaseDate?.slice(0, 4) || '—';
    }

    onCancel(): void {
        this.dialogRef.close(null);
    }

    onSave(): void {
        if (!this.isValid()) {
            return;
        }
        this.movie.originalTitle = this.movie.originalTitle.trim();
        this.movie.titles = sanitizeTitles(this.movie.titles);
        this.movie.year = this.normalizeYear(this.movie.year);
        this.dialogRef.close(this.movie);
    }

    private normalizeYear(value: unknown): number | undefined {
        if (value == null || value === '') {
            return undefined;
        }
        const year = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
        return Number.isFinite(year) ? year : undefined;
    }

    private yearFromReleaseDate(releaseDate: string): number | undefined {
        if (!releaseDate) {
            return undefined;
        }
        const year = Number.parseInt(releaseDate.slice(0, 4), 10);
        return Number.isFinite(year) ? year : undefined;
    }

    private overwrittenFields(
        nextOriginal: string,
        nextYear: number | undefined,
        nextTmdbId: number,
    ): string[] {
        const fields: string[] = [];
        if (
            this.movie.originalTitle.trim() &&
            normalizeMovieTitle(this.movie.originalTitle) !== normalizeMovieTitle(nextOriginal)
        ) {
            fields.push('original title');
        }
        if (this.movie.year != null && this.movie.year !== nextYear) {
            fields.push('year');
        }
        if (this.movie.tmdbId != null && this.movie.tmdbId !== nextTmdbId) {
            fields.push('TMDB ID');
        }
        return fields;
    }
}
