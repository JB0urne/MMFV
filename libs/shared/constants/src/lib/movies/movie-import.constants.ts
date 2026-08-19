/** Max unresolved rows resolved per “Resolve next” click in the import dialog. */
export const MOVIE_IMPORT_BATCH_SIZE = 50;

/** Max titles per `POST /api/movies/import/preview` call. */
export const MOVIE_IMPORT_PREVIEW_REQUEST_SIZE = 15;

/** Parallel TMDB searches within one preview request. */
export const MOVIE_IMPORT_TMDB_CONCURRENCY = 5;

/**
 * TMDB `language` for search (and thus the localized `title` used for import auto-match).
 * `original_title` stays language-independent, so English/original queries still auto-match.
 */
export const TMDB_SEARCH_LANGUAGE = 'de-DE';
