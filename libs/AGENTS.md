# AGENTS.md — libs/

Shared code via `@mmfv/*` aliases in `tsconfig.base.json`. Update this file when libraries or aliases change.

## Layout

```
libs/
├── frontend/   # Angular shared (data-access, services, stores — not components)
├── shared/     # Framework-agnostic types and constants
└── backend/    # NestJS shared (placeholder)
```

Do not add new top-level folders under `libs/` without updating this doc.

| Library | Alias | Notes |
| --- | --- | --- |
| `frontend/data-access/movies` | `@mmfv/frontend/data-access/movies` | `MoviesService`, `TmdbService` → `/api/movies`, `/api/tmdb` |
| `shared/interfaces` | `@mmfv/interfaces` | `Movie` (`originalTitle` + `titles[]`), `Language` / `TranslationObject`, `MovieTmdb`, import types — no framework imports; non-buildable (bundled from source) |
| `shared/constants` | `@mmfv/constants` | Shared numeric/string constants; non-buildable (bundled from source) |
| `shared/utils` | `@mmfv/utils` | Framework-agnostic pure helpers (e.g. movie title display/sanitize); non-buildable (bundled from source); covered by root `npm test` |

## Rules

- Reusable Angular services, stores, facades → `libs/frontend/`. Angular **components** belong in `apps/mmfv-frontend/src/app/`
- `shared/`: types, constants, and pure functions only; domain folders under `src/lib/<domain>/`; export from `src/index.ts`.
- New lib: add `@mmfv/...` alias in `tsconfig.base.json`, barrel `src/index.ts`, matching tags, update this file and root `AGENTS.md`. Never deep-relative imports across projects.
