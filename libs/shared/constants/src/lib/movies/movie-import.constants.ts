/** Max titles resolved per `POST /api/movies/import/preview` call. */
export const MOVIE_IMPORT_BATCH_SIZE = 20;

/**
 * TMDB `language` for search (and thus the localized `title` used for import auto-match).
 * `original_title` stays language-independent, so English/original queries still auto-match.
 */
export const TMDB_SEARCH_LANGUAGE = 'de-DE';
