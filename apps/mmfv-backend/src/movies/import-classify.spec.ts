import type { MovieTmdb } from '@mmfv/interfaces';
import { classifyImportTitle, yearFromReleaseDate } from './import-classify';

function tmdb(partial: Partial<MovieTmdb> & Pick<MovieTmdb, 'id' | 'title' | 'originalTitle'>): MovieTmdb {
    return {
        overview: '',
        releaseDate: '2010-07-16',
        posterPath: null,
        backdropPath: null,
        voteAverage: 0,
        voteCount: 0,
        popularity: 0,
        originalLanguage: 'en',
        adult: false,
        ...partial,
    };
}

describe('yearFromReleaseDate', () => {
    it('parses a YYYY prefix', () => {
        expect(yearFromReleaseDate('2010-07-16')).toBe(2010);
    });

    it('returns 0 for missing or invalid values', () => {
        expect(yearFromReleaseDate(undefined)).toBe(0);
        expect(yearFromReleaseDate('')).toBe(0);
        expect(yearFromReleaseDate('abcd')).toBe(0);
    });
});

describe('classifyImportTitle', () => {
    it('returns none for empty query or empty results', () => {
        expect(classifyImportTitle('   ', [])).toEqual({ status: 'none' });
        expect(classifyImportTitle('Inception', [])).toEqual({ status: 'none' });
    });

    it('returns auto for a single exact title or originalTitle match', () => {
        const match = tmdb({ id: 1, title: 'Inception', originalTitle: 'Inception' });
        expect(classifyImportTitle(' inception ', [match])).toEqual({
            status: 'auto',
            match,
        });

        const byOriginal = tmdb({ id: 2, title: 'Anfang', originalTitle: 'Inception' });
        expect(classifyImportTitle('Inception', [byOriginal])).toEqual({
            status: 'auto',
            match: byOriginal,
        });
    });

    it('returns ambiguous when multiple exact matches exist', () => {
        const a = tmdb({ id: 1, title: 'Dune', originalTitle: 'Dune' });
        const b = tmdb({ id: 2, title: 'Dune', originalTitle: 'Dune (other)' });
        expect(classifyImportTitle('Dune', [a, b])).toEqual({ status: 'ambiguous' });
    });

    it('returns ambiguous when results exist but none match exactly', () => {
        const near = tmdb({ id: 1, title: 'Inception Part 2', originalTitle: 'Inception 2' });
        expect(classifyImportTitle('Inception', [near])).toEqual({ status: 'ambiguous' });
    });
});
