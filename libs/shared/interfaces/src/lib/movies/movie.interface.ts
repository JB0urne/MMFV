export interface Movie {
    _id: string;
    title: string;
    imdbId: string;
    year: number;
    createdAt?: string | null;
    updatedAt?: string | null;
}
