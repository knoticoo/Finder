#!/bin/bash

# Copy migration fix script to backend directory
# This script ensures the fix-migration.sh script is available in the backend directory

set -e

echo "📋 Copying migration fix script to backend directory..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "backend/prisma/schema.prisma" ]; then
    print_error "This script must be run from the project root directory"
    print_status "Please run: cd /path/to/your/project && ./copy-migration-fix.sh"
    exit 1
fi

# Check if fix-migration.sh exists in backend
if [ -f "backend/fix-migration.sh" ]; then
    print_success "Migration fix script already exists in backend directory"
    exit 0
fi

# Check if fix-migration.sh exists in current directory
if [ ! -f "fix-migration.sh" ]; then
    print_error "fix-migration.sh not found in current directory"
    print_status "Please ensure the migration fix script exists"
    exit 1
fi

# Copy the script
print_status "Copying fix-migration.sh to backend directory..."
cp fix-migration.sh backend/
chmod +x backend/fix-migration.sh

print_success "Migration fix script copied to backend directory"
print_status "The start-full.sh script will now be able to handle P3005 errors automatically"