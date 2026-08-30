import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Movie } from '@mmfv/interfaces';
import { displayMovieTitle } from '@mmfv/utils';

@Component({
    selector: 'app-movie-table-view',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './movie-table-view.component.html',
    styleUrl: './movie-table-view.component.css',
})
export class MovieTableViewComponent {
    @Input({ required: true }) movies!: Movie[];
    @Input() displayedColumns: string[] = ['title', 'tmdbId', 'year', 'actions'];

    @Output() editMovie = new EventEmitter<Movie>();
    @Output() deleteMovie = new EventEmitter<Movie>();

    readonly displayTitle = displayMovieTitle;

    onEditMovie(movie: Movie): void {
        this.editMovie.emit(movie);
    }

    onDeleteMovie(movie: Movie): void {
        this.deleteMovie.emit(movie);
    }
}
