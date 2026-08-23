import type { Movie, TranslationObject } from '@mmfv/interfaces';
import {
    displayMovieTitle,
    movieMatchKeys,
    normalizeMovieTitle,
    sanitizeTitles,
    titlesFromLocalized,
} from './movie-titles.util';

describe('normalizeMovieTitle', () => {
    it('trims, collapses whitespace, and lowercases', () => {
        expect(normalizeMovieTitle('  The   Matrix  ')).toBe('the matrix');
    });
});

describe('displayMovieTitle', () => {
    it('prefers a non-empty German title', () => {
        const movie: Pick<Movie, 'originalTitle' | 'titles'> = {
            originalTitle: 'Inception',
            titles: [{ language: 'DE', value: 'Inception DE' }],
        };
        expect(displayMovieTitle(movie)).toBe('Inception DE');
    });

    it('falls back to originalTitle when DE is missing or blank', () => {
        expect(
            displayMovieTitle({
                originalTitle: 'Inception',
                titles: [{ language: 'EN', value: 'Inception' }],
            }),
        ).toBe('Inception');
        expect(
            displayMovieTitle({
                originalTitle: 'Inception',
                titles: [{ language: 'DE', value: '   ' }],
            }),
        ).toBe('Inception');
    });
});

describe('sanitizeTitles', () => {
    it('returns [] for non-arrays', () => {
        expect(sanitizeTitles(null as unknown as TranslationObject[])).toEqual([]);
        expect(sanitizeTitles(undefined as unknown as TranslationObject[])).toEqual([]);
    });

    it('drops empty values and invalid languages', () => {
        expect(
            sanitizeTitles([
                { language: 'DE', value: '  ' },
                { language: 'XX' as 'DE', value: 'Nope' },
                { language: 'EN', value: 'Hello' },
            ]),
        ).toEqual([{ language: 'EN', value: 'Hello' }]);
    });

    it('keeps the last value when a language is repeated', () => {
        expect(
            sanitizeTitles([
                { language: 'DE', value: 'Eins' },
                { language: 'DE', value: 'Zwei' },
            ]),
        ).toEqual([{ language: 'DE', value: 'Zwei' }]);
    });

    it('trims values', () => {
        expect(sanitizeTitles([{ language: 'DE', value: '  Titel  ' }])).toEqual([
            { language: 'DE', value: 'Titel' },
        ]);
    });
});

describe('titlesFromLocalized', () => {
    it('returns [] when localized equals original (ignoring case/space)', () => {
        expect(titlesFromLocalized('The Matrix', '  the   matrix  ')).toEqual([]);
        expect(titlesFromLocalized('Matrix', '')).toEqual([]);
    });

    it('returns a DE title when localized differs', () => {
        expect(titlesFromLocalized('Inception', 'Anfang')).toEqual([
            { language: 'DE', value: 'Anfang' },
        ]);
    });
});

describe('movieMatchKeys', () => {
    it('collects normalized original and translation keys', () => {
        const keys = movieMatchKeys({
            originalTitle: 'Inception',
            titles: [
                { language: 'DE', value: 'Inception' },
                { language: 'EN', value: '  Start  ' },
            ],
        });
        expect(keys.sort()).toEqual(['inception', 'start']);
    });
});
