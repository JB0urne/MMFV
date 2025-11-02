#!/bin/bash

# MongoDB Reset and Import Script
# Cleans the database and imports all JSON files from mongodb/dump

set -e

# Configuration
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-password}"
MONGO_DB="${MONGO_DB:-mmfv}"
MONGO_AUTH_DB="${MONGO_AUTH_DB:-admin}"
MONGO_CONTAINER="${MONGO_CONTAINER:-mmfv-mongodb}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DUMP_DIR="$PROJECT_ROOT/mongodb/dump"
IMPORT_SCRIPT="$SCRIPT_DIR/import.sh"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}MongoDB Reset and Import Script${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Change to project root for docker compose commands
cd "$PROJECT_ROOT"

# Check if MongoDB container is running, start if not
if ! docker ps | grep -q "$MONGO_CONTAINER"; then
    echo -e "${YELLOW}MongoDB container is not running. Starting it...${NC}"
    docker compose up -d mongodb
fi

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
    echo -e "${RED}MongoDB failed to start within $max_attempts seconds${NC}"
    exit 1
fi

echo -e "${BLUE}Cleaning database '$MONGO_DB'...${NC}"

# Drop the database and recreate it
MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_CONTAINER:27017/$MONGO_DB?authSource=$MONGO_AUTH_DB"

# Drop all collections in the database
collections=$(docker exec "$MONGO_CONTAINER" mongosh "$MONGO_URI" --quiet --eval "
try {
  db.getCollectionNames().forEach(function(collection) {
    if (!collection.startsWith('system.')) {
      db[collection].drop();
    }
  });
  print('Database cleaned');
} catch(e) {
  print('Database does not exist or error occurred:', e.message);
}
")

echo -e "${GREEN}Database cleaned${NC}"
echo ""

# Run the import script
echo -e "${BLUE}Importing data from dump files...${NC}"
MONGO_CONTAINER="$MONGO_CONTAINER" "$IMPORT_SCRIPT"

echo ""
echo -e "${GREEN}✓ Database reset and import completed!${NC}"

