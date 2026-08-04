# AGENTS.md — libs/

Shared code via `@mmfv/*` aliases in `tsconfig.base.json`. Update this file when libraries or aliases change.

## Layout

```
libs/
├── frontend/   # Angular shared (data-access, UI)
├── shared/     # Framework-agnostic types only
└── backend/    # NestJS shared (placeholder)
```

Do not add new top-level folders under `libs/` without updating this doc.

| Library | Alias | Notes |
| --- | --- | --- |
| `frontend/data-access/movies` | `@mmfv/frontend/data-access/movies` | `MoviesService`, `TmdbService` → `/api/movies`, `/api/tmdb` |
| `shared/interfaces` | `@mmfv/interfaces` | `Movie`, `MovieTmdb`, search types — no framework imports |

## Rules

- Reusable Angular services/dialogs/components → `libs/frontend/` (skill: `.cursor/skills/angular-component-placement/SKILL.md`).
- `shared/`: types and pure functions only; domain folders under `src/lib/<domain>/`; export from `src/index.ts`.
- New lib: add `@mmfv/...` alias in `tsconfig.base.json`, barrel `src/index.ts`, update this file and root `AGENTS.md`. Never deep-relative imports across projects.
