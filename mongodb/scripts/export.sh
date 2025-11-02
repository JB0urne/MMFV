#!/bin/bash

# MongoDB Export Script
# Exports MongoDB collections to JSON files in mongodb/dump directory

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

echo -e "${BLUE}MongoDB Export Script${NC}"
echo -e "${BLUE}=====================${NC}"
echo "Database: $MONGO_DB"
echo "Host: $MONGO_HOST:$MONGO_PORT"
echo "Output directory: $DUMP_DIR"
echo ""

# Check if mongoexport is available
if ! command -v mongoexport &> /dev/null; then
    echo -e "${YELLOW}Warning: mongoexport not found. Trying to use Docker...${NC}"
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
    EXPORT_CMD="docker exec $MONGO_CONTAINER mongoexport"
else
    MONGO_URI="mongodb://$MONGO_USER:$MONGO_PASSWORD@$MONGO_HOST:$MONGO_PORT/$MONGO_DB?authSource=$MONGO_AUTH_DB"
    EXPORT_CMD="mongoexport"
fi

# Create dump directory if it doesn't exist
mkdir -p "$DUMP_DIR"

# Get list of collections
# Try mongosh first, fallback to mongo if mongosh is not available
if [ "$USE_DOCKER" = true ]; then
    if docker exec "$MONGO_CONTAINER" command -v mongosh &> /dev/null; then
        collections=$(docker exec "$MONGO_CONTAINER" mongosh "$MONGO_URI" --quiet --eval "db.getCollectionNames()" | grep -o '"[^"]*"' | tr -d '"')
    else
        collections=$(docker exec "$MONGO_CONTAINER" mongo "$MONGO_URI" --quiet --eval "db.getCollectionNames()" | grep -o '"[^"]*"' | tr -d '"')
    fi
else
    if command -v mongosh &> /dev/null; then
        collections=$(mongosh "$MONGO_URI" --quiet --eval "db.getCollectionNames()" | grep -o '"[^"]*"' | tr -d '"')
    elif command -v mongo &> /dev/null; then
        collections=$(mongo "$MONGO_URI" --quiet --eval "db.getCollectionNames()" | grep -o '"[^"]*"' | tr -d '"')
    else
        echo -e "${YELLOW}Error: Neither mongosh nor mongo found${NC}"
        exit 1
    fi
fi

# Filter out system collections
collections=$(echo "$collections" | grep -v '^system\.')

if [ -z "$collections" ]; then
    echo -e "${YELLOW}No collections found in database${NC}"
    exit 1
fi

# Export each collection
exported=0
for collection in $collections; do
    output_file="$DUMP_DIR/${collection}.json"
    
    echo -e "${BLUE}Exporting $collection...${NC}"
    
    if [ "$USE_DOCKER" = true ]; then
        # Using Docker - export to container temp file then copy out
        docker exec "$MONGO_CONTAINER" mongoexport \
            --uri="$MONGO_URI" \
            --collection="$collection" \
            --out="/tmp/${collection}.json" \
            --jsonArray
        docker cp "$MONGO_CONTAINER:/tmp/${collection}.json" "$output_file"
        docker exec "$MONGO_CONTAINER" rm "/tmp/${collection}.json"
    else
        # Using local mongoexport
        $EXPORT_CMD \
            --uri="$MONGO_URI" \
            --collection="$collection" \
            --out="$output_file" \
            --jsonArray
    fi
    
    if [ $? -eq 0 ] && [ -f "$output_file" ]; then
        echo -e "${GREEN}✓ Successfully exported $collection to $output_file${NC}"
        ((exported++))
    else
        echo -e "${YELLOW}✗ Failed to export $collection${NC}"
    fi
    echo ""
done

if [ $exported -eq 0 ]; then
    echo -e "${YELLOW}No collections exported${NC}"
    exit 1
fi

echo -e "${GREEN}Export completed! Exported $exported collection(s) to $DUMP_DIR${NC}"

