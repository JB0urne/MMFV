# AGENTS.md — mmfv-frontend

Angular UI shell. Nx name: **`mmfv-frontend`**. Update when app structure, proxy, or feature layout changes.

## Placement

This app composes features and app-only UI. Reusable Angular code → `libs/frontend/` (skill: `.cursor/skills/angular-component-placement/SKILL.md`).

| Location | Use for |
| --- | --- |
| `libs/frontend/` | Reusable services, dialogs, UI |
| `app/features/` | App-specific feature views |
| `app/components/` | Layout chrome |

## Patterns

- Standalone components; Angular Material; shared types via `@mmfv/interfaces`.
- Data access: `@mmfv/frontend/data-access/movies` (`MoviesService`, `TmdbService`).
- HTTP: relative `/api/...` only. Proxy: `proxy.conf.json` → `http://localhost:3000`.
- TMDB: search/add via backend (`TmdbService`, `addByTmdbId`). **No TMDB tokens or direct TMDB URLs in the frontend.**
- Bulk import: list toolbar **Import** → `ImportMoviesDialogComponent` → `MoviesService.previewImport` / `commitImport` (UI batches of 50, HTTP chunks of 15).
- Header: ⚙, ?, Logo, Listen / Zufall / Konto (pending). Filter/Search on the list view, not in the site header.
- Catalog list shows DE title when present, else `originalTitle` (`displayMovieTitle` from `@mmfv/utils`).
