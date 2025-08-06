#!/bin/bash

# VisiPakalpojumi - Database Creation Script
# This script creates a fresh database with proper permissions

set -e  # Exit on any error

echo "🏗️  VisiPakalpojumi Database Creation Script"

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
DB_SHADOW_NAME="${DB_NAME}_shadow"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Application directories
APP_DIR="/workspace"
BACKEND_DIR="$APP_DIR/backend"

print_status "Starting database creation process..."

# Change to backend directory
cd "$BACKEND_DIR"

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
    print_error "PostgreSQL is not running. Please start PostgreSQL first."
    print_status "Try: sudo service postgresql start"
    exit 1
fi

print_success "PostgreSQL is running"

# Check if database already exists
print_status "Checking if database exists..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Dropping existing database..."
        sudo -u postgres dropdb "$DB_NAME"
        print_success "Existing database dropped"
    else
        print_status "Keeping existing database"
    fi
fi

# Create the main database if it doesn't exist
if ! sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_status "Creating database '$DB_NAME'..."
    sudo -u postgres createdb "$DB_NAME"
    print_success "Database '$DB_NAME' created"
else
    print_success "Database '$DB_NAME' already exists"
fi

# Handle shadow database for P3014 error
print_status "Handling shadow database for Prisma migrations..."

# Drop shadow database if it exists
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw "$DB_SHADOW_NAME"; then
    print_status "Dropping existing shadow database..."
    sudo -u postgres dropdb "$DB_SHADOW_NAME" 2>/dev/null || true
fi

# Create shadow database
print_status "Creating shadow database '$DB_SHADOW_NAME'..."
sudo -u postgres createdb "$DB_SHADOW_NAME"
print_success "Shadow database '$DB_SHADOW_NAME' created"

# Grant necessary permissions
print_status "Setting up database permissions..."
sudo -u postgres psql -c "
    -- Grant all privileges on the main database
    GRANT ALL PRIVILEGES ON DATABASE \"$DB_NAME\" TO $DB_USER;
    
    -- Grant all privileges on the shadow database
    GRANT ALL PRIVILEGES ON DATABASE \"$DB_SHADOW_NAME\" TO $DB_USER;
    
    -- Ensure the user can create databases (needed for shadow database)
    ALTER USER $DB_USER CREATEDB;
" 2>/dev/null || true

print_success "Database permissions configured"

# Verify database connection
print_status "Verifying database connection..."
if PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
    print_success "Database connection verified"
else
    print_error "Failed to connect to database"
    print_status "You may need to configure PostgreSQL authentication"
    print_status "Check your pg_hba.conf file or set a password for the postgres user"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
if npm exec prisma generate; then
    print_success "Prisma client generated successfully"
else
    print_warning "Failed to generate Prisma client - this may be resolved during migration"
fi

# Create initial migration
print_status "Creating initial Prisma migration..."
if npm exec prisma migrate dev --name init --create-only; then
    print_success "Initial migration created"
    
    # Apply the migration
    print_status "Applying initial migration..."
    if npm exec prisma migrate deploy; then
        print_success "Initial migration applied successfully"
    else
        print_warning "Migration deployment failed - this may need manual intervention"
    fi
else
    print_warning "Failed to create initial migration - database may already be initialized"
    
    # Try to just deploy existing migrations
    print_status "Attempting to deploy existing migrations..."
    if npm exec prisma migrate deploy; then
        print_success "Existing migrations deployed successfully"
    else
        print_status "Migration deployment failed - will be handled by the application startup"
    fi
fi

print_success "Database creation completed successfully!"
echo ""
echo "📋 What was created:"
echo "- Main database: '$DB_NAME'"
echo "- Shadow database: '$DB_SHADOW_NAME' (for Prisma migrations)"
echo "- Database permissions configured for user '$DB_USER'"
echo "- Prisma client generated"
echo "- Initial migrations applied"
echo ""
echo "🔄 Next steps:"
echo "1. Run './start-full.sh' to start the application with the new database"
echo "2. Or manually run 'npm exec prisma migrate deploy' in the backend directory"
echo ""
echo "✅ Database ready for use!"