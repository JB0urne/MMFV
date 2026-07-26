# AGENTS.md — mmfv-frontend

Angular application for the MMFV movie catalog UI.

## Maintenance

Update this file when you change app structure, routing, proxy config, or feature layout. See the root [`AGENTS.md`](../../AGENTS.md) for the repo-wide maintenance rule.

## Nx project

| Property | Value |
| --- | --- |
| Directory | `apps/mmfv-frontend` |
| Nx name | `frontend` |
| CLI project | `mmfv-frontend` (in `angular.json`) |
| Dev URL | http://localhost:4200 |

## Commands

```bash
nx serve frontend          # Dev server with API proxy
nx build frontend          # Production build → dist/mmfv-frontend
```

Run from the **repository root**. The serve command executes `ng serve` with `cwd: apps/mmfv-frontend`.

## Purpose in the monorepo

This app is the **shell and feature composition layer**. It wires pages together, holds app-only UI (e.g. edit dialog), and delegates data fetching to shared libraries.

Prefer placing reusable Angular code in `libs/frontend/` rather than here.

## Directory layout

```
src/
├── main.ts
├── index.html
├── styles.css                 # Global styles
└── app/
    ├── app.component.*        # Root: movie list state, pagination, dialogs
    ├── app.routes.ts          # Route definitions
    ├── components/            # App chrome (header, footer, welcome)
    └── features/
        └── movies/
            ├── list-view/     # Paginated movie table
            └── edit-movie-dialog/   # App-local edit dialog
```

## Key patterns

- **Standalone components** with explicit `imports` arrays.
- **Angular Material** for tables, paginator, buttons, dialogs, form fields.
- **RxJS** `BehaviorSubject` + `combineLatest` for client-side pagination in `AppComponent`.
- **Shared data access** via `@mmfv/frontend/data-access/movies` (`MoviesService`).
- **Shared types** via `@mmfv/interfaces` (`Movie`).

## API communication

- HTTP calls use relative URLs: `/api/movies`, `/api/movies/:id`.
- Dev proxy: `proxy.conf.json` forwards `/api/**` → `http://localhost:3000`.
- Backend must be running (`nx serve mmfv-backend` or `npm run app`).

## Component placement

| Location | Use for |
| --- | --- |
| `libs/frontend/` | Reusable services, dialogs, UI widgets |
| `app/features/` | Feature-specific views composed for this app |
| `app/components/` | Layout chrome not tied to a domain |
| `app/features/.../edit-movie-dialog/` | Example of app-local dialog (legacy placement) |

When adding new shared dialogs or components, use `libs/frontend/` and follow `.cursor/skills/angular-component-placement/SKILL.md`.

## Configuration files

| File | Role |
| --- | --- |
| `angular.json` | Angular CLI build/serve targets |
| `tsconfig.app.json` | App compilation; extends root `tsconfig.base.json` |
| `proxy.conf.json` | Dev API proxy to backend |
| `project.json` | Nx project metadata |

## Related docs

- [`libs/AGENTS.md`](../../libs/AGENTS.md) — shared libraries
- [`apps/mmfv-backend/AGENTS.md`](../mmfv-backend/AGENTS.md) — API this app calls
