import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Movie } from '@mmfv/interfaces';
import { displayMovieTitle } from '@mmfv/utils';

@Component({
    selector: 'app-movie-grid-view',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
    templateUrl: './movie-grid-view.component.html',
    styleUrl: './movie-grid-view.component.css',
})
export class MovieGridViewComponent {
    @Input({ required: true }) movies!: Movie[];

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
