#!/bin/bash

# Simple development startup script
# Starts MongoDB (if not running) then starts backend and frontend without resetting database

set -e

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENSURE_MONGO_SCRIPT="$PROJECT_ROOT/scripts/ensure-mongodb.sh"

echo -e "${BLUE}Starting development environment (simple mode)...${NC}"
echo ""

# Ensure MongoDB is running (without reset)
"$ENSURE_MONGO_SCRIPT"

echo ""
echo -e "${BLUE}Starting backend and frontend...${NC}"
echo ""

# Start backend and frontend using concurrently
cd "$PROJECT_ROOT"
exec concurrently "npm run backend:dev" "npm run frontend"

