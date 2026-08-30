import { Injectable, computed, signal } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MoviesService } from '@mmfv/frontend/data-access/movies';
import { Movie } from '@mmfv/interfaces';
import { displayMovieTitle } from '@mmfv/utils';
import { Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';

export type CatalogViewMode = 'table' | 'list' | 'grid';

const DEFAULT_PAGE_SIZE_BY_VIEW: Record<CatalogViewMode, number> = {
    table: 20,
    list: 10,
    grid: 12,
};

const PAGE_SIZE_OPTIONS_BY_VIEW: Record<CatalogViewMode, number[]> = {
    table: [10, 20, 50],
    list: [5, 10, 20],
    grid: [12, 24, 48],
};

@Injectable({
    providedIn: 'root',
})
export class MoviesCatalogService {
    private readonly moviesState = signal<Movie[]>([]);
    private readonly pageIndexState = signal(0);
    private readonly pageSizeState = signal(DEFAULT_PAGE_SIZE_BY_VIEW.table);
    private readonly viewModeState = signal<CatalogViewMode>('table');

    private readonly pageSizeByView: Record<CatalogViewMode, number> = { ...DEFAULT_PAGE_SIZE_BY_VIEW };
    private readonly pageIndexByView: Record<CatalogViewMode, number> = { table: 0, list: 0, grid: 0 };

    readonly movies = this.moviesState.asReadonly();
    readonly pageIndex = this.pageIndexState.asReadonly();
    readonly pageSize = this.pageSizeState.asReadonly();
    readonly viewMode = this.viewModeState.asReadonly();

    readonly totalMovies = computed(() => this.moviesState().length);

    readonly paginatedMovies = computed(() => {
        const movies = this.moviesState();
        const pageIndex = this.pageIndexState();
        const pageSize = this.pageSizeState();
        const start = pageIndex * pageSize;
        return movies.slice(start, start + pageSize);
    });

    constructor(private readonly moviesService: MoviesService) {}

    get catalog(): Movie[] {
        return this.moviesState();
    }

    get pageSizeOptions(): number[] {
        return PAGE_SIZE_OPTIONS_BY_VIEW[this.viewModeState()];
    }

    load(): void {
        this.moviesService
            .getMovies()
            .pipe(
                take(1),
                catchError(error => {
                    console.error('Error loading movies:', error);
                    return of([]);
                }),
            )
            .subscribe(movies => this.moviesState.set(movies));
    }

    setPage(event: PageEvent): void {
        const mode = this.viewModeState();
        this.pageIndexByView[mode] = event.pageIndex;
        this.pageSizeByView[mode] = event.pageSize;
        this.pageIndexState.set(event.pageIndex);
        this.pageSizeState.set(event.pageSize);
    }

    setViewMode(mode: CatalogViewMode): void {
        if (this.viewModeState() === mode) {
            return;
        }
        this.viewModeState.set(mode);
        this.pageIndexByView[mode] = 0;
        this.pageIndexState.set(0);
        this.pageSizeState.set(this.pageSizeByView[mode]);
    }

    addFromTmdb(tmdbId: number): Observable<Movie | null> {
        return this.moviesService.addByTmdbId(tmdbId).pipe(
            tap(added => this.upsertMovie(added)),
            map(added => added),
            catchError(error => {
                console.error('Error adding movie from TMDB:', error);
                return of(null);
            }),
        );
    }

    updateMovie(id: string, movie: Movie): Observable<Movie | null> {
        return this.moviesService.updateMovie(id, movie).pipe(
            tap(updated => {
                const movies = this.moviesState();
                const idx = movies.findIndex(m => m.id === updated.id);
                if (idx >= 0) {
                    const next = [...movies];
                    next[idx] = updated;
                    this.moviesState.set(this.sortMovies(next));
                } else {
                    this.load();
                }
            }),
            catchError(error => {
                console.error('Error updating movie:', error);
                return of(null);
            }),
        );
    }

    deleteMovie(movie: Movie): Observable<void | null> {
        return this.moviesService.deleteMovie(movie.id).pipe(
            tap(() => {
                const movies = this.moviesState().filter(m => m.id !== movie.id);
                this.moviesState.set(movies);

                const mode = this.viewModeState();
                const pageSize = this.pageSizeByView[mode];
                const pageIndex = this.pageIndexByView[mode];
                const maxPageIndex = Math.max(0, Math.ceil(movies.length / pageSize) - 1);
                if (pageIndex > maxPageIndex) {
                    this.pageIndexByView[mode] = maxPageIndex;
                    this.pageIndexState.set(maxPageIndex);
                }
            }),
            catchError(error => {
                console.error('Error deleting movie:', error);
                return of(null);
            }),
        );
    }

    private upsertMovie(added: Movie): void {
        const movies = this.moviesState();
        const idx = movies.findIndex(
            m => m.id === added.id || (added.tmdbId != null && m.tmdbId === added.tmdbId),
        );
        if (idx >= 0) {
            const next = [...movies];
            next[idx] = added;
            this.moviesState.set(this.sortMovies(next));
            return;
        }
        this.moviesState.set(this.sortMovies([...movies, added]));
    }

    private sortMovies(movies: Movie[]): Movie[] {
        return [...movies].sort((a, b) => displayMovieTitle(a).localeCompare(displayMovieTitle(b)));
    }
}
