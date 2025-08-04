#!/bin/bash

# VisiPakalpojumi - Stop Application Script
# This script stops the web application and all related services

set -e  # Exit on any error

echo "🛑 Stopping VisiPakalpojumi web application..."

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

# Stop PM2 processes
print_status "Stopping PM2 processes..."
pm2 stop visipakalpojumi-backend 2>/dev/null || print_warning "No PM2 process found"
pm2 delete visipakalpojumi-backend 2>/dev/null || print_warning "No PM2 process to delete"

# Save PM2 configuration
pm2 save 2>/dev/null || print_warning "No PM2 processes to save"

# Stop Nginx
print_status "Stopping Nginx..."
sudo systemctl stop nginx

# Stop PostgreSQL (optional - uncomment if you want to stop it)
# print_status "Stopping PostgreSQL..."
# sudo systemctl stop postgresql

# Kill any remaining Node.js processes on port 3001
print_status "Checking for remaining processes on port 3001..."
PIDS=$(lsof -ti:3001 2>/dev/null || true)
if [ ! -z "$PIDS" ]; then
    print_status "Killing processes on port 3001: $PIDS"
    kill -9 $PIDS 2>/dev/null || true
fi

# Check if processes are still running
sleep 2

# Final status check
print_status "Checking final status..."

# Check PM2 status
if pm2 list | grep -q "visipakalpojumi-backend"; then
    print_warning "Some PM2 processes may still be running"
    pm2 list
else
    print_success "All PM2 processes stopped"
fi

# Check port 3001
if lsof -ti:3001 >/dev/null 2>&1; then
    print_warning "Port 3001 is still in use"
    lsof -i:3001
else
    print_success "Port 3001 is free"
fi

# Check Nginx status
if sudo systemctl is-active --quiet nginx; then
    print_warning "Nginx is still running"
else
    print_success "Nginx stopped"
fi

# Show system status
echo ""
echo "📊 System Status:"
echo "- PM2 processes:"
pm2 list 2>/dev/null || echo "  No PM2 processes running"
echo ""
echo "- Port 3001:"
if lsof -ti:3001 >/dev/null 2>&1; then
    lsof -i:3001
else
    echo "  Port 3001 is free"
fi
echo ""
echo "- Nginx status:"
sudo systemctl status nginx --no-pager -l || echo "  Nginx not running"
echo ""
echo "- PostgreSQL status:"
sudo systemctl status postgresql --no-pager -l || echo "  PostgreSQL not running"

print_success "Application stopped successfully!"
echo ""
echo "🔄 To restart the application:"
echo "  ./start.sh"
echo ""
echo "📋 Useful commands:"
echo "- Start Nginx: sudo systemctl start nginx"
echo "- Start PostgreSQL: sudo systemctl start postgresql"
echo "- View PM2 logs: pm2 logs"
echo "- Check system resources: htop"