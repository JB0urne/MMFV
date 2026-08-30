# AGENTS.md — libs/

Shared code via `@mmfv/*` in `tsconfig.base.json`. Update when libraries or aliases change.

```
libs/
├── frontend/   # data-access (HTTP), services (state)
├── shared/     # interfaces, constants, utils
└── backend/
```

| Alias | Purpose |
| --- | --- |
| `@mmfv/frontend/data-access/movies` | `MoviesService`, `TmdbService` |
| `@mmfv/frontend/services/movies` | `MoviesCatalogService` |
| `@mmfv/interfaces` | Domain types |
| `@mmfv/constants` | Shared constants |
| `@mmfv/utils` | Pure helpers |

Angular components → `apps/mmfv-frontend/`. New lib: add alias, barrel export, Nx project, update root `AGENTS.md`.
