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

# Application directory - use current directory
APP_DIR="$(pwd)"
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
    pkill -f "next.*start" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    
    # Kill any processes using our ports
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    # Kill PM2 processes
    pm2 stop visipakalpojumi-backend 2>/dev/null || true
    pm2 delete visipakalpojumi-backend 2>/dev/null || true
    
    # Wait for processes to fully stop
    sleep 3
    
    # Double-check ports are free
    if lsof -i:3000 >/dev/null 2>&1; then
        print_warning "Port 3000 still in use, forcing kill..."
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    if lsof -i:3001 >/dev/null 2>&1; then
        print_warning "Port 3001 still in use, forcing kill..."
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    print_success "All existing processes stopped"
}

# Function to check if ports are available
check_ports() {
    print_status "Checking if ports are available..."
    
    if lsof -i:3001 >/dev/null 2>&1; then
        print_error "Port 3001 is still in use. Please check what's running on this port."
        lsof -i:3001
        return 1
    fi
    
    if lsof -i:3000 >/dev/null 2>&1; then
        print_error "Port 3000 is still in use. Please check what's running on this port."
        lsof -i:3000
        return 1
    fi
    
    print_success "Ports 3000 and 3001 are available"
    return 0
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
    
    # Skip database operations in development mode
    print_status "Skipping database operations in development mode..."
    
    # Start the backend application
    print_status "Starting backend application..."
    nohup npm start > "$APP_DIR/logs/backend.log" 2> "$APP_DIR/logs/backend-error.log" &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 8
    
    # Check if backend is running with detailed error reporting
    print_status "Checking backend availability..."
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend application is running on port 3001"
        print_status "Testing backend response..."
        BACKEND_RESPONSE=$(curl -s http://localhost:3001 | head -c 200)
        if echo "$BACKEND_RESPONSE" | grep -q "Finder API"; then
            print_success "Backend API is responding correctly"
        else
            print_warning "Backend is running but may not be responding correctly"
            print_status "Response preview: $BACKEND_RESPONSE"
        fi
    else
        print_error "Backend application failed to start"
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
    
    # Build the frontend for production
    print_status "Building Next.js application for production..."
    if npm run build; then
        print_success "Frontend build completed successfully"
    else
        print_error "Frontend build failed"
        print_status "Check build errors above"
        exit 1
    fi
    
    # Start the frontend production server
    print_status "Starting Next.js production server..."
    # Start with host binding to allow external access on port 3000
    nohup npm start -- -H 0.0.0.0 -p 3000 > "$APP_DIR/logs/frontend.log" 2> "$APP_DIR/logs/frontend-error.log" &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 15
    
    # Check if frontend is running with detailed error reporting
    print_status "Checking frontend availability..."
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Frontend application is running on port 3000"
        print_status "Testing frontend response..."
        FRONTEND_RESPONSE=$(curl -s http://localhost:3000 | head -c 200)
        if echo "$FRONTEND_RESPONSE" | grep -q "VisiPakalpojumi"; then
            print_success "Frontend dashboard is loading correctly"
        else
            print_warning "Frontend is running but may not be loading correctly"
            print_status "Response preview: $FRONTEND_RESPONSE"
        fi
        
        # Check external IP access
        EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
        print_status "External IP: $EXTERNAL_IP"
        print_status "Frontend should be accessible at: http://$EXTERNAL_IP:3000"
    else
        print_error "Frontend application failed to start"
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
    fi
}

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Kill existing processes
kill_existing_processes

# Check if ports are available
if ! check_ports; then
    print_error "Ports are not available. Exiting."
    exit 1
fi

# Start backend
start_backend

# Start frontend
start_frontend

# Show final status
print_success "Application started successfully!"
echo ""
echo "📊 Application Status:"
pm2 status 2>/dev/null || echo "PM2 not available - using direct process management"
echo ""
echo "🌐 Services:"
echo "- Backend API: http://localhost:3001"
echo "- Frontend Dashboard: http://localhost:3000"
echo "- Health Check: http://localhost:3001/health"

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
echo "- Stop all processes: pkill -f 'node.*3001' && pkill -f 'next.*3000'"
echo ""
echo "🔧 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. You should see the VisiPakalpojumi dashboard"
echo "3. If you see JSON, you're on the wrong URL"
echo "4. For external access, use the external IP shown above"