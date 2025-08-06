#!/bin/bash

# Fix Prisma Migration P3005 Error
# This script helps resolve the "database schema is not empty" error

echo "🔧 Fixing Prisma Migration P3005 Error..."

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

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found"
    exit 1
fi

# Check database connection
print_status "Checking database connection..."
if npx prisma db pull > /dev/null 2>&1; then
    print_success "Database connection successful"
else
    print_error "Cannot connect to database. Please ensure PostgreSQL is running."
    print_status "To start PostgreSQL with Docker:"
    echo "docker run --name postgres-visipakalpojumi \\"
    echo "  -e POSTGRES_DB=visipakalpojumi \\"
    echo "  -e POSTGRES_USER=visipakalpojumi_user \\"
    echo "  -e POSTGRES_PASSWORD=visipakalpojumi_password \\"
    echo "  -p 5432:5432 \\"
    echo "  -d postgres:15"
    exit 1
fi

# Check if migrations directory exists
if [ ! -d "prisma/migrations" ]; then
    print_status "No migrations found. Creating initial migration..."
    npx prisma migrate dev --name init
    exit 0
fi

# Get the latest migration name
LATEST_MIGRATION=$(ls prisma/migrations | grep -E '^[0-9]+' | sort | tail -1)

if [ -z "$LATEST_MIGRATION" ]; then
    print_error "No migration found in prisma/migrations directory"
    exit 1
fi

print_status "Found migration: $LATEST_MIGRATION"

# Ask user what they want to do
echo ""
echo "Choose an option:"
echo "1) Baseline existing database (mark migration as applied)"
echo "2) Reset database (WARNING: This will delete all data)"
echo "3) Use db push instead of migrations (recommended for development)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_status "Baselining existing database..."
        npx prisma migrate resolve --applied "$LATEST_MIGRATION"
        print_success "Migration baselined successfully"
        ;;
    2)
        print_warning "This will delete all data in the database!"
        read -p "Are you sure? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            print_status "Resetting database..."
            npx prisma migrate reset --force
            print_success "Database reset successfully"
        else
            print_status "Operation cancelled"
        fi
        ;;
    3)
        print_status "Using db push..."
        npx prisma db push
        print_success "Schema pushed successfully"
        ;;
    4)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

print_success "Migration issue resolved!"
print_status "You can now run your application."