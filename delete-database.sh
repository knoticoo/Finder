#!/bin/bash

# VisiPakalpojumi - Database Deletion Script
# This script completely removes the database and cleans up migration state

set -e  # Exit on any error

echo "🗑️  VisiPakalpojumi Database Deletion Script"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Database configuration
DB_NAME="visipakalpojumi"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Application directories
APP_DIR="/workspace"
BACKEND_DIR="$APP_DIR/backend"

print_status "Starting database deletion process..."

# Change to backend directory
cd "$BACKEND_DIR"

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    print_status "Try: sudo service postgresql start"
    exit 1
fi

print_success "PostgreSQL is running"

# Stop any running application processes that might be using the database
print_status "Stopping application processes..."
pkill -f "node.*3001" 2>/dev/null || true
pkill -f "node.*3000" 2>/dev/null || true
sleep 2

# Terminate active connections to the database
print_status "Terminating active database connections..."
sudo -u postgres psql -c "
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = '$DB_NAME'
  AND pid <> pg_backend_pid();
" 2>/dev/null || true

# Drop the database
print_status "Dropping database '$DB_NAME'..."
if sudo -u postgres dropdb "$DB_NAME" 2>/dev/null; then
    print_success "Database '$DB_NAME' dropped successfully"
else
    print_warning "Database '$DB_NAME' may not exist or already dropped"
fi

# Clean up Prisma migration state
print_status "Cleaning up Prisma migration state..."

# Remove migration files (but keep the migrations directory structure)
if [ -d "prisma/migrations" ]; then
    print_status "Removing existing migration files..."
    rm -rf prisma/migrations/*
    print_success "Migration files cleaned up"
fi

# Remove Prisma client cache
if [ -d "node_modules/.prisma" ]; then
    print_status "Removing Prisma client cache..."
    rm -rf node_modules/.prisma
    print_success "Prisma client cache removed"
fi

# Remove any migration lock files
if [ -f "prisma/migrations/migration_lock.toml" ]; then
    rm -f "prisma/migrations/migration_lock.toml"
    print_status "Migration lock file removed"
fi

print_success "Database deletion completed successfully!"
echo ""
echo "📋 What was cleaned up:"
echo "- Database '$DB_NAME' was dropped"
echo "- All active database connections were terminated"
echo "- Prisma migration state was reset"
echo "- Prisma client cache was cleared"
echo ""
echo "🔄 Next steps:"
echo "1. Run './start-full.sh' to create a fresh database and start the application"
echo "2. Or run './create-database.sh' to just create the database without starting the app"
echo ""
echo "✅ Ready for a fresh start!"