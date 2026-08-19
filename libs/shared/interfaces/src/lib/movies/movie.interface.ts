import type { TranslationObject } from '../i18n/translation.interface';

export interface BaseMovie {
    id: string;
    originalTitle: string;
    titles: TranslationObject[];
}

export interface Movie extends BaseMovie {
    tmdbId?: number;
    year?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type StrictMovie = Required<Movie>;
