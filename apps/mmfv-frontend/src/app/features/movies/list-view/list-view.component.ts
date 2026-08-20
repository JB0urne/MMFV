import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TmdbService } from '@mmfv/frontend/data-access/movies';
import { Movie, MovieTmdb } from '@mmfv/interfaces';
import { displayMovieTitle } from '@mmfv/utils';
import { Observable, Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'app-list-view',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatTooltipModule,
    ],
    templateUrl: './list-view.component.html',
    styleUrl: './list-view.component.css',
})
export class ListViewComponent implements OnDestroy {
    @Input() paginatedMovies$!: Observable<Movie[]>;
    @Input() totalMovies$!: Observable<number>;
    @Input() pageSize$!: Observable<number>;
    @Input() pageIndex$!: Observable<number>;
    @Input() displayedColumns: string[] = ['title', 'tmdbId', 'year'];

    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() addTmdbMovie = new EventEmitter<number>();
    @Output() editMovie = new EventEmitter<Movie>();
    @Output() deleteMovie = new EventEmitter<Movie>();
    @Output() importClick = new EventEmitter<void>();

    readonly displayTitle = displayMovieTitle;

    searchQuery = '';
    searchResults: MovieTmdb[] = [];
    searchLoading = false;
    searchError: string | null = null;
    addingTmdbId: number | null = null;

    private readonly searchInput$ = new Subject<string>();
    private readonly destroy$ = new Subject<void>();

    constructor(private tmdbService: TmdbService) {
        this.searchInput$
            .pipe(
                debounceTime(350),
                distinctUntilChanged(),
                tap(query => {
                    if (!query.trim()) {
                        this.searchResults = [];
                        this.searchError = null;
                        this.searchLoading = false;
                    }
                }),
                switchMap(query => {
                    const trimmed = query.trim();
                    if (!trimmed) {
                        return of(null);
                    }
                    this.searchLoading = true;
                    this.searchError = null;
                    return this.tmdbService.searchMovies(trimmed).pipe(
                        catchError(error => {
                            this.searchError =
                                error?.error?.message ?? 'Search failed. Check that TMDB_API_KEY is configured.';
                            return of(null);
                        }),
                        finalize(() => {
                            this.searchLoading = false;
                        }),
                    );
                }),
                takeUntil(this.destroy$),
            )
            .subscribe(response => {
                if (response) {
                    this.searchResults = response.results;
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSearchQueryChange(): void {
        this.searchInput$.next(this.searchQuery);
    }

    onPageChange(event: PageEvent) {
        this.pageChange.emit(event);
    }

    onImportClick(): void {
        this.importClick.emit();
    }

    onAddTmdbMovie(result: MovieTmdb) {
        this.addingTmdbId = result.id;
        this.addTmdbMovie.emit(result.id);
    }

    clearAddingTmdbId(): void {
        this.addingTmdbId = null;
    }

    onEditMovie(movie: Movie) {
        this.editMovie.emit(movie);
    }

    onDeleteMovie(movie: Movie) {
        this.deleteMovie.emit(movie);
    }

    releaseYear(releaseDate: string): string {
        return releaseDate?.slice(0, 4) ?? '—';
    }
}
