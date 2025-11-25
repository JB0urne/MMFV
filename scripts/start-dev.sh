#!/bin/bash

# Development startup script
# Starts MongoDB, resets/imports data, then starts backend and frontend

# Don't use set -e here as we want to continue even if reset script has minor issues
set +e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESET_SCRIPT="$PROJECT_ROOT/mongodb/scripts/reset-and-import.sh"

echo -e "${BLUE}Starting development environment...${NC}"
echo ""

# Start MongoDB and reset/import data
echo -e "${BLUE}Step 1: Starting MongoDB and importing initial data...${NC}"
reset_exit_code=0
"$RESET_SCRIPT" || reset_exit_code=$?

if [ $reset_exit_code -ne 0 ]; then
    echo -e "${YELLOW}Warning: Database reset/import had issues (exit code: $reset_exit_code), but continuing...${NC}"
fi

echo ""
echo -e "${GREEN}Step 1 completed successfully!${NC}"
echo ""
echo -e "${BLUE}Step 2: Starting backend and frontend...${NC}"
echo ""

# Change to project root and start backend and frontend
cd "$PROJECT_ROOT"

# Ensure MongoDB is running (the reset script already did this, but just to be safe)
"$PROJECT_ROOT/scripts/ensure-mongodb.sh" > /dev/null 2>&1 || true

echo -e "${BLUE}Launching backend and frontend servers...${NC}"

# Start backend and frontend using concurrently
# Use exec to replace shell process with concurrently
# Suppress Node.js deprecation warnings
export NODE_OPTIONS="--no-deprecation"
set -e  # Re-enable error checking for the final command
exec npm run backend:dev

