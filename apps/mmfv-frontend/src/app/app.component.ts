import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { Observable, BehaviorSubject, combineLatest, of } from 'rxjs';
import { map, startWith, catchError, shareReplay, switchMap } from 'rxjs/operators';
import { MoviesService } from '@mmfv/frontend/data-access/movies';
import { Movie } from '@mmfv/frontend/data-access/movies';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'MMFV';
  angularVersion = '21';

  displayedColumns: string[] = ['title', 'imdbId', 'year'];
  
  // Pagination state
  private pageSizeSubject = new BehaviorSubject<number>(10);
  private pageIndexSubject = new BehaviorSubject<number>(0);
  private reloadTrigger$ = new BehaviorSubject<void>(undefined);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  pageSize$ = this.pageSizeSubject.asObservable();
  pageIndex$ = this.pageIndexSubject.asObservable();

  // Movies observable - reloads when trigger emits
  movies$: Observable<Movie[]> = this.reloadTrigger$.pipe(
    switchMap(() => 
      this.moviesService.getMovies().pipe(
        catchError((error) => {
          console.error('Error loading movies:', error);
          return of([]);
        })
      )
    ),
    shareReplay(1)
  );

  totalMovies$: Observable<number> = this.movies$.pipe(
    map((movies) => movies.length)
  );

  paginatedMovies$: Observable<Movie[]> = combineLatest([
    this.movies$,
    this.pageIndex$,
    this.pageSize$
  ]).pipe(
    map(([movies, pageIndex, pageSize]) => {
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      return movies.slice(start, end);
    })
  );

  constructor(private moviesService: MoviesService) {}

  ngOnInit() {
    // Trigger initial load
    this.reloadTrigger$.next();
  }

  loadMovies() {
    // Reset error and trigger reload
    this.errorSubject.next(null);
    this.reloadTrigger$.next();
  }

  onPageChange(event: PageEvent) {
    this.pageIndexSubject.next(event.pageIndex);
    this.pageSizeSubject.next(event.pageSize);
  }
}
