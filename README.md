# MMFV - Monorepo Fullstack Application

A monorepo containing an Angular frontend and NestJS backend, both written in TypeScript.

## Project Structure

```
.
├── apps/
│   ├── mmfv-frontend/    # Angular 18 application
│   ├── mmfv-backend/     # NestJS API server
├── libs/                  # Shared libraries (for future use)
├── docker-compose.yml     # Docker compose configuration
├── package.json           # Root package.json with all dependencies
└── README.md             # This file
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

```bash
# Install all dependencies
npm install
```

### Development

**Start Backend with Docker:**
```bash
npm run backend
```

**Start Frontend:**
```bash
npm run frontend
```

**Start both simultaneously:**
```bash
npm run dev
```

This will start:
- **Backend** on http://localhost:3000 (via Docker)
- **Frontend** on http://localhost:4200

**Stop Backend:**
```bash
npm run backend:down
```

### Available Commands

- `npm run backend` - Start backend with Docker Compose
- `npm run backend:down` - Stop backend Docker container
- `npm run backend:dev` - Run backend locally without Docker (requires CD to apps/mmfv-backend)
- `npm run frontend` - Start Angular frontend development server
- `npm run dev` - Run both frontend and backend in development mode
- `npm run build` - Build both applications

## Features

- **Frontend**: Angular 18 with standalone components
- **Backend**: NestJS with TypeScript, running in Docker
- **Monorepo Structure**: All dependencies in root package.json
- **TypeScript**: Both applications use TypeScript
- **Hot Reload**: Development mode with automatic reloading
- **CORS**: Configured for frontend-backend communication

## API Endpoints

- `GET /api/message` - Returns a greeting message
- `GET /api/health` - Health check endpoint

## Docker

The backend runs in a Docker container. To rebuild the container:

```bash
docker-compose up --build
```

To view logs:

```bash
docker-compose logs -f backend
```
