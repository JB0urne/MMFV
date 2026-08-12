import { Movie } from './movie.interface';
import { MovieTmdb } from './movie-tmdb.interface';

export type MovieImportPreviewStatus = 'auto' | 'ambiguous' | 'none' | 'exists';

export interface MovieImportPreviewRequest {
    titles: string[];
}

export interface MovieImportPreviewItem {
    input: string;
    status: MovieImportPreviewStatus;
    candidates: MovieTmdb[];
    chosenTmdbId?: number;
    chosenTitle?: string;
    chosenYear?: number;
}

export interface MovieImportPreviewResponse {
    items: MovieImportPreviewItem[];
}

export type MovieImportCommitItem =
    | { type: 'tmdb'; tmdbId: number }
    | { type: 'title'; title: string };

export interface MovieImportCommitRequest {
    items: MovieImportCommitItem[];
}

export interface MovieImportCommitResponse {
    added: Movie[];
    skipped: number;
}
