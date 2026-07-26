# AGENTS.md — mmfv-backend

NestJS REST API for the MMFV movie catalog. Persists data in SQLite.

## Maintenance

Update this file when you change modules, endpoints, database schema, or environment variables. See the root [`AGENTS.md`](../../AGENTS.md) for the repo-wide maintenance rule.

## Nx project

| Property | Value |
| --- | --- |
| Directory | `apps/mmfv-backend` |
| Nx name | `mmfv-backend` |
| Default port | `3000` |
| API base | http://localhost:3000/api |

## Commands

```bash
nx serve mmfv-backend       # Build + run with watch
nx build mmfv-backend       # Compile → dist/apps/mmfv-backend
```

Run from the **repository root**.

## Purpose in the monorepo

Provides the **movies REST API** and **SQLite persistence**. Uses shared types from `@mmfv/interfaces` so responses match the frontend model.

## Directory layout

```
src/
├── main.ts                    # Bootstrap, CORS, global /api prefix
├── app.module.ts              # Root module
├── app.controller.ts          # Health / root routes
├── app.service.ts
├── database/
│   ├── sqlite.module.ts       # Provides SqliteService globally
│   └── sqlite.service.ts      # DB connection, schema, seed, row mapping
└── movies/
    ├── movies.module.ts
    ├── movies.controller.ts   # GET/POST/PUT /api/movies
    └── movies.service.ts      # CRUD against SQLite
```

## API

Global prefix: **`/api`** (set in `main.ts`).

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/api/movies` | — | `Movie[]` |
| `POST` | `/api/movies` | `{ title, imdbId, year }` | Created `Movie` |
| `PUT` | `/api/movies/:id` | `Movie` | Updated `Movie` or 404 |

CORS allows `http://localhost:4200` for local frontend development.

## Database

- **Engine:** SQLite via `better-sqlite3` (native module).
- **Default path:** `./data/mmfv.sqlite` (gitignored).
- **Schema:** `movies` table with `id`, `title`, `imdb_id`, `year`, `created_at`, `updated_at`.
- **Seed:** On first run, if the table is empty, loads `seed/movies.json` (path resolved in `sqlite.service.ts`).

### Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | HTTP listen port |
| `SQLITE_PATH` | `./data/mmfv.sqlite` | Database file path |
| `SQLITE_SEED_FILE` | Auto-resolved | Override seed JSON path |

## Conventions

- Import domain types from `@mmfv/interfaces` — do not duplicate `Movie` in the app.
- Keep controllers thin; business logic and SQL belong in services.
- Shared NestJS code (DTOs, modules) should eventually live in `libs/backend/` (see [`libs/AGENTS.md`](../../libs/AGENTS.md)).
- Use `randomUUID()` for new movie IDs on create.

## Build notes

- Built with `@nx/js:tsc`; output under `dist/apps/mmfv-backend`.
- `better-sqlite3` requires native compilation — ensure build tools are available on the host.

## Related docs

- [`libs/AGENTS.md`](../../libs/AGENTS.md) — shared types and future backend libs
- [`apps/mmfv-frontend/AGENTS.md`](../mmfv-frontend/AGENTS.md) — consumer of this API
