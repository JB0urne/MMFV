import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Movie } from '@mmfv/interfaces';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-list-view',
    standalone: true,
    imports: [CommonModule, MatTableModule, MatPaginatorModule, MatButtonModule],
    templateUrl: './list-view.component.html',
    styleUrl: './list-view.component.css',
})
export class ListViewComponent {
    @Input() paginatedMovies$!: Observable<Movie[]>;
    @Input() totalMovies$!: Observable<number>;
    @Input() pageSize$!: Observable<number>;
    @Input() pageIndex$!: Observable<number>;
    @Input() displayedColumns: string[] = ['title', 'tmdbId', 'year'];

    @Output() pageChange = new EventEmitter<PageEvent>();
    @Output() addRandomMovie = new EventEmitter<void>();
    @Output() editMovie = new EventEmitter<Movie>();

    onPageChange(event: PageEvent) {
        this.pageChange.emit(event);
    }

    onAddRandomMovie() {
        this.addRandomMovie.emit();
    }

    onEditMovie(movie: Movie) {
        this.editMovie.emit(movie);
    }
}
