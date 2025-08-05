#!/bin/bash

# VisiPakalpojumi - Frontend Dashboard Startup Script
# This script starts only the frontend dashboard

set -e  # Exit on any error

echo "🚀 Starting VisiPakalpojumi Frontend Dashboard..."

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

# Application directory
APP_DIR="/workspace"
FRONTEND_DIR="$APP_DIR/frontend"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

# Function to kill existing frontend processes
kill_existing_frontend() {
    print_status "Stopping existing frontend processes..."
    
    # Kill any existing Next.js processes
    pkill -f "next.*3000" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    
    sleep 2
}

# Function to start frontend
start_frontend() {
    print_status "Starting frontend application..."
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies for frontend..."
        export PATH="/home/ubuntu/.nvm/versions/node/v22.16.0/bin:$PATH"
        npm install
    fi
    
    # Start the frontend development server
    print_status "Starting Next.js development server..."
    export PATH="/home/ubuntu/.nvm/versions/node/v22.16.0/bin:$PATH"
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

# Kill existing frontend processes
kill_existing_frontend

# Start frontend
start_frontend

# Show final status
print_success "Frontend Dashboard started successfully!"
echo ""
echo "🌐 Dashboard URL: http://localhost:3000"
echo ""
echo "📋 Useful commands:"
echo "- View frontend logs: tail -f $APP_DIR/logs/frontend.log"
echo "- Stop frontend: pkill -f 'next.*3000'"
echo ""
echo "🎯 IMPORTANT: Open http://localhost:3000 in your browser"
echo "   You should see the VisiPakalpojumi dashboard"
echo ""
echo "⚠️  Note: Backend API is not running (database required)"
echo "   The frontend will work for viewing the dashboard"