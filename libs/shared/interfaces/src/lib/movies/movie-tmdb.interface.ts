/** A movie result from TMDB search (`GET /3/search/movie`). */
export interface MovieTmdb {
    id: number;
    title: string;
    originalTitle: string;
    overview: string;
    releaseDate: string;
    posterPath: string | null;
    backdropPath: string | null;
    voteAverage: number;
    voteCount: number;
    popularity: number;
    originalLanguage: string;
    adult: boolean;
}

export interface MovieTmdbSearchResponse {
    page: number;
    totalPages: number;
    totalResults: number;
    results: MovieTmdb[];
}
