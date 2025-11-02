#!/bin/bash

# Script to ensure MongoDB is running (without reset)

set -e

# Configuration
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-password}"
MONGO_AUTH_DB="${MONGO_AUTH_DB:-admin}"
MONGO_CONTAINER="${MONGO_CONTAINER:-mmfv-mongodb}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root for docker compose commands
cd "$PROJECT_ROOT"

# Check if MongoDB container is running, start if not
if ! docker ps | grep -q "$MONGO_CONTAINER"; then
    echo -e "${BLUE}Starting MongoDB...${NC}"
    docker compose up -d mongodb
    
    # Wait for MongoDB to be ready
    echo -e "${BLUE}Waiting for MongoDB to be ready...${NC}"
    max_attempts=30
    attempt=0
    while [ $attempt -lt $max_attempts ]; do
        if docker exec "$MONGO_CONTAINER" mongosh --quiet \
            -u "$MONGO_USER" -p "$MONGO_PASSWORD" \
            --authenticationDatabase "$MONGO_AUTH_DB" \
            --eval "db.adminCommand('ping')" &> /dev/null; then
            echo -e "${GREEN}MongoDB is ready!${NC}"
            break
        fi
        attempt=$((attempt + 1))
        if [ $attempt -lt $max_attempts ]; then
            echo -e "${YELLOW}Waiting for MongoDB... (attempt $attempt/$max_attempts)${NC}"
            sleep 1
        fi
    done
    
    if [ $attempt -eq $max_attempts ]; then
        echo -e "${YELLOW}Warning: MongoDB may not be ready yet${NC}"
    fi
else
    echo -e "${GREEN}MongoDB is already running${NC}"
fi

