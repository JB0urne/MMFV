import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MoviesService } from '@mmfv/frontend/data-access/movies';
import { Movie } from '@mmfv/interfaces';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, take, tap } from 'rxjs/operators';
import { HeaderComponent } from './components/header/header.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { FooterComponent } from './components/footer/footer.component';
import { EditMovieDialogComponent } from './features/movies/edit-movie-dialog/edit-movie-dialog.component';
import { ListViewComponent } from './features/movies/list-view/list-view.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        HeaderComponent,
        WelcomeComponent,
        FooterComponent,
        ListViewComponent,
        MatPaginatorModule,
        MatDialogModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    title = 'MMFV';
    angularVersion = '21';

    displayedColumns: string[] = ['title', 'imdbId', 'year', 'actions'];

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

    addRandomMovie() {
        const randomTitles = [
            'The Adventure Begins',
            'Mystery of the Lost City',
            'Echoes of Tomorrow',
            'The Last Stand',
            'Beyond the Horizon',
            'Shadows in the Night',
            'The Quest for Truth',
            'Rising Phoenix',
            'The Silent Storm',
            'Journey to the Stars',
        ];

        const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];
        const randomYear = Math.floor(1950 + 75 * Math.random());
        const randomImdbId = `tt${Math.floor(Math.random() * 9000000 + 1000000)}`;

        const newMovie = {
            title: randomTitle,
            imdbId: randomImdbId,
            year: randomYear,
        };

        this.moviesService
            .createMovie(newMovie)
            .pipe(
                tap(() => {
                    this.loadMovies();
                }),
                catchError(error => {
                    console.error('Error adding random movie:', error);
                    return of(null);
                }),
            )
            .subscribe();
    }

    onEditMovie(movie: Movie) {
        const dialogRef = this.dialog.open(EditMovieDialogComponent, {
            width: '420px',
            data: {
                title: movie.title,
                year: movie.year,
            },
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                console.log('No result');
                return;
            }
            console.log('Result:', result);
            this.moviesService
                .updateMovie(movie._id, result)
                .pipe(
                    tap(updated => {
                        const movies = this.moviesSubject.value;
                        const idx = movies.findIndex(m => m._id === updated._id);
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
}
