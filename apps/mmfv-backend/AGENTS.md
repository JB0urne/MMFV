# AGENTS.md — mmfv-backend

NestJS + SQLite API. Nx name: **`mmfv-backend`**. Global prefix `/api`. Update when modules, endpoints, schema, or env vars change.

## API

| Method | Path | Notes |
| --- | --- | --- |
| `GET` | `/api/movies` | `Movie[]` |
| `POST` | `/api/movies` | `Movie` body (`id` assigned server-side) |
| `POST` | `/api/movies/from-tmdb` | `{ tmdbId: number }` |
| `POST` | `/api/movies/import/preview` | `{ titles: string[] }` (max 15) → classify TMDB matches (5 parallel TMDB calls per request) |
| `POST` | `/api/movies/import/commit` | `{ items: ({ type:'tmdb', tmdbId } \| { type:'title', title })[] }` |
| `PUT` | `/api/movies/:id` | `Movie` body |
| `DELETE` | `/api/movies/:id` | `204` on success |
| `GET` | `/api/tmdb/search/movie` | `?query=&page=` → `MovieTmdbSearchResponse` |

`TMDB_API_KEY` stays on the backend only — never expose to the frontend.

## Env (all required)

`BACKEND_PORT`, `SQLITE_PATH`, `SQLITE_SEED_FILE`, `TMDB_API_KEY` — see `example.env`. No code fallbacks.

## Conventions

- Domain types from `@mmfv/interfaces` — do not duplicate `Movie`.
- Movies store `original_title` + JSON `titles` (`TranslationObject[]`, unique language per movie). List display prefers DE then original.
- Thin controllers; SQL/business logic in services.
- New movie IDs: `randomUUID()`.

## Tests

- `npm test` (root Jest config).
- Pure unit: `import-classify.spec.ts`.
