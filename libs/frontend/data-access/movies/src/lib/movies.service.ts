import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { Movie } from '@mmfv/interfaces';

@Injectable({
    providedIn: 'root',
})
export class MoviesService {
    private readonly endpointUrl = '/api/movies';

    constructor(private http: HttpClient) {}

    getMovies(params?: HttpParams): Observable<Movie[]> {
        return this.http.get<Movie[]>(this.endpointUrl, { params }).pipe(
            timeout(10000), // 10 second timeout
            catchError(error => {
                console.error('Error loading movies:', error);
                return of([]);
            }),
        );
    }
}
