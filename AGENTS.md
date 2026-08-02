# AGENTS.md — MMFV monorepo

Guidance for AI agents working in this repository.

## Maintenance

**Keep every `AGENTS.md` in this repo up to date automatically.** When you add, move, rename, or remove apps, libraries, scripts, path aliases, or conventions, update the relevant `AGENTS.md` files in the same change. Do not leave documentation stale after structural edits.

| File | Scope |
| --- | --- |
| `AGENTS.md` (this file) | Whole monorepo |
| `apps/mmfv-frontend/AGENTS.md` | Angular application |
| `apps/mmfv-backend/AGENTS.md` | NestJS API |
| `libs/AGENTS.md` | Shared libraries |

## Purpose

MMFV (Movie Master Filme Verzeichnis) is a movie catalog: list, paginate, create, and edit movies. The frontend is Angular; the backend is NestJS with SQLite persistence.

## Repository layout

```
.
├── apps/                   # Deployable applications
│   ├── mmfv-frontend/      # Angular UI (Nx project: frontend)
│   └── mmfv-backend/       # NestJS API (Nx project: mmfv-backend)
├── libs/                   # Shared code (see libs/AGENTS.md)
│   ├── frontend/           # Angular-specific shared libs
│   ├── shared/             # Framework-agnostic shared types
│   └── backend/            # NestJS shared libs (mostly placeholder)
├── seed/                   # movies.json — SQLite seed data
├── .cursor/skills/         # Cursor skills (e.g. angular-component-placement)
├── tsconfig.base.json      # `@mmfv/*` path aliases
├── nx.json                 # Nx workspace config
└── package.json            # Root deps; `npm run app` starts both apps
```

## Agent dev workflow

**Agents must not run `npm install` or start dev servers.** Ask the user to install/remove packages manually. To verify changes, run lint/format checks and builds only — never `npm run app`, `nx serve`, or `ng serve`.

| Allowed | Not allowed |
| --- | --- |
| `nx build frontend` / `nx build mmfv-backend` | `npm install`, `npm ci`, package add/remove |
| `nx lint <project>` | `npm run app`, `nx serve`, `ng serve` |
| `npx prettier --check .` | Starting apps to smoke-test unless user asks |

Cursor rule: `.cursor/rules/agent-dev-workflow.mdc` (always applied).

## Commands (for humans)

```bash
npm install                 # Install all dependencies (run from root; agents: ask user instead)
npm run app                 # Serve frontend + backend in parallel (humans only)
nx serve frontend           # Angular dev server → :4200 (humans only)
nx serve mmfv-backend       # NestJS API → :3000 (humans only)
nx build frontend
nx build mmfv-backend
```

## Conventions

- **TypeScript strict mode** across the workspace.
- **Shared types** belong in `libs/shared/interfaces`; import as `@mmfv/interfaces`.
- **Reusable Angular code** (services, dialogs, components) belongs in `libs/frontend/`, not in the app, unless the user explicitly wants app-local code. See `.cursor/skills/angular-component-placement/SKILL.md`.
- **New Angular components** use separate `.ts`, `.html`, and `.css` files in a dedicated folder; prefer standalone components.
- **Backend API prefix** is `/api` (set in `apps/mmfv-backend/src/main.ts`).
- **Frontend HTTP** calls use `/api/...`; the dev proxy forwards to the backend.
- **Do not commit** `.env`, `node_modules/`, `dist/`, `.nx/`, or `/data/` (local SQLite).

## Path aliases

Defined in `tsconfig.base.json`:

| Alias | Library |
| --- | --- |
| `@mmfv/interfaces` | `libs/shared/interfaces` |
| `@mmfv/frontend/data-access/movies` | `libs/frontend/data-access/movies` |

Register a new alias whenever you add a library.

## Where to look

| Task | Start here |
| --- | --- |
| Movie list / edit UI | `apps/mmfv-frontend/src/app/` |
| HTTP client for movies | `libs/frontend/data-access/movies` |
| Movie types | `libs/shared/interfaces/src/lib/movies/` |
| REST endpoints | `apps/mmfv-backend/src/movies/` |
| TMDB search proxy | `apps/mmfv-backend/src/tmdb/` |
| SQLite schema / seed | `apps/mmfv-backend/src/database/sqlite.service.ts` |

## Nx project names

| Directory | Nx `project.json` name |
| --- | --- |
| `apps/mmfv-frontend` | `frontend` |
| `apps/mmfv-backend` | `mmfv-backend` |
| `libs/shared/interfaces` | `interfaces` |
| `libs/frontend/data-access/movies` | `frontend-data-access-movies` |
