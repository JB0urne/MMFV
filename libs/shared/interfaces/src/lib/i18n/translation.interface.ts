/** Supported UI/content languages (not TMDB original-language codes). */
export type Language = 'DE' | 'EN';

export interface TranslationObject {
    value: string;
    language: Language;
}

export function isLanguage(value: unknown): value is Language {
    return value === 'DE' || value === 'EN';
}
