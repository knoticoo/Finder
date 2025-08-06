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

# Application directory - use absolute paths for better reliability
APP_DIR="/root/workspace"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

print_status "Using directories:"
print_status "  App: $APP_DIR"
print_status "  Backend: $BACKEND_DIR"
print_status "  Frontend: $FRONTEND_DIR"

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
    
    # Kill all Node.js processes that might be using our ports
    print_status "Killing Node.js processes..."
    pkill -f "node.*3001" 2>/dev/null || true
    pkill -f "node.*3000" 2>/dev/null || true
    pkill -f "next.*3000" 2>/dev/null || true
    pkill -f "next.*start" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    pkill -f "server.js" 2>/dev/null || true
    pkill -f "standalone/server.js" 2>/dev/null || true
    
    # Kill any processes using our ports (try multiple methods)
    print_status "Freeing up ports 3000 and 3001..."
    
    # Method 1: Using fuser (if available)
    fuser -k 3000/tcp 2>/dev/null || true
    fuser -k 3001/tcp 2>/dev/null || true
    
    # Method 2: Using lsof (if available)
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti:3000 | xargs kill -9 2>/dev/null || true
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi
    
    # Method 3: Using netstat and kill (fallback)
    if command -v netstat >/dev/null 2>&1; then
        netstat -tlnp | grep ":3000 " | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
        netstat -tlnp | grep ":3001 " | awk '{print $7}' | cut -d'/' -f1 | xargs kill -9 2>/dev/null || true
    fi
    
    # Kill PM2 processes
    print_status "Stopping PM2 processes..."
    pm2 stop all 2>/dev/null || true
    pm2 delete all 2>/dev/null || true
    
    # Wait for processes to fully stop
    print_status "Waiting for processes to stop..."
    sleep 5
    
    # Final aggressive cleanup
    print_status "Final cleanup..."
    pkill -9 -f "node" 2>/dev/null || true
    sleep 2
    
    print_success "All existing processes stopped"
}

# Function to check if ports are available
check_ports() {
    print_status "Checking if ports are available..."
    
    # Check port 3001 (backend)
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i:3001 >/dev/null 2>&1; then
            print_error "Port 3001 is still in use:"
            lsof -i:3001
            return 1
        fi
        
        if lsof -i:3000 >/dev/null 2>&1; then
            print_error "Port 3000 is still in use:"
            lsof -i:3000
            return 1
        fi
    else
        # Fallback check using netstat or ss
        if command -v netstat >/dev/null 2>&1; then
            if netstat -tlnp | grep -q ":3000 \|:3001 "; then
                print_error "Ports 3000 or 3001 are still in use:"
                netstat -tlnp | grep ":3000 \|:3001 "
                return 1
            fi
        elif command -v ss >/dev/null 2>&1; then
            if ss -tlnp | grep -q ":3000 \|:3001 "; then
                print_error "Ports 3000 or 3001 are still in use:"
                ss -tlnp | grep ":3000 \|:3001 "
                return 1
            fi
        fi
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
    else
        print_status "Node.js dependencies already installed for backend"
    fi
    
    # Check if Prisma client is generated
    if [ ! -d "node_modules/.prisma" ]; then
        print_status "Generating Prisma client..."
        npm exec prisma generate
    else
        print_status "Prisma client already generated"
    fi
    
    # Build the TypeScript application
    print_status "Building TypeScript application..."
    if npm run build; then
        print_success "Backend build completed successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi
    
    # Skip database operations in development mode
    print_status "Skipping database operations in development mode..."
    
    # Ensure logs directory exists
    mkdir -p "$APP_DIR/logs"
    
    # Start the backend application
    print_status "Starting backend application..."
    cd "$BACKEND_DIR"
    nohup npm start > "$APP_DIR/logs/backend.log" 2> "$APP_DIR/logs/backend-error.log" &
    BACKEND_PID=$!
    
    # Wait for backend to start
    print_status "Waiting for backend to start..."
    sleep 10
    
    # Check if backend is running with detailed error reporting
    print_status "Checking backend availability..."
    local retry_count=0
    local max_retries=6
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s http://localhost:3001/health > /dev/null 2>&1; then
            print_success "Backend application is running on port 3001"
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

# Function to start frontend
start_frontend() {
    print_status "Starting frontend application..."
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_status "Installing Node.js dependencies for frontend..."
        npm install
    else
        print_status "Node.js dependencies already installed for frontend"
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
    
    # Verify standalone server exists
    if [ ! -f ".next/standalone/server.js" ]; then
        print_error "Standalone server not found at .next/standalone/server.js"
        print_status "Build may have failed or standalone output not configured"
        exit 1
    fi
    
    # Ensure logs directory exists
    mkdir -p "$APP_DIR/logs"
    
    # Start the frontend production server
    print_status "Starting Next.js standalone server..."
    cd "$FRONTEND_DIR"
    nohup env HOSTNAME=0.0.0.0 node .next/standalone/server.js > "$APP_DIR/logs/frontend.log" 2> "$APP_DIR/logs/frontend-error.log" &
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

# Main execution
print_status "Starting application startup sequence..."

# Create logs directory
mkdir -p "$APP_DIR/logs"

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
echo "- Stop all processes: $APP_DIR/stop.sh"
echo ""
echo "🔧 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. You should see the VisiPakalpojumi dashboard"
echo "3. If you see JSON, you're on the wrong URL"
echo "4. For external access, use the external IP shown above"
echo ""
echo "✅ Startup complete! Both services are running."