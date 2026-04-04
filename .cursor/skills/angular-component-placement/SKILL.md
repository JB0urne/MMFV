---
name: angular-component-placement
description: Guides Angular component generation to shared libraries with file-structure consistency. Use when creating new Angular components, running Nx/Angular generate commands, or when the user asks to add a component in this repository.
---

# Angular Component Placement

## Purpose

Keep new Angular components reusable and consistently structured:

- Prefer creating new components under `libs/` for shared use.
- Avoid placing new components in `apps/mmfv-frontend/` unless the user explicitly asks.
- Create each new component in its own folder with exactly these files:
  - `<component-name>.component.ts`
  - `<component-name>.component.html`
  - `<component-name>.component.css`

## Decision Rule

When asked to create a new Angular component:

1. Default target is a path under `libs/`.
2. If the requested location is inside `apps/mmfv-frontend/`, ask once whether to place it in a library instead.
3. If the user explicitly confirms app-local placement, proceed there.

## Generation Pattern

Use Nx generation patterns that preserve separate TS/HTML/CSS files and a dedicated folder.

Preferred pattern (adjust project/lib name and path as needed):

```bash
nx g @nx/angular:component feature-name \
  --project=<lib-project-name> \
  --directory=<feature-or-domain-path> \
  --style=css \
  --inline-style=false \
  --inline-template=false \
  --standalone=true
```

Equivalent Angular CLI style (when not using Nx project flags directly):

```bash
ng g c libs/<lib-name>/src/lib/<feature-path>/feature-name \
  --style css \
  --inline-style false \
  --inline-template false \
  --standalone true
```

## Validation Checklist

Before finishing component creation, verify:

- Component lives under `libs/` (unless user explicitly asked for app-local).
- A dedicated component folder exists.
- The folder contains `.ts`, `.html`, and `.css` files.
- No inline template or inline styles were used.

## Response Style

When applying this skill, briefly state:

1. Which `libs/` target path is being used.
2. If the request initially pointed to `apps/mmfv-frontend/`, note that library placement is recommended and ask for confirmation once.
