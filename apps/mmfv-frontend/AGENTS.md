# AGENTS.md — mmfv-frontend

Angular UI shell. Nx name: **`mmfv-frontend`**. Update when app structure, proxy, or feature layout changes.

## Placement

All Angular **components** live in this app. Shared injectable Angular code (services, stores, facades) → `libs/frontend/`.

| Location | Use for |
| --- | --- |
| `app/features/` | Feature views, dialogs, view-mode presenters (table / list / grid) |
| `app/components/` | Layout chrome (header, shell) |
| `libs/frontend/` | Services, stores, facades, HTTP clients — **not** components |

## Patterns

- Standalone components; Angular Material; shared types via `@mmfv/interfaces`.
- Data access: `@mmfv/frontend/data-access/movies` (`MoviesService`, `TmdbService`).
- HTTP: relative `/api/...` only. Proxy: `proxy.conf.json` → `http://localhost:3000`.
- TMDB: search/add via backend (`TmdbService`, `addByTmdbId`). **No TMDB tokens or direct TMDB URLs in the frontend.**
- Bulk import: list toolbar **Import** → `ImportMoviesDialogComponent` → `MoviesService.previewImport` / `commitImport` (UI batches of 50, HTTP chunks of 15).
- Header: ⚙, ?, Logo, Listen / Zufall / Konto (pending). Filter/Search on the list view, not in the site header.
- Catalog list shows DE title when present, else `originalTitle` (`displayMovieTitle` from `@mmfv/utils`).
