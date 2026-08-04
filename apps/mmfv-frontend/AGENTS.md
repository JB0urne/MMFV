# AGENTS.md — mmfv-frontend

Angular UI shell. Nx name: **`frontend`** (directory `apps/mmfv-frontend`). Update when app structure, proxy, or feature layout changes.

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
- TMDB: search/add via backend (`TmdbService`, `createFromTmdb`). **No TMDB tokens or direct TMDB URLs in the frontend.**
