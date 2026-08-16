import type { MovieTmdb, MovieImportPreviewStatus } from '@mmfv/interfaces';

export function normalizeImportTitle(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function yearFromReleaseDate(releaseDate: string | undefined): number {
    const year = releaseDate ? Number.parseInt(releaseDate.slice(0, 4), 10) : 0;
    return Number.isFinite(year) ? year : 0;
}

export type ImportClassification = {
    status: Exclude<MovieImportPreviewStatus, 'exists'>;
    match?: MovieTmdb;
};

/**
 * Exact case-insensitive match on TMDB `title` or `originalTitle`.
 * With search `language` (e.g. de-DE), `title` is the translated name when available.
 * Multiple exact hits → ambiguous. Zero results → none.
 */
export function classifyImportTitle(query: string, results: MovieTmdb[]): ImportClassification {
    const normalized = normalizeImportTitle(query);
    if (!normalized) {
        return { status: 'none' };
    }

    const exactMatches = results.filter(result => {
        return (
            normalizeImportTitle(result.title) === normalized ||
            normalizeImportTitle(result.originalTitle) === normalized
        );
    });

    if (exactMatches.length === 1) {
        return { status: 'auto', match: exactMatches[0] };
    }

    if (results.length === 0) {
        return { status: 'none' };
    }

    return { status: 'ambiguous' };
}
