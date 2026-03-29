# MMFV - Movie Master Filme Verzeichnis

A monorepo containing an Angular frontend and NestJS backend, both written in TypeScript.

## Project Structure

```
.
├── apps/
│   ├── mmfv-frontend/    # Angular 18 application
│   ├── mmfv-backend/     # NestJS API server
├── database/
│   └── sqlite-dump/      # Seed JSON for local SQLite (e.g. movies.json)
├── libs/                  # Shared libraries (for future use)
├── docker-compose.yml     # Docker compose configuration
├── package.json           # Root package.json with all dependencies
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

