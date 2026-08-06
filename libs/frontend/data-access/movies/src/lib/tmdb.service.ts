import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MovieTmdbSearchResponse } from '@mmfv/interfaces';

@Injectable({
    providedIn: 'root',
})
export class TmdbService {
    private readonly searchUrl = '/api/tmdb/search/movie';

    constructor(private http: HttpClient) {}

    searchMovies(query: string, page = 1): Observable<MovieTmdbSearchResponse> {
        const params = new HttpParams().set('query', query).set('page', String(page));
        return this.http.get<MovieTmdbSearchResponse>(this.searchUrl, { params }).pipe(
            catchError(error => {
                console.error('Error searching TMDB:', error);
                throw error;
            }),
        );
    }
}
