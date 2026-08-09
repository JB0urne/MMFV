import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TmdbService } from '@mmfv/frontend/data-access/movies';
import { MovieTmdb } from '@mmfv/interfaces';
import { Subject, of } from 'rxjs';
import { catchError, finalize, takeUntil } from 'rxjs/operators';

type EditMovieDialogData = {
    title: string;
    year?: number;
    tmdbId?: number;
};

type EditMovieDialogResult = {
    title: string;
    year: number;
    tmdbId?: number;
};

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
    title: string;
    year: number;
    tmdbId?: number;

    proposals: MovieTmdb[] = [];
    searchLoading = false;
    searchError: string | null = null;
    searched = false;

    private readonly destroy$ = new Subject<void>();

    constructor(
        @Inject(MAT_DIALOG_DATA) data: EditMovieDialogData,
        private dialogRef: MatDialogRef<EditMovieDialogComponent, EditMovieDialogResult | null>,
        private tmdbService: TmdbService,
    ) {
        this.title = data.title;
        this.year = data.year ?? 0;
        this.tmdbId = data.tmdbId;
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    isValid(): boolean {
        return this.title.trim().length > 0 && Number.isFinite(this.year);
    }

    onUpdateWithTmdb(): void {
        const query = this.title.trim();
        if (!query) {
            this.searchError = 'Enter a title to search TMDB.';
            this.proposals = [];
            this.searched = false;
            return;
        }

        this.searchLoading = true;
        this.searchError = null;
        this.searched = true;
        this.proposals = [];

        this.tmdbService
            .searchMovies(query)
            .pipe(
                catchError(error => {
                    this.searchError =
                        error?.error?.message ?? 'Search failed. Check that TMDB_API_KEY is configured.';
                    return of(null);
                }),
                finalize(() => {
                    this.searchLoading = false;
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    this.proposals = response.results;
                }
            });
    }

    onAcceptProposal(result: MovieTmdb): void {
        const nextTitle = result.title.trim();
        const nextYear = this.yearFromReleaseDate(result.releaseDate);
        const nextTmdbId = result.id;

        const overwritten = this.overwrittenFields(nextTitle, nextYear, nextTmdbId);
        if (overwritten.length > 0) {
            const confirmed = window.confirm(
                `This will overwrite the current ${overwritten.join(', ')}. Continue?`,
            );
            if (!confirmed) {
                return;
            }
        }

        this.title = nextTitle;
        this.year = nextYear;
        this.tmdbId = nextTmdbId;
        this.proposals = [];
        this.searched = false;
        this.searchError = null;
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
        this.dialogRef.close({
            title: this.title.trim(),
            year: this.year,
            tmdbId: this.tmdbId,
        });
    }

    private yearFromReleaseDate(releaseDate: string): number {
        const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : 0;
        return Number.isFinite(year) ? year : 0;
    }

    private overwrittenFields(nextTitle: string, nextYear: number, nextTmdbId: number): string[] {
        const fields: string[] = [];
        if (this.title.trim() && this.title.trim() !== nextTitle) {
            fields.push('title');
        }
        if (Number.isFinite(this.year) && this.year !== 0 && this.year !== nextYear) {
            fields.push('year');
        }
        if (this.tmdbId != null && this.tmdbId !== nextTmdbId) {
            fields.push('TMDB ID');
        }
        return fields;
    }
}
