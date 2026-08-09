import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MoviesService } from '@mmfv/frontend/data-access/movies';
import { Movie } from '@mmfv/interfaces';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, finalize, map, take, tap } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { EditMovieDialogComponent } from './features/movies/edit-movie-dialog/edit-movie-dialog.component';
import { ImportMoviesDialogComponent } from './features/movies/import-movies-dialog/import-movies-dialog.component';
import { ListViewComponent } from './features/movies/list-view/list-view.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        HeaderComponent,
        ListViewComponent,
        MatPaginatorModule,
        MatDialogModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    @ViewChild(ListViewComponent) listView?: ListViewComponent;

    title = 'MMFV';

    displayedColumns: string[] = ['title', 'tmdbId', 'year', 'actions'];

    // Pagination state
    private pageSizeSubject = new BehaviorSubject<number>(10);
    private pageIndexSubject = new BehaviorSubject<number>(0);
    private moviesSubject = new BehaviorSubject<Movie[]>([]);
    private errorSubject = new BehaviorSubject<string | null>(null);

    pageSize$ = this.pageSizeSubject.asObservable();
    pageIndex$ = this.pageIndexSubject.asObservable();

    movies$: Observable<Movie[]> = this.moviesSubject.asObservable();

    totalMovies$: Observable<number> = this.movies$.pipe(map(movies => movies.length));

    paginatedMovies$: Observable<Movie[]> = combineLatest([this.movies$, this.pageIndex$, this.pageSize$]).pipe(
        map(([movies, pageIndex, pageSize]) => {
            const start = pageIndex * pageSize;
            const end = start + pageSize;
            return movies.slice(start, end);
        }),
    );

    constructor(
        private moviesService: MoviesService,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.loadMovies();
    }

    loadMovies() {
        this.errorSubject.next(null);
        this.moviesService
            .getMovies()
            .pipe(
                take(1),
                catchError(error => {
                    console.error('Error loading movies:', error);
                    return of([]);
                }),
            )
            .subscribe(movies => this.moviesSubject.next(movies));
    }

    onPageChange(event: PageEvent) {
        this.pageIndexSubject.next(event.pageIndex);
        this.pageSizeSubject.next(event.pageSize);
    }

    onAddTmdbMovie(tmdbId: number) {
        this.moviesService
            .addByTmdbId(tmdbId)
            .pipe(
                tap(() => {
                    this.loadMovies();
                }),
                catchError(error => {
                    console.error('Error adding movie from TMDB:', error);
                    return of(null);
                }),
                finalize(() => {
                    this.listView?.clearAddingTmdbId();
                }),
            )
            .subscribe();
    }

    onImportMovies() {
        this.dialog.open(ImportMoviesDialogComponent, {
            width: '720px',
        });
    }

    onEditMovie(movie: Movie) {
        const dialogRef = this.dialog.open(EditMovieDialogComponent, {
            width: '560px',
            data: {
                title: movie.title,
                year: movie.year,
                tmdbId: movie.tmdbId,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            const updatedMovie: Movie = {
                ...movie,
                title: result.title,
                year: result.year,
                tmdbId: result.tmdbId,
            };
            this.moviesService
                .updateMovie(movie.id, updatedMovie)
                .pipe(
                    tap(updated => {
                        const movies = this.moviesSubject.value;
                        const idx = movies.findIndex(m => m.id === updated.id);
                        if (idx >= 0) {
                            const next = [...movies];
                            next[idx] = updated;
                            next.sort((a, b) => a.title.localeCompare(b.title));
                            this.moviesSubject.next(next);
                        } else {
                            this.loadMovies();
                        }
                    }),
                    catchError(error => {
                        console.error('Error updating movie:', error);
                        return of(null);
                    }),
                )
                .subscribe();
        });
    }

    onDeleteMovie(movie: Movie) {
        this.moviesService
            .deleteMovie(movie.id)
            .pipe(
                tap(() => {
                    const movies = this.moviesSubject.value.filter(m => m.id !== movie.id);
                    this.moviesSubject.next(movies);

                    const pageSize = this.pageSizeSubject.value;
                    const pageIndex = this.pageIndexSubject.value;
                    const maxPageIndex = Math.max(0, Math.ceil(movies.length / pageSize) - 1);
                    if (pageIndex > maxPageIndex) {
                        this.pageIndexSubject.next(maxPageIndex);
                    }
                }),
                catchError(error => {
                    console.error('Error deleting movie:', error);
                    return of(null);
                }),
            )
            .subscribe();
    }
}
