# MMFV — Movie Master Filme Verzeichnis

A TypeScript monorepo for browsing and managing a movie catalog. An **Angular** frontend talks to a **NestJS** REST API backed by **SQLite**.

## Purpose

MMFV (german: "MovieMasterFilmeVerzeichnis", a term created when I was much younger) lets you explore movies and mangane movie lists.

## Tech stack

| Layer | Stack |
| --- | --- |
| Monorepo | [Nx](https://nx.dev) |
| Frontend | Angular, Angular Material, RxJS |
| Backend | NestJS, Express |
| Database | SQLite via `better-sqlite3` |

## Prerequisites

- **Node.js** 20+ (recommended)
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
| Frontend | http://localhost:4200 | `mmfv-frontend` |
| Backend API | http://localhost:3000/api | `mmfv-backend` |


GitHub Actions (`.github/workflows/ci.yml`) runs lint + test on pushes and PRs to `main`. Run `npm run lint` / `npm run test` locally before pushing if you want early feedback.

## Environment

Copy `example.env` to `.env` in the repo root and set every value; **all listed variables are required** (no code defaults).

| Variable | Purpose |
| --- | --- |
| `BACKEND_PORT` | Backend HTTP listen port |
| `SQLITE_PATH` | SQLite database file path |
| `SQLITE_SEED_FILE` | Seed JSON path (used when the DB is empty) |
| `TMDB_API_KEY` | TMDB API Read Access Token (Bearer token) |

The frontend never reads TMDB credentials — all TMDB calls go through the backend.

## API overview

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/movies` | List all movies |
| `POST` | `/api/movies` | Create a movie |
| `POST` | `/api/movies/from-tmdb` | Import a movie from TMDB by `{ tmdbId }` |
| `POST` | `/api/movies/import/preview` | Resolve a batch of titles against TMDB (`{ titles }`, max 15 per request) |
| `POST` | `/api/movies/import/commit` | Commit chosen TMDB ids and/or title-only rows |
| `PUT` | `/api/movies/:id` | Update a movie |
| `GET` | `/api/tmdb/search/movie?query=` | Search TMDB (proxied, camelCase response) |

## Agent documentation

This repo uses layered [`AGENTS.md`](./AGENTS.md) files for AI-assisted development:

- [`AGENTS.md`](./AGENTS.md) — monorepo overview
- [`apps/mmfv-frontend/AGENTS.md`](./apps/mmfv-frontend/AGENTS.md) — frontend app
- [`apps/mmfv-backend/AGENTS.md`](./apps/mmfv-backend/AGENTS.md) — backend app
- [`libs/AGENTS.md`](./libs/AGENTS.md) — shared libraries

When you change structure, conventions, or commands, update the relevant `AGENTS.md` in the same change.
