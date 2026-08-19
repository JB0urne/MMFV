import type { Language, Movie, TranslationObject } from '@mmfv/interfaces';
import { isLanguage } from '@mmfv/interfaces';

export function normalizeMovieTitle(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** List / sort label: German translation if present, otherwise original. */
export function displayMovieTitle(movie: Pick<Movie, 'originalTitle' | 'titles'>): string {
    const de = movie.titles.find(t => t.language === 'DE')?.value?.trim();
    return de || movie.originalTitle;
}

/**
 * Enforce unique language per movie, drop empty values.
 * Later entries for the same language win.
 */
export function sanitizeTitles(titles: TranslationObject[]): TranslationObject[] {
    if (!Array.isArray(titles)) {
        return [];
    }
    const byLang = new Map<Language, string>();
    for (const entry of titles) {
        if (!entry || !isLanguage(entry.language)) {
            continue;
        }
        const value = typeof entry.value === 'string' ? entry.value.trim() : '';
        if (!value) {
            continue;
        }
        byLang.set(entry.language, value);
    }
    return [...byLang.entries()].map(([language, value]) => ({ language, value }));
}

/** Build DE (or other) titles when localized TMDB `title` differs from `original_title`. */
export function titlesFromLocalized(
    originalTitle: string,
    localizedTitle: string,
    language: Language = 'DE',
): TranslationObject[] {
    const original = originalTitle.trim();
    const localized = localizedTitle.trim();
    if (!localized || normalizeMovieTitle(localized) === normalizeMovieTitle(original)) {
        return [];
    }
    return [{ language, value: localized }];
}

/** Normalized keys for catalog / import dedup (original + all translations). */
export function movieMatchKeys(movie: Pick<Movie, 'originalTitle' | 'titles'>): string[] {
    const keys = new Set<string>();
    const original = normalizeMovieTitle(movie.originalTitle);
    if (original) {
        keys.add(original);
    }
    for (const entry of movie.titles) {
        const key = normalizeMovieTitle(entry.value);
        if (key) {
            keys.add(key);
        }
    }
    return [...keys];
}
