export interface BaseMovie {
    id: string;
    title: string;
}

export interface Movie extends BaseMovie {
    imdbId?: string;
    year?: number;
    createdAt?: string;
    updatedAt?: string;
}

export type StrictMovie = Required<Movie>
