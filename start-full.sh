#!/bin/bash

# Enhanced startup script for VisiPakalpojumi application
# This script ensures all dependencies are available and launches the full application stack

set -e  # Exit on any error

# Configuration
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
LOGS_DIR="$APP_DIR/logs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables for process IDs
BACKEND_PID=""
FRONTEND_PID=""

# Function to print colored status messages
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

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system dependencies
check_dependencies() {
    print_status "Checking system dependencies..."
    
    local missing_deps=()
    
    # Check for essential commands
    if ! command_exists curl; then
        missing_deps+=("curl")
    fi
    
    if ! command_exists node; then
        missing_deps+=("node")
    fi
    
    if ! command_exists npm; then
        missing_deps+=("npm")
    fi
    
    if ! command_exists psql; then
        missing_deps+=("postgresql-client")
    fi
    
    if ! command_exists pg_isready; then
        missing_deps+=("postgresql-client")
    fi
    
    # Check Node.js version
    if command_exists node; then
        local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$node_version" -lt 18 ]; then
            print_error "Node.js version 18+ is required. Current version: $(node --version)"
            missing_deps+=("nodejs-18+")
        fi
    fi
    
    # Check npm version
    if command_exists npm; then
        local npm_version=$(npm --version | cut -d'.' -f1)
        if [ "$npm_version" -lt 8 ]; then
            print_warning "npm version 8+ is recommended. Current version: $(npm --version)"
        fi
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Installing missing dependencies..."
        
        # Install PostgreSQL client if missing
        if [[ " ${missing_deps[*]} " =~ " postgresql-client " ]]; then
            if command_exists apt; then
                sudo apt update && sudo apt install -y postgresql-client
            elif command_exists yum; then
                sudo yum install -y postgresql
            elif command_exists dnf; then
                sudo dnf install -y postgresql
            else
                print_error "Package manager not supported. Please install postgresql-client manually."
                exit 1
            fi
        fi
        
        # Install curl if missing
        if [[ " ${missing_deps[*]} " =~ " curl " ]]; then
            if command_exists apt; then
                sudo apt update && sudo apt install -y curl
            elif command_exists yum; then
                sudo yum install -y curl
            elif command_exists dnf; then
                sudo dnf install -y curl
            fi
        fi
        
        # For Node.js, provide installation instructions
        if [[ " ${missing_deps[*]} " =~ " node " ]] || [[ " ${missing_deps[*]} " =~ " nodejs-18+ " ]]; then
            print_error "Please install Node.js 18+ manually:"
            print_status "  Visit: https://nodejs.org/ or use your system package manager"
            exit 1
        fi
    fi
    
    print_success "All system dependencies are available"
}

# Function to check if ports are available
check_ports() {
    local app_ports=(3000 3001)
    local available=true
    
    for port in "${app_ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            print_warning "Port $port is already in use"
            available=false
        fi
    done
    
    # Check PostgreSQL port separately - it should be running
    if ss -tlnp | grep -q ":5432 "; then
        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
            print_status "PostgreSQL is running on port 5432 (expected)"
        else
            print_warning "Port 5432 is in use but PostgreSQL is not responding properly"
            available=false
        fi
    else
        print_status "PostgreSQL is not running on port 5432 - will start it"
    fi
    
    if [ "$available" = true ]; then
        return 0
    else
        return 1
    fi
}

# Function to kill existing processes
kill_existing_processes() {
    print_status "Stopping existing application processes..."
    
    # Kill processes on specific ports
    local ports=(3000 3001)
    for port in "${ports[@]}"; do
        local pids=$(ss -tlnp | grep ":$port " | awk '{print $7}' | cut -d',' -f1 | cut -d'=' -f2 | grep -v '-' | sort -u)
        if [ ! -z "$pids" ]; then
            for pid in $pids; do
                if [ "$pid" != "$$" ] && [ "$pid" != "$PPID" ]; then
                    print_status "Killing process $pid on port $port"
                    kill -9 "$pid" 2>/dev/null || true
                fi
            done
        fi
    done
    
    # Kill any remaining Node.js processes from our app
    local app_pids=$(ps aux | grep -E "(node.*dist/index.js|next-server)" | grep -v grep | awk '{print $2}')
    if [ ! -z "$app_pids" ]; then
        for pid in $app_pids; do
            print_status "Killing application process $pid"
            kill -9 "$pid" 2>/dev/null || true
        done
    fi
    
    # Wait a moment for processes to fully terminate
    sleep 2
    
    print_success "Existing processes stopped"
}

# Function to start PostgreSQL with enhanced error handling
start_postgresql() {
    print_status "Starting PostgreSQL database..."
    
    # Check if PostgreSQL is already running
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        print_success "PostgreSQL is already running"
        return 0
    fi
    
    # Try to start PostgreSQL using different methods
    print_status "PostgreSQL not running, attempting to start..."
    
    # Method 1: Try pg_ctlcluster (Debian/Ubuntu specific) - most reliable
    if command -v pg_ctlcluster >/dev/null 2>&1; then
        print_status "Trying to start PostgreSQL with pg_ctlcluster..."
        # Get the PostgreSQL version
        PG_VERSION=$(ls /etc/postgresql/ 2>/dev/null | head -n1)
        if [ ! -z "$PG_VERSION" ]; then
            if sudo pg_ctlcluster "$PG_VERSION" main start 2>/dev/null; then
                print_success "PostgreSQL started with pg_ctlcluster"
                sleep 3
                if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                    return 0
                fi
            fi
        fi
    fi
    
    # Method 2: Try direct pg_ctl command with proper config
    if command -v pg_ctl >/dev/null 2>&1; then
        print_status "Trying to start PostgreSQL with pg_ctl..."
        # Try to find PostgreSQL data directory and config
        for data_dir in /var/lib/postgresql/*/main /usr/local/var/postgres /var/lib/pgsql/data; do
            if [ -d "$data_dir" ]; then
                print_status "Found PostgreSQL data directory: $data_dir"
                # Check for config file
                config_file=""
                version_dir=$(dirname "$data_dir")
                version=$(basename "$version_dir")
                if [ -f "/etc/postgresql/$version/main/postgresql.conf" ]; then
                    config_file="/etc/postgresql/$version/main/postgresql.conf"
                fi
                
                if [ ! -z "$config_file" ]; then
                    if sudo -u postgres pg_ctl start -D "$data_dir" -o "-c config_file=$config_file" 2>/dev/null; then
                        print_success "PostgreSQL started with pg_ctl and config"
                        sleep 3
                        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                            return 0
                        fi
                    fi
                else
                    if sudo -u postgres pg_ctl start -D "$data_dir" 2>/dev/null; then
                        print_success "PostgreSQL started with pg_ctl"
                        sleep 3
                        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                            return 0
                        fi
                    fi
                fi
                break
            fi
        done
    fi
    
    # Method 3: Try systemctl (systemd) if available
    if command -v systemctl >/dev/null 2>&1 && [ -d /run/systemd/system ]; then
        print_status "Trying to start PostgreSQL with systemctl..."
        if sudo systemctl start postgresql 2>/dev/null; then
            print_success "PostgreSQL started with systemctl"
            sleep 3
            if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                return 0
            fi
        fi
    fi
    
    # Method 4: Try service command
    if command -v service >/dev/null 2>&1; then
        print_status "Trying to start PostgreSQL with service command..."
        if sudo service postgresql start 2>/dev/null; then
            print_success "PostgreSQL started with service command"
            sleep 3
            if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                return 0
            fi
        fi
    fi
    
    # Method 5: Try to install PostgreSQL if not available
    if ! command -v pg_ctl >/dev/null 2>&1; then
        print_status "PostgreSQL not installed, attempting to install..."
        if command -v apt; then
            sudo apt update && sudo apt install -y postgresql postgresql-contrib
            sudo service postgresql start
            sleep 5
            if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                print_success "PostgreSQL installed and started"
                return 0
            fi
        elif command -v yum; then
            sudo yum install -y postgresql postgresql-server
            sudo postgresql-setup initdb
            sudo systemctl start postgresql
            sleep 5
            if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                print_success "PostgreSQL installed and started"
                return 0
            fi
        fi
    fi
    
    # Final check
    if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        print_success "PostgreSQL is now running"
        return 0
    else
        print_error "Failed to start PostgreSQL with all methods"
        print_status "Manual commands to try:"
        print_status "  sudo pg_ctlcluster <version> main start"
        print_status "  sudo -u postgres pg_ctl start -D /var/lib/postgresql/*/main"
        print_status "  sudo service postgresql start"
        print_status "  sudo systemctl start postgresql"
        print_status "  sudo apt install postgresql postgresql-contrib"
        exit 1
    fi
}

# Function to ensure PostgreSQL user exists with proper permissions
setup_postgresql_user() {
    print_status "Setting up PostgreSQL user and permissions..."
    
    # Set password for postgres superuser (needed for user management)
    if sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';" 2>/dev/null; then
        print_status "PostgreSQL superuser password configured"
    else
        print_warning "Could not set postgres user password"
    fi
    
    # Check if visipakalpojumi_user exists
    USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='visipakalpojumi_user';" 2>/dev/null || echo "")
    
    if [ -z "$USER_EXISTS" ]; then
        print_status "Creating visipakalpojumi_user..."
        if sudo -u postgres psql -c "CREATE USER visipakalpojumi_user WITH CREATEDB LOGIN PASSWORD 'visipakalpojumi_password';" 2>/dev/null; then
            print_success "Database user 'visipakalpojumi_user' created"
        else
            print_error "Failed to create database user"
            return 1
        fi
    else
        print_status "Database user 'visipakalpojumi_user' already exists"
        # Ensure user has correct permissions
        sudo -u postgres psql -c "ALTER USER visipakalpojumi_user WITH CREATEDB LOGIN;" 2>/dev/null || true
    fi
    
    return 0
}

# Function to test database connection with application user
test_database_connection() {
    print_status "Testing database connection..."
    
    # Test if we can connect to the database with the application user
    if PGPASSWORD='visipakalpojumi_password' psql -h localhost -p 5432 -U visipakalpojumi_user -d visipakalpojumi -c "SELECT 1;" >/dev/null 2>&1; then
        print_success "Database connection test successful"
        return 0
    else
        print_status "Database connection test failed - database setup needed"
        return 1
    fi
}

# Function to create database with proper owner
create_database_with_owner() {
    print_status "Creating database with proper ownership..."
    
    # Create database owned by visipakalpojumi_user
    if sudo -u postgres createdb -O visipakalpojumi_user visipakalpojumi 2>/dev/null; then
        print_success "Database 'visipakalpojumi' created with proper owner"
    else
        print_status "Database may already exist, checking ownership..."
        # Ensure proper ownership if database exists
        sudo -u postgres psql -c "ALTER DATABASE visipakalpojumi OWNER TO visipakalpojumi_user;" 2>/dev/null || true
    fi
    
    # Create shadow database for Prisma migrations
    if sudo -u postgres createdb -O visipakalpojumi_user visipakalpojumi_shadow 2>/dev/null; then
        print_success "Shadow database created"
    else
        print_status "Shadow database may already exist"
    fi
    
    return 0
}

# Function to run database migrations
setup_database_schema() {
    print_status "Setting up database schema..."
    
    cd "$BACKEND_DIR"
    
    # Generate Prisma client
    if npm exec prisma generate >/dev/null 2>&1; then
        print_success "Prisma client generated"
    else
        print_warning "Prisma client generation failed"
    fi
    
    # Check if migrations exist, if not create initial migration
    if [ ! -d "prisma/migrations" ] || [ -z "$(ls -A prisma/migrations 2>/dev/null)" ]; then
        print_status "Creating initial database migration..."
        if npm exec prisma migrate dev --name init >/dev/null 2>&1; then
            print_success "Initial migration created and applied"
        else
            print_warning "Migration creation failed, trying deploy..."
            npm exec prisma migrate deploy >/dev/null 2>&1 || true
        fi
    else
        print_status "Applying existing migrations..."
        if npm exec prisma migrate deploy >/dev/null 2>&1; then
            print_success "Database migrations applied"
        else
            print_warning "Some migrations may have failed"
        fi
    fi
    
    return 0
}

# Enhanced database setup function
setup_database() {
    print_status "Checking database setup..."
    
    # First, ensure PostgreSQL is running
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        print_status "PostgreSQL not running, attempting to start..."
        start_postgresql
    else
        print_success "PostgreSQL is already running"
    fi
    
    # Test if database is already properly set up and working
    if test_database_connection; then
        print_success "Database is already properly configured - skipping setup"
        return 0
    fi
    
    print_status "Database setup required..."
    
    # Setup PostgreSQL user
    if ! setup_postgresql_user; then
        print_error "Failed to setup PostgreSQL user"
        return 1
    fi
    
    # Create database with proper owner
    if ! create_database_with_owner; then
        print_error "Failed to create database"
        return 1
    fi
    
    # Setup database schema
    if ! setup_database_schema; then
        print_error "Failed to setup database schema"
        return 1
    fi
    
    # Final connection test
    if test_database_connection; then
        print_success "Database setup completed successfully"
        return 0
    else
        print_error "Database setup failed - connection test unsuccessful"
        return 1
    fi
}

# Function to create fresh database
create_fresh_database() {
    print_status "Creating fresh database..."
    
    cd "$APP_DIR"
    
    # Use our enhanced database setup
    if setup_database; then
        print_success "Fresh database created successfully"
        return 0
    else
        print_error "Database setup failed"
        return 1
    fi
}

# Function to handle database migration issues
handle_migration_issues() {
    print_status "Handling database migration issues..."
    
    cd "$BACKEND_DIR"
    
    # Check for P3005 error (schema not empty) - offer to recreate database
    print_status "Detected migration issues - checking error type..."
    
    # Get the migration error details
    MIGRATION_OUTPUT=$(npm exec prisma migrate deploy 2>&1 || true)
    
    if echo "$MIGRATION_OUTPUT" | grep -q "P3005"; then
        print_warning "P3005 Error: Database schema is not empty"
        print_status "This usually means the database has existing data that conflicts with migrations"
        print_status "Recommended solution: Create a fresh database"
        
        # Automatically recreate the database
        print_status "Recreating database to resolve P3005 error..."
        cd "$APP_DIR"
        
        # Delete existing database
        if [ -f "./delete-database.sh" ] && [ -x "./delete-database.sh" ]; then
            ./delete-database.sh
        fi
        
        # Create fresh database
        if create_fresh_database; then
            print_success "Database recreated successfully - P3005 resolved"
            return 0
        else
            print_error "Failed to recreate database"
            return 1
        fi
        
    elif echo "$MIGRATION_OUTPUT" | grep -q "P3014"; then
        print_warning "P3014 Error: Shadow database creation failed"
        print_status "This usually means insufficient database permissions"
        
        # Try to fix permissions and create shadow database
        print_status "Attempting to fix shadow database permissions..."
        
        DB_NAME="visipakalpojumi"
        DB_SHADOW_NAME="${DB_NAME}_shadow"
        
        # Grant CREATEDB permission to postgres user
        sudo -u postgres psql -c "ALTER USER postgres CREATEDB;" 2>/dev/null || true
        
        # Create shadow database manually
        sudo -u postgres createdb "$DB_SHADOW_NAME" 2>/dev/null || true
        
        # Try migration again
        if npm exec prisma migrate deploy; then
            print_success "P3014 resolved - migrations applied successfully"
            return 0
        else
            print_error "Could not resolve P3014 error"
            return 1
        fi
    else
        # Handle other migration issues
        print_warning "Unknown migration error - attempting standard fixes..."
        
        # Check if fix-migration.sh exists and is executable
        if [ -f "./fix-migration.sh" ] && [ -x "./fix-migration.sh" ]; then
            print_status "Running migration fix script..."
            if ./fix-migration.sh; then
                print_success "Migration issues resolved by fix script"
                return 0
            else
                print_error "Migration fix script failed"
            fi
        fi
        
        # Try to baseline the migration
        if npm exec prisma migrate resolve --applied 20250804170825_init 2>/dev/null; then
            print_success "Database baselined successfully"
            return 0
        fi
        
        # Try db push as fallback
        if npm exec prisma db push 2>/dev/null; then
            print_success "Database schema pushed successfully"
            return 0
        fi
        
        print_error "Could not resolve migration issues automatically"
        print_status "Consider running './delete-database.sh' followed by './create-database.sh'"
        return 1
    fi
}

# Function to start backend with enhanced error handling
start_backend() {
    print_status "Starting backend application..."
    
    cd "$BACKEND_DIR"
    
    # Verify backend directory structure
    if [ ! -f "package.json" ]; then
        print_error "Backend package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if node_modules exists and is valid
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_status "Installing Node.js dependencies for backend..."
        if ! npm install; then
            print_error "Failed to install backend dependencies"
            exit 1
        fi
    else
        print_status "Node.js dependencies already installed for backend"
    fi
    
    # Check if Prisma client is generated
    if [ ! -d "node_modules/.prisma" ] || [ ! -f "node_modules/.prisma/client/index.js" ]; then
        print_status "Generating Prisma client..."
        if ! npm exec prisma generate; then
            print_error "Failed to generate Prisma client"
            exit 1
        fi
    else
        print_status "Prisma client already generated"
    fi
    
    # Ensure migration fix script exists
    if [ ! -f "./fix-migration.sh" ]; then
        print_status "Migration fix script not found - this is normal for first run"
    fi
    
    # Build the TypeScript application with timeout
    print_status "Building TypeScript application..."
    if timeout 300 npm run build; then
        print_success "Backend build completed successfully"
    else
        print_error "Backend build failed or timed out after 5 minutes"
        print_status "Check build errors above or try building manually:"
        print_status "  cd $BACKEND_DIR && npm run build"
        exit 1
    fi
    
    # Verify build output
    if [ ! -f "dist/index.js" ]; then
        print_error "Build output not found at dist/index.js"
        exit 1
    fi
    
    # Start PostgreSQL database
    start_postgresql
    
    # Enhanced database setup with automatic user creation and testing
    print_status "Setting up database..."
    if setup_database; then
        print_success "Database setup completed successfully"
    else
        print_error "Database setup failed"
        print_status "Manual intervention may be required:"
        print_status "  Option 1: Run './delete-database.sh' then restart this script"
        print_status "  Option 2: Check PostgreSQL service: sudo service postgresql status"
        print_status "  Option 3: Check logs and fix manually: cd $BACKEND_DIR && npm exec prisma migrate deploy"
        exit 1
    fi
    
    # Ensure logs directory exists
    mkdir -p "$APP_DIR/logs"
    
    # Start the backend application with better process management
    print_status "Starting backend application in production mode..."
    cd "$BACKEND_DIR"
    
    # Kill any existing backend processes
    pkill -f "node.*dist/index.js" 2>/dev/null || true
    
    # Start backend with proper environment
    # FRONTEND_URL helps backend CORS; default to http://localhost:3000 if not provided
    nohup env NODE_ENV=production FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}" npm start > "$APP_DIR/logs/backend.log" 2> "$APP_DIR/logs/backend-error.log" &
    BACKEND_PID=$!
    
    # Store PID for later use
    echo "$BACKEND_PID" > "$APP_DIR/logs/backend.pid"
    
    # Wait for backend to start with enhanced error handling
    print_status "Waiting for backend to start..."
    sleep 5
    
    # Check if backend is running with detailed error reporting
    print_status "Checking backend availability..."
    local retry_count=0
    local max_retries=8
    
    while [ $retry_count -lt $max_retries ]; do
        # Check if process is still running
        if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
            print_error "Backend process died unexpectedly"
            print_status "Checking backend error logs..."
            if [ -f "$APP_DIR/logs/backend-error.log" ]; then
                echo "=== BACKEND ERROR LOG ==="
                tail -20 "$APP_DIR/logs/backend-error.log"
            fi
            exit 1
        fi
        
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            print_success "Backend application is running on port 3001 (PID: $BACKEND_PID)"
            print_status "Testing backend response..."
            BACKEND_RESPONSE=$(curl -s http://localhost:3001 | head -c 200)
            if echo "$BACKEND_RESPONSE" | grep -q "Finder API\|API\|backend"; then
                print_success "Backend API is responding correctly"
                return 0
            else
                print_warning "Backend is running but may not be responding correctly"
                print_status "Response preview: $BACKEND_RESPONSE"
                return 0
            fi
        else
            retry_count=$((retry_count + 1))
            print_status "Backend not ready yet, waiting... (attempt $retry_count/$max_retries)"
            sleep 5
        fi
    done
    
    print_error "Backend application failed to start after $max_retries attempts"
    print_status "Checking backend logs..."
    if [ -f "$APP_DIR/logs/backend-error.log" ]; then
        echo "=== BACKEND ERROR LOG ==="
        tail -20 "$APP_DIR/logs/backend-error.log"
    fi
    if [ -f "$APP_DIR/logs/backend.log" ]; then
        echo "=== BACKEND LOG ==="
        tail -20 "$APP_DIR/logs/backend.log"
    fi
    print_status "Check logs with: tail -f $APP_DIR/logs/backend.log"
    exit 1
}

# Function to start frontend with enhanced error handling
start_frontend() {
    print_status "Starting frontend application..."
    
    cd "$FRONTEND_DIR"
    
    # Ensure frontend API URL is configured for the build
    local ENV_FILE=".env.local"
    local API_URL_DEFAULT="http://localhost:3001"
    local API_URL_VALUE="${NEXT_PUBLIC_API_URL:-$API_URL_DEFAULT}"
    if [ -f "$ENV_FILE" ]; then
        if grep -q '^NEXT_PUBLIC_API_URL=' "$ENV_FILE"; then
            sed -i "s|^NEXT_PUBLIC_API_URL=.*$|NEXT_PUBLIC_API_URL=$API_URL_VALUE|" "$ENV_FILE"
        else
            echo "NEXT_PUBLIC_API_URL=$API_URL_VALUE" >> "$ENV_FILE"
        fi
    else
        echo "NEXT_PUBLIC_API_URL=$API_URL_VALUE" > "$ENV_FILE"
    fi
    print_status "Frontend API URL set to: $API_URL_VALUE (in $ENV_FILE)"

    # Verify frontend directory structure
    if [ ! -f "package.json" ]; then
        print_error "Frontend package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Check if node_modules exists and is valid
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        print_status "Installing Node.js dependencies for frontend..."
        if ! npm install; then
            print_error "Failed to install frontend dependencies"
            exit 1
        fi
    else
        print_status "Node.js dependencies already installed for frontend"
    fi
    
    # Build the frontend for production with enhanced error handling
    print_status "Building Next.js application for production..."
    print_status "This may take several minutes - please wait..."
    
    # Clean previous build if it exists
    if [ -d ".next" ]; then
        print_status "Cleaning previous build..."
        rm -rf .next
    fi
    
    # Force skip linting and type checking for production build
    export NODE_ENV=production
    export SKIP_ENV_VALIDATION=true
    
    # Build with production script that should skip linting
    print_status "Building Next.js application (production mode)..."
    print_status "DEBUG: About to run npm run build:production with timeout 600..."
    print_status "DEBUG: Current directory: $(pwd)"
    print_status "DEBUG: NODE_ENV=$NODE_ENV, SKIP_ENV_VALIDATION=$SKIP_ENV_VALIDATION"
    print_status "DEBUG: Starting build command now..."
    print_status "DEBUG: Running: timeout 600 npm run build:production"
    echo "=== BUILD OUTPUT START ==="
    if timeout 600 npm run build:production 2>&1 | tee /tmp/build_output.log; then
        echo "=== BUILD OUTPUT END ==="
        print_status "DEBUG: npm run build:production completed successfully!"
        print_success "Frontend build completed successfully"
        
        # Verify CSS files are generated
        print_status "Verifying CSS build..."
        if find .next/static/css -name "*.css" 2>/dev/null | grep -q css; then
            print_success "CSS files generated successfully"
            CSS_COUNT=$(find .next/static/css -name "*.css" 2>/dev/null | wc -l)
            print_status "Found $CSS_COUNT CSS files"
        else
            print_warning "No CSS files found - this might cause styling issues"
        fi
        
        # Verify JavaScript files are generated
        print_status "Verifying JavaScript build..."
        if find .next/static/chunks -name "*.js" 2>/dev/null | grep -q js; then
            print_success "JavaScript files generated successfully"
            JS_COUNT=$(find .next/static/chunks -name "*.js" 2>/dev/null | wc -l)
            print_status "Found $JS_COUNT JavaScript files"
        else
            print_warning "No JavaScript files found - this might cause functionality issues"
        fi
    else
        echo "=== BUILD OUTPUT END (FAILED) ==="
        print_error "DEBUG: npm run build:production failed or timed out after 10 minutes"
        print_status "DEBUG: Last few lines of build output:"
        tail -10 /tmp/build_output.log 2>/dev/null || echo "No build output found"
        print_error "Frontend build failed or timed out after 10 minutes"
        print_status "Check build errors above or try building manually:"
        print_status "  cd $FRONTEND_DIR && npm run build"
        exit 1
    fi
    
    # Verify standalone server exists
    if [ ! -f ".next/standalone/server.js" ]; then
        print_error "Standalone server not found at .next/standalone/server.js"
        print_status "Build may have failed or standalone output not configured"
        print_status "Check next.config.js for standalone: true setting"
        exit 1
    fi
    
    # Copy static assets to standalone directory (required for CSS/JS to work)
    print_status "Copying static assets for standalone server..."
    if [ -d ".next/static" ]; then
        mkdir -p ".next/standalone/.next"
        cp -r ".next/static" ".next/standalone/.next/" 2>/dev/null || true
        print_success "Static assets copied"
    fi
    
    # Copy public assets if they exist
    if [ -d "public" ]; then
        cp -r "public" ".next/standalone/" 2>/dev/null || true
        print_status "Public assets copied"
    fi
    
    # Ensure logs directory exists
    mkdir -p "$APP_DIR/logs"
    
    # Start the frontend production server
    print_status "Starting Next.js standalone server in production mode..."
    cd "$FRONTEND_DIR"
    nohup env NODE_ENV=production HOSTNAME=0.0.0.0 node .next/standalone/server.js > "$APP_DIR/logs/frontend.log" 2> "$APP_DIR/logs/frontend-error.log" &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 15
    
    # Check if frontend is running with detailed error reporting
    print_status "Checking frontend availability..."
    local retry_count=0
    local max_retries=6
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            print_success "Frontend application is running on port 3000"
            print_status "Testing frontend response..."
            FRONTEND_RESPONSE=$(curl -s http://localhost:3000)
            if echo "$FRONTEND_RESPONSE" | grep -q "VisiPakalpojumi\|html\|<!DOCTYPE"; then
                print_success "Frontend dashboard is loading correctly"
                # Verify frontend can reach backend health
                print_status "Verifying frontend -> backend health connectivity..."
                FRONTEND_HEALTH_URL="${API_URL_VALUE:-http://localhost:3001}/health"
                if curl -s -f "$FRONTEND_HEALTH_URL" > /dev/null 2>&1; then
                    print_success "Frontend can reach backend health: $FRONTEND_HEALTH_URL"
                else
                    print_warning "Frontend may not reach backend at: $FRONTEND_HEALTH_URL"
                    print_status "If using HTTPS on the site, ensure API URL is HTTPS or use Nginx same-origin proxy."
                fi
            else
                print_warning "Frontend is running but may not be loading correctly"
                print_status "Response preview: $(echo "$FRONTEND_RESPONSE" | head -c 200)"
            fi
            
            # Check external IP access
            EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
            print_status "External IP: $EXTERNAL_IP"
            if [ "$EXTERNAL_IP" != "unknown" ]; then
                print_status "Frontend should be accessible at: http://$EXTERNAL_IP:3000"
            fi
            return 0
        else
            retry_count=$((retry_count + 1))
            print_status "Frontend not ready yet, waiting... (attempt $retry_count/$max_retries)"
            sleep 5
        fi
    done
    
    print_error "Frontend application failed to start after $max_retries attempts"
    print_status "Checking frontend logs..."
    if [ -f "$APP_DIR/logs/frontend-error.log" ]; then
        echo "=== FRONTEND ERROR LOG ==="
        tail -20 "$APP_DIR/logs/frontend-error.log"
    fi
    if [ -f "$APP_DIR/logs/frontend.log" ]; then
        echo "=== FRONTEND LOG ==="
        tail -20 "$APP_DIR/logs/frontend.log"
    fi
    print_status "Check logs with: tail -f $APP_DIR/logs/frontend.log"
    exit 1
}

# Function to check if application is already running
check_application_status() {
    print_status "Checking if application is already running..."
    
    local backend_running=false
    local frontend_running=false
    
    # Check backend
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        backend_running=true
        print_status "Backend is already running on port 3001"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        frontend_running=true
        print_status "Frontend is already running on port 3000"
    fi
    
    if [ "$backend_running" = true ] && [ "$frontend_running" = true ]; then
        print_success "Application is already running!"
        echo ""
        echo "📊 Current Application Status:"
        echo "- Backend: http://localhost:3001 (Running)"
        echo "- Frontend: http://localhost:3000 (Running)"
        echo "- Database: PostgreSQL on port 5432"
        echo ""
        echo "🎯 Access the dashboard at: http://localhost:3000"
        echo ""
        echo "📋 Useful commands:"
        echo "- View backend logs: tail -f $APP_DIR/logs/backend.log"
        echo "- View frontend logs: tail -f $APP_DIR/logs/frontend.log"
        echo "- Stop all processes: $APP_DIR/stop.sh"
        echo ""
        echo "✅ No action needed - application is already running."
        exit 0
    elif [ "$backend_running" = true ] || [ "$frontend_running" = true ]; then
        print_warning "Partial application detected - some services are already running"
        print_status "Will restart all services to ensure consistency"
    fi
}

# Main execution
print_status "Starting application startup sequence..."

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Check system dependencies
check_dependencies

# Check if application is already running
check_application_status

# Kill existing processes
kill_existing_processes

# Check if ports are available (with retries)
print_status "Verifying ports are free..."
retry_count=0
max_retries=3
while [ $retry_count -lt $max_retries ]; do
    if check_ports; then
        break
    else
        retry_count=$((retry_count + 1))
        if [ $retry_count -lt $max_retries ]; then
            print_warning "Ports still occupied, trying cleanup again... (attempt $retry_count/$max_retries)"
            kill_existing_processes
            sleep 3
        else
            print_error "Could not free up ports after $max_retries attempts. Exiting."
            exit 1
        fi
    fi
done

# Start backend
start_backend

# Start frontend
start_frontend

# Show final status
print_success "Application started successfully!"
echo ""
echo "📊 Application Status:"
echo "- Backend PID: $BACKEND_PID"
echo "- Frontend PID: $FRONTEND_PID"
echo ""
echo "🌐 Services:"
echo "- PostgreSQL Database: Running on port 5432"
echo "- Backend API: http://localhost:3001"
echo "- Frontend Dashboard: http://localhost:3000"
echo "- Health Check: http://localhost:3001/health"
if [ -f "$FRONTEND_DIR/.env.local" ]; then
  EFFECTIVE_API_URL=$(grep '^NEXT_PUBLIC_API_URL=' "$FRONTEND_DIR/.env.local" | cut -d'=' -f2-)
  [ -n "$EFFECTIVE_API_URL" ] && echo "- Frontend API URL: $EFFECTIVE_API_URL"
fi

# Get external IP for remote access
EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
if [ "$EXTERNAL_IP" != "unknown" ]; then
    echo "- External Frontend: http://$EXTERNAL_IP:3000"
    echo "- External Backend: http://$EXTERNAL_IP:3001"
fi

echo ""
echo "🎯 IMPORTANT: Access the dashboard at http://localhost:3000"
echo "   (NOT localhost:3001 which shows the API JSON)"
echo ""
echo "📋 Useful commands:"
echo "- View backend logs: tail -f $APP_DIR/logs/backend.log"
echo "- View frontend logs: tail -f $APP_DIR/logs/frontend.log"
echo "- View backend errors: tail -f $APP_DIR/logs/backend-error.log"
echo "- View frontend errors: tail -f $APP_DIR/logs/frontend-error.log"
echo "- Stop all processes: $APP_DIR/stop.sh"
echo ""
echo "🔧 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. You should see the VisiPakalpojumi dashboard"
echo "3. If you see JSON, you're on the wrong URL"
echo "4. For external access, use the external IP shown above"
echo ""
echo "✅ Startup complete! Both services are running."

# Create stop script if it doesn't exist
create_stop_script() {
    if [ ! -f "$APP_DIR/stop.sh" ]; then
        cat > "$APP_DIR/stop.sh" << 'EOF'
#!/bin/bash
# Stop script for VisiPakalpojumi application

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$APP_DIR/logs"

echo "🛑 Stopping VisiPakalpojumi application..."

# Stop backend
if [ -f "$LOGS_DIR/backend.pid" ]; then
    BACKEND_PID=$(cat "$LOGS_DIR/backend.pid")
    if kill -0 "$BACKEND_PID" 2>/dev/null; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill "$BACKEND_PID"
        sleep 2
        if kill -0 "$BACKEND_PID" 2>/dev/null; then
            echo "Force killing backend..."
            kill -9 "$BACKEND_PID"
        fi
    fi
    rm -f "$LOGS_DIR/backend.pid"
fi

# Stop frontend
if [ -f "$LOGS_DIR/frontend.pid" ]; then
    FRONTEND_PID=$(cat "$LOGS_DIR/frontend.pid")
    if kill -0 "$FRONTEND_PID" 2>/dev/null; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill "$FRONTEND_PID"
        sleep 2
        if kill -0 "$FRONTEND_PID" 2>/dev/null; then
            echo "Force killing frontend..."
            kill -9 "$FRONTEND_PID"
        fi
    fi
    rm -f "$LOGS_DIR/frontend.pid"
fi

# Kill any remaining processes on our ports
echo "Cleaning up ports..."
pkill -f "node.*dist/index.js" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true

# Check if ports are free
sleep 2
if ! ss -tlnp | grep -q ":3000 "; then
    echo "✅ Port 3000 is free"
else
    echo "⚠️  Port 3000 may still be in use"
fi

if ! ss -tlnp | grep -q ":3001 "; then
    echo "✅ Port 3001 is free"
else
    echo "⚠️  Port 3001 may still be in use"
fi

echo "✅ Application stopped successfully!"
EOF
        chmod +x "$APP_DIR/stop.sh"
        print_success "Stop script created at $APP_DIR/stop.sh"
    fi
}

create_stop_script