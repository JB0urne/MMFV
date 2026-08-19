import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TMDB_SEARCH_LANGUAGE } from '@mmfv/constants';
import type { Movie, MovieTmdb, MovieTmdbSearchResponse } from '@mmfv/interfaces';
import { titlesFromLocalized } from '@mmfv/utils';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

type TmdbSearchMovieRaw = {
    id: number;
    title: string;
    original_title: string;
    overview: string;
    release_date: string;
    poster_path: string | null;
    backdrop_path: string | null;
    vote_average: number;
    vote_count: number;
    popularity: number;
    original_language: string;
    adult: boolean;
};

type TmdbSearchResponseRaw = {
    page: number;
    total_pages: number;
    total_results: number;
    results: TmdbSearchMovieRaw[];
};

type TmdbMovieDetailsRaw = {
    id: number;
    title: string;
    original_title: string;
    release_date: string;
};

@Injectable()
export class TmdbService {
    constructor(private readonly configService: ConfigService) {}

    private get accessToken(): string {
        const token = this.configService.get<string>('TMDB_API_KEY')?.trim();
        if (!token) {
            throw new ServiceUnavailableException(
                'TMDB_API_KEY is not configured. Copy example.env to .env and set your API Read Access Token.',
            );
        }
        return token;
    }

    async searchMovies(query: string, page = 1): Promise<MovieTmdbSearchResponse> {
        const url = new URL(`${TMDB_BASE_URL}/search/movie`);
        url.searchParams.set('query', query);
        url.searchParams.set('page', String(page));
        url.searchParams.set('include_adult', 'false');
        // Localized `title` for auto-match; search still finds original/alt titles.
        url.searchParams.set('language', TMDB_SEARCH_LANGUAGE);

        const response = await this.fetchOnce(url, 'TMDB search');
        const data = (await response.json()) as TmdbSearchResponseRaw;
        return {
            page: data.page,
            totalPages: data.total_pages,
            totalResults: data.total_results,
            results: data.results.map(mapMovieTmdb),
        };
    }

    async getMovie(tmdbId: number): Promise<Movie> {
        const url = new URL(`${TMDB_BASE_URL}/movie/${tmdbId}`);
        url.searchParams.set('language', TMDB_SEARCH_LANGUAGE);
        const response = await this.fetchOnce(url, 'TMDB movie lookup');
        const data = (await response.json()) as TmdbMovieDetailsRaw;
        return mapTmdbDetailsToMovie(data);
    }

    private async fetchOnce(url: URL, label: string): Promise<Response> {
        let response: Response;
        try {
            response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    Accept: 'application/json',
                },
            });
        } catch {
            throw new ServiceUnavailableException(`${label} failed (network error)`);
        }

        if (!response.ok) {
            throw new ServiceUnavailableException(`${label} failed (${response.status})`);
        }

        return response;
    }
}

/** Raw TMDB search hit → camelCase `MovieTmdb` for the search API. */
function mapMovieTmdb(raw: TmdbSearchMovieRaw): MovieTmdb {
    return {
        id: raw.id,
        title: raw.title,
        originalTitle: raw.original_title,
        overview: raw.overview,
        releaseDate: raw.release_date,
        posterPath: raw.poster_path,
        backdropPath: raw.backdrop_path,
        voteAverage: raw.vote_average,
        voteCount: raw.vote_count,
        popularity: raw.popularity,
        originalLanguage: raw.original_language,
        adult: raw.adult,
    };
}

/** TMDB `/movie/{id}` details → app `Movie` (local `id` assigned on insert). */
function mapTmdbDetailsToMovie(raw: TmdbMovieDetailsRaw): Movie {
    const year = raw.release_date ? Number.parseInt(raw.release_date.slice(0, 4), 10) : 0;
    const originalTitle = (raw.original_title || raw.title || '').trim();
    return {
        id: '',
        originalTitle,
        titles: titlesFromLocalized(originalTitle, raw.title ?? ''),
        tmdbId: raw.id,
        year: Number.isFinite(year) ? year : 0,
    };
}
