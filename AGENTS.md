# AGENTS.md — MMFV monorepo

Movie catalog (list/paginate/create/edit). Angular frontend, NestJS + SQLite backend.

Nested guides: `apps/mmfv-frontend/AGENTS.md`, `apps/mmfv-backend/AGENTS.md`, `libs/AGENTS.md`. Update the relevant file when structure, aliases, or conventions change.

## Agent workflow

Do **not** run `npm install` / package changes or start servers (`npm run app`, `nx serve`, `ng serve`). Verify with lint/build only. Details: `.cursor/rules/agent-dev-workflow.mdc`.

## Conventions

- Shared types → `libs/shared/interfaces` (`@mmfv/interfaces`).
- Reusable Angular code → `libs/frontend/` (see `.cursor/skills/angular-component-placement/SKILL.md`).
- New Angular components: separate `.ts` / `.html` / `.css`; standalone preferred.
- API prefix `/api`; frontend calls `/api/...` (dev proxy → backend).
- Do not commit `.env`, `node_modules/`, `dist/`, `.nx/`, `/data/`.

## Path aliases

| Alias | Library |
| --- | --- |
| `@mmfv/interfaces` | `libs/shared/interfaces` |
| `@mmfv/frontend/data-access/movies` | `libs/frontend/data-access/movies` |

## Where to look

| Task | Start here |
| --- | --- |
| Movie list / edit UI | `apps/mmfv-frontend/src/app/` |
| HTTP clients | `libs/frontend/data-access/movies` |
| Movie types | `libs/shared/interfaces/src/lib/movies/` |
| REST + SQLite | `apps/mmfv-backend/src/movies/`, `.../database/` |
| TMDB proxy | `apps/mmfv-backend/src/tmdb/` |

## Nx project names

| Directory | Nx name |
| --- | --- |
| `apps/mmfv-frontend` | `frontend` |
| `apps/mmfv-backend` | `mmfv-backend` |
| `libs/shared/interfaces` | `interfaces` |
| `libs/frontend/data-access/movies` | `frontend-data-access-movies` |
