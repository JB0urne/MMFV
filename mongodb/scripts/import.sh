#!/bin/bash

# MongoDB Import Script
# Imports JSON files from mongodb/dump into MongoDB collections

set -e

# Configuration
MONGO_HOST="${MONGO_HOST:-localhost}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_USER:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD:-password}"
MONGO_DB="${MONGO_DB:-mmfv}"
MONGO_AUTH_DB="${MONGO_AUTH_DB:-admin}"

# Script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Project root (two levels up from scripts/)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DUMP_DIR="$PROJECT_ROOT/mongodb/dump"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}MongoDB Import Script${NC}"
echo -e "${BLUE}=====================${NC}"
echo "Database: $MONGO_DB"
echo "Host: $MONGO_HOST:$MONGO_PORT"
echo "Dump directory: $DUMP_DIR"
echo ""

# Check if mongoimport is available
if ! command -v mongoimport &> /dev/null; then
    echo -e "${YELLOW}Warning: mongoimport not found. Trying to use Docker...${NC}"
    USE_DOCKER=true
else
    USE_DOCKER=false
fi

# Build connection string
if [ "$USE_DOCKER" = true ]; then
    # When using Docker, connect to the MongoDB container
    if [ -z "$MONGO_CONTAINER" ]; then
        MONGO_CONTAINER="mmfv-mongodb"
    fi
    MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_CONTAINER:27017/$MONGO_DB?authSource=$MONGO_AUTH_DB"
else
    MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB?authSource=$MONGO_AUTH_DB"
fi

# Check if dump directory exists
if [ ! -d "$DUMP_DIR" ]; then
    echo -e "${YELLOW}Dump directory not found: $DUMP_DIR${NC}"
    exit 1
fi

# Import each JSON file in the dump directory
imported=0
for json_file in "$DUMP_DIR"/*.json; do
    # Check if file exists (handles case where no .json files exist)
    [ -f "$json_file" ] || continue
    
    # Extract collection name from filename (e.g., movies.json -> movies)
    collection=$(basename "$json_file" .json)
    
    echo -e "${BLUE}Importing $collection...${NC}"
    
    if [ "$USE_DOCKER" = true ]; then
        # Using Docker - copy file to container and import
        docker cp "$json_file" "$MONGO_CONTAINER:/tmp/$(basename "$json_file")"
        docker exec "$MONGO_CONTAINER" mongoimport \
            --uri="$MONGO_URI" \
            --collection="$collection" \
            --file="/tmp/$(basename "$json_file")" \
            --jsonArray \
            --drop
        docker exec "$MONGO_CONTAINER" rm -f "/tmp/$(basename "$json_file")"
    else
        # Using local mongoimport
        mongoimport \
            --uri="$MONGO_URI" \
            --collection="$collection" \
            --file="$json_file" \
            --jsonArray \
            --drop
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully imported $collection${NC}"
        ((imported++))
    else
        echo -e "${YELLOW}✗ Failed to import $collection${NC}"
    fi
    echo ""
done

if [ $imported -eq 0 ]; then
    echo -e "${YELLOW}No JSON files found in $DUMP_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}Import completed! Imported $imported collection(s).${NC}"

