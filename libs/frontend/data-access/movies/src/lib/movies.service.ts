import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
    Movie,
    MovieImportCommitRequest,
    MovieImportCommitResponse,
    MovieImportPreviewRequest,
    MovieImportPreviewResponse,
} from '@mmfv/interfaces';

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

    addMovie(movie: { title: string; tmdbId: number; year: number }): Observable<Movie> {
        return this.http.post<Movie>(this.endpointUrl, movie).pipe(
            catchError(error => {
                console.error('Error adding movie:', error);
                throw error;
            }),
        );
    }

    addByTmdbId(tmdbId: number): Observable<Movie> {
        return this.http.post<Movie>(`${this.endpointUrl}/from-tmdb`, { tmdbId }).pipe(
            catchError(error => {
                console.error('Error adding movie from TMDB:', error);
                throw error;
            }),
        );
    }

    previewImport(titles: string[]): Observable<MovieImportPreviewResponse> {
        const body: MovieImportPreviewRequest = { titles };
        return this.http
            .post<MovieImportPreviewResponse>(`${this.endpointUrl}/import/preview`, body)
            .pipe(
                catchError(error => {
                    console.error('Error previewing movie import:', error);
                    throw error;
                }),
            );
    }

    commitImport(body: MovieImportCommitRequest): Observable<MovieImportCommitResponse> {
        return this.http
            .post<MovieImportCommitResponse>(`${this.endpointUrl}/import/commit`, body)
            .pipe(
                catchError(error => {
                    console.error('Error committing movie import:', error);
                    throw error;
                }),
            );
    }

    updateMovie(id: string, movie: Movie): Observable<Movie> {
        const url = `${this.endpointUrl}/${encodeURIComponent(id)}`;
        return this.http.put<Movie>(url, movie).pipe(
            catchError(error => {
                console.error('Error updating movie:', error);
                throw error;
            }),
        );
    }

    deleteMovie(id: string): Observable<void> {
        const url = `${this.endpointUrl}/${encodeURIComponent(id)}`;
        return this.http.delete<void>(url).pipe(
            catchError(error => {
                console.error('Error deleting movie:', error);
                throw error;
            }),
        );
    }
}
