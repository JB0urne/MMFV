import { CommonModule } from '@angular/common';
import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TmdbService } from '@mmfv/frontend/data-access/movies';
import { MoviesCatalogService } from '@mmfv/frontend/services/movies';
import { MovieTmdb } from '@mmfv/interfaces';
import { firstValueFrom, Subject, of } from 'rxjs';
import {
    catchError,
    debounceTime,
    distinctUntilChanged,
    finalize,
    switchMap,
    takeUntil,
    tap,
} from 'rxjs/operators';

@Component({
    selector: 'app-tmdb-search-panel',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './tmdb-search-panel.component.html',
    styleUrl: './tmdb-search-panel.component.css',
})
export class TmdbSearchPanelComponent implements OnDestroy {
    readonly searchQuery = signal('');
    readonly searchResults = signal<MovieTmdb[]>([]);
    readonly searchLoading = signal(false);
    readonly searchError = signal<string | null>(null);
    readonly addingTmdbId = signal<number | null>(null);

    private readonly searchInput$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly tmdbService: TmdbService,
        private readonly catalog: MoviesCatalogService,
    ) {
        this.searchInput$
            .pipe(
                debounceTime(350),
                distinctUntilChanged(),
                tap(query => {
                    if (!query.trim()) {
                        this.searchResults.set([]);
                        this.searchError.set(null);
                        this.searchLoading.set(false);
                    }
                }),
                switchMap(query => {
                    const trimmed = query.trim();
                    if (!trimmed) {
                        return of(null);
                    }
                    this.searchLoading.set(true);
                    this.searchError.set(null);
                    return this.tmdbService.searchMovies(trimmed).pipe(
                        catchError(error => {
                            this.searchError.set(
                                error?.error?.message ?? 'Search failed. Check that TMDB_API_KEY is configured.',
                            );
                            return of(null);
                        }),
                        finalize(() => {
                            this.searchLoading.set(false);
                        }),
                    );
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    this.searchResults.set(response.results);
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchQueryChange(query: string): void {
        this.searchQuery.set(query);
        this.searchInput$.next(query);
    }

    async onAddMovie(result: MovieTmdb): Promise<void> {
        this.addingTmdbId.set(result.id);
        try {
            await firstValueFrom(this.catalog.addFromTmdb(result.id));
        } catch (error) {
            console.error('Error adding movie from TMDB:', error);
        } finally {
            this.addingTmdbId.set(null);
        }
    }

    releaseYear(releaseDate: string): string {
        return releaseDate?.slice(0, 4) ?? '—';
    }
}
