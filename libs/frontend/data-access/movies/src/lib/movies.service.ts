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
            catchError(error => {
                console.error('Error loading movies:', error);
                return of([]);
            }),
        );
    }

    createMovie(movie: { title: string; imdbId: string; year: number }): Observable<Movie> {
        return this.http.post<Movie>(this.endpointUrl, movie).pipe(
            catchError(error => {
                console.error('Error creating movie:', error);
                throw error;
            }),
        );
    }

    updateMovie(id: string, movie: Partial<Movie>): Observable<Movie> {
        const url = `${this.endpointUrl}/${encodeURIComponent(id)}`;
        return this.http.put<Movie>(url, movie).pipe(
            catchError(error => {
                console.error('Error updating movie:', error);
                throw error;
            }),
        );
    }
}
