import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { CatalogViewMode, MoviesCatalogService } from '@mmfv/frontend/services/movies';
import { Movie } from '@mmfv/interfaces';
import { EditMovieDialogComponent } from '../edit-movie-dialog/edit-movie-dialog.component';
import { ImportMoviesDialogComponent, ImportMoviesDialogData } from '../import-movies-dialog/import-movies-dialog.component';
import { MovieGridViewComponent } from '../movie-grid-view/movie-grid-view.component';
import { MovieListViewComponent } from '../movie-list-view/movie-list-view.component';
import { MovieTableViewComponent } from '../movie-table-view/movie-table-view.component';
import { TmdbSearchPanelComponent } from '../tmdb-search-panel/tmdb-search-panel.component';

@Component({
    selector: 'app-movies-catalog',
    standalone: true,
    imports: [
        MatDialogModule,
        MatPaginatorModule,
        TmdbSearchPanelComponent,
        MovieTableViewComponent,
        MovieListViewComponent,
        MovieGridViewComponent,
    ],
    templateUrl: './movies-catalog.component.html',
    styleUrl: './movies-catalog.component.css',
})
export class MoviesCatalogComponent implements OnInit {
    readonly displayedColumns: string[] = ['title', 'tmdbId', 'year', 'actions'];

    constructor(
        readonly catalog: MoviesCatalogService,
        private readonly dialog: MatDialog,
    ) {}

    ngOnInit(): void {
        this.catalog.load();
    }

    onViewModeChange(mode: CatalogViewMode): void {
        this.catalog.setViewMode(mode);
    }

    onPageChange(event: PageEvent): void {
        this.catalog.setPage(event);
    }

    onImportMovies(): void {
        const dialogRef = this.dialog.open(ImportMoviesDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            data: {
                catalog: this.catalog.catalog,
            } satisfies ImportMoviesDialogData,
        });

        dialogRef.afterClosed().subscribe(imported => {
            if (imported) {
                this.catalog.load();
            }
        });
    }

    onEditMovie(movie: Movie): void {
        const dialogRef = this.dialog.open(EditMovieDialogComponent, {
            width: '560px',
            data: movie,
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) {
                return;
            }
            this.catalog.updateMovie(movie.id, result).subscribe();
        });
    }

    onDeleteMovie(movie: Movie): void {
        this.catalog.deleteMovie(movie).subscribe();
    }
}
