# AGENTS.md — mmfv-frontend

Nx name: **`mmfv-frontend`**.

## Layout

| Path | Use |
| --- | --- |
| `app/components/` | Shell chrome (header) |
| `app/features/movies/` | Catalog, table/list/grid views, dialogs, TMDB search |
| `libs/frontend/data-access/movies` | HTTP (`MoviesService`, `TmdbService`) |
| `libs/frontend/services/movies` | Catalog state (`MoviesCatalogService`) |

Components stay in this app; injectable logic goes in `libs/frontend/`.

## Rules

- Standalone components; `.ts` / `.html` / `.css` per component.
- API calls via `/api/...` (proxy → backend). No TMDB keys in the frontend.
- Movie titles: `displayMovieTitle` from `@mmfv/utils` (DE title when present).
