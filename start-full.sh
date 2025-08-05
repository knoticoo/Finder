#!/bin/bash

# VisiPakalpojumi - Full Application Startup Script
# This script starts both the backend API and frontend dashboard

set -e  # Exit on any error

echo "🚀 Starting VisiPakalpojumi full application (Backend + Frontend)..."

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_status "Running as root - proceeding with startup"
else
   print_status "Running as user - proceeding with startup"
fi

# Application directory
APP_DIR="/root/Finder"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Function to kill existing processes
kill_existing_processes() {
    print_status "Stopping existing processes..."
    
    # Kill any existing Node.js processes on our ports
    pkill -f "node.*3001" 2>/dev/null || true
    pkill -f "next.*3000" 2>/dev/null || true
    
    # Kill PM2 processes
    pm2 stop visipakalpojumi-backend 2>/dev/null || true
    pm2 delete visipakalpojumi-backend 2>/dev/null || true
    
    sleep 2
}

# Function to start backend
start_backend() {
    print_status "Starting backend application..."
    
    cd "$BACKEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies for backend..."
        npm install
    fi
    
    # Check if Prisma client is generated
    if [ ! -d "node_modules/.prisma" ]; then
        print_status "Generating Prisma client..."
        npm exec prisma generate
    fi
    
    # Build the TypeScript application
    print_status "Building TypeScript application..."
    npm run build
    
    # Check database connection and run migrations
    print_status "Checking database connection..."
    if npm exec prisma db push --accept-data-loss; then
        print_success "Database schema updated"
    else
        print_error "Database connection failed"
        print_status "Please check your DATABASE_URL in .env file"
        exit 1
    fi
    
    # Start the backend application with PM2
    print_status "Starting backend with PM2..."
    pm2 start "npm run start" \
        --name "visipakalpojumi-backend" \
        --cwd "$BACKEND_DIR" \
        --env production \
        --log "$APP_DIR/logs/backend.log" \
        --error "$APP_DIR/logs/backend-error.log"
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 5
    
    # Check if backend is running
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend application is running on port 3001"
    else
        print_error "Backend application failed to start"
        print_status "Check logs with: pm2 logs visipakalpojumi-backend"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend application..."
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies for frontend..."
        npm install
    fi
    
    # Start the frontend development server
    print_status "Starting Next.js development server..."
    nohup npm run dev > "$APP_DIR/logs/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 10
    
    # Check if frontend is running
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend application is running on port 3000"
    else
        print_error "Frontend application failed to start"
        print_status "Check logs with: tail -f $APP_DIR/logs/frontend.log"
        exit 1
    fi
}

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Kill existing processes
kill_existing_processes

# Start backend
start_backend

# Start frontend
start_frontend

# Show final status
print_success "Application started successfully!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Services:"
echo "- Backend API: http://localhost:3001"
echo "- Frontend Dashboard: http://localhost:3000"
echo "- Health Check: http://localhost:3001/health"
echo ""
echo "🎯 IMPORTANT: Access the dashboard at http://localhost:3000"
echo "   (NOT localhost:3001 which shows the API JSON)"
echo ""
echo "📋 Useful commands:"
echo "- View backend logs: pm2 logs visipakalpojumi-backend"
echo "- View frontend logs: tail -f $APP_DIR/logs/frontend.log"
echo "- Monitor: pm2 monit"
echo "- Restart backend: pm2 restart visipakalpojumi-backend"
echo "- Stop: ./stop.sh"
echo ""
echo "🔧 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. You should see the VisiPakalpojumi dashboard"
echo "3. If you see JSON, you're on the wrong URL"