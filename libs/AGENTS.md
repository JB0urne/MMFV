# AGENTS.md — libs/

Shared libraries for the MMFV monorepo. Import via `@mmfv/*` path aliases defined in `tsconfig.base.json`.

## Maintenance

Update this file when you add, remove, or rename libraries or path aliases. See the root [`AGENTS.md`](../AGENTS.md) for the repo-wide maintenance rule.

## Top-level layout

Only three subfolders exist under `libs/`:

```
libs/
├── frontend/     # Angular-specific shared code (data-access, UI components)
├── shared/       # Framework-agnostic TypeScript (interfaces, types)
└── backend/      # NestJS shared code (placeholder; no libs yet)
```

Do not create new top-level folders under `libs/` without updating this document.

## frontend/

Angular libraries consumed by `apps/mmfv-frontend`.

| Library | Path | Alias | Purpose |
| --- | --- | --- | --- |
| Movies data-access | `frontend/data-access/movies` | `@mmfv/frontend/data-access/movies` | `MoviesService` — HTTP calls to `/api/movies` |

**Conventions**

- Place reusable Angular **services**, **dialogs**, and **presentational components** here.
- Each library has its own `project.json`, `tsconfig.json`, and `src/index.ts` barrel export.
- New components: separate `.ts`, `.html`, `.css` in a dedicated folder; standalone by default.
- Follow `.cursor/skills/angular-component-placement/SKILL.md` when generating components.

**Suggested layout for a new frontend lib**

```
libs/frontend/<category>/<name>/
├── project.json
├── tsconfig.json
├── tsconfig.lib.json
└── src/
    ├── index.ts
    └── lib/
        └── ...
```

Categories in use: `data-access`, `ui` (when added).

## shared/

Cross-cutting TypeScript with no Angular or NestJS runtime dependencies.

| Library | Path | Alias | Purpose |
| --- | --- | --- | --- |
| interfaces | `shared/interfaces` | `@mmfv/interfaces` | `Movie`, `BaseMovie`, `StrictMovie` and related types |

Both `apps/mmfv-frontend` and `apps/mmfv-backend` import from here so API payloads and UI models stay in sync.

**Conventions**

- Export types and pure functions only — no framework imports.
- Add new domain folders under `src/lib/<domain>/`.
- Re-export public API from `src/index.ts`.

## backend/

Reserved for shared NestJS modules, DTOs, and utilities used by `apps/mmfv-backend`.

Currently contains only `.gitkeep`. When adding a backend library:

1. Create the library under `libs/backend/<name>/`.
2. Add a path alias in `tsconfig.base.json`.
3. Add `project.json` with appropriate Nx tags (`backend`, `nest`).
4. Update this file and the root `AGENTS.md`.

## Adding a new library checklist

1. Create the library under the correct subfolder (`frontend/`, `shared/`, or `backend/`).
2. Add `@mmfv/...` path alias to `tsconfig.base.json`.
3. Export public API from `src/index.ts`.
4. Update this `AGENTS.md` and root `AGENTS.md` alias tables.
5. Import the alias from apps — never use deep relative paths across project boundaries.
