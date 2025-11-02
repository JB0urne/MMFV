# Multi-stage build for NestJS
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package.json (monorepo dependencies)
COPY package*.json ./

# Install all dependencies (from root)
RUN npm ci

# Copy backend source code
COPY apps/mmfv-backend ./apps/mmfv-backend

# Set working directory to backend
WORKDIR /app/apps/mmfv-backend

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/apps/mmfv-backend/dist ./apps/mmfv-backend/dist

WORKDIR /app/apps/mmfv-backend

EXPOSE 3000

CMD ["node", "dist/main.js"]
