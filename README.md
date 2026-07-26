# MMFV — Movie Master Filme Verzeichnis

A TypeScript monorepo for browsing and managing a movie catalog. An **Angular** frontend talks to a **NestJS** REST API backed by **SQLite**.

## Purpose

MMFV lets you list, paginate, create, and edit movies. Shared types live in libraries so the frontend and backend stay aligned. On first run, the backend seeds an empty database from `seed/movies.json`.

## Tech stack

| Layer | Stack |
| --- | --- |
| Monorepo | [Nx](https://nx.dev) 22 |
| Frontend | Angular 20, Angular Material, RxJS |
| Backend | NestJS 10, Express |
| Database | SQLite via `better-sqlite3` |
| Shared code | TypeScript path aliases under `libs/` |

## Prerequisites

- **Node.js** 18+ (20 recommended)
- **npm**
- Build tools for native modules (`better-sqlite3` may need Python / C++ toolchain on some systems)

## Getting started

```bash
# From the repo root
npm install

# Start backend + frontend together
npm run app
```

| Service | URL | Nx project |
| --- | --- | --- |
| Frontend | http://localhost:4200 | `frontend` |
| Backend API | http://localhost:3000/api | `mmfv-backend` |

The frontend dev server proxies `/api/**` to the backend (`apps/mmfv-frontend/proxy.conf.json`).

### Run apps separately

```bash
nx serve mmfv-backend    # API on port 3000
nx serve frontend        # UI on port 4200
```

### Build

```bash
nx build frontend
nx build mmfv-backend
```

## Project structure

```
.
├── apps/
│   ├── mmfv-frontend/          # Angular application (shell, features, app-only dialogs)
│   └── mmfv-backend/           # NestJS API (movies module, SQLite)
├── libs/
│   ├── frontend/               # Shared Angular libraries (data-access, UI)
│   ├── shared/                 # Cross-cutting TypeScript (interfaces)
│   └── backend/                # Shared NestJS libraries (placeholder)
├── seed/
│   └── movies.json             # Initial movie data when the DB is empty
├── .cursor/                    # Cursor skills and agent guidance
├── AGENTS.md                   # Repo-wide guidance for AI agents
├── package.json                # Root dependencies and scripts
└── tsconfig.base.json          # Path aliases for `@mmfv/*` imports
```


## Environment

Copy `example.env` as a starting point for local overrides. The SQLite database file is gitignored under `/data/`.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/movies` | List all movies |
| `POST` | `/api/movies` | Create a movie |
| `PUT` | `/api/movies/:id` | Update a movie |

## Agent documentation

This repo uses layered [`AGENTS.md`](./AGENTS.md) files for AI-assisted development:

- [`AGENTS.md`](./AGENTS.md) — monorepo overview
- [`apps/mmfv-frontend/AGENTS.md`](./apps/mmfv-frontend/AGENTS.md) — frontend app
- [`apps/mmfv-backend/AGENTS.md`](./apps/mmfv-backend/AGENTS.md) — backend app
- [`libs/AGENTS.md`](./libs/AGENTS.md) — shared libraries

When you change structure, conventions, or commands, update the relevant `AGENTS.md` in the same change.
