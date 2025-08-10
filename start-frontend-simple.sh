#!/bin/bash

# Simple frontend startup script
set -e

APP_DIR="/workspace"
FRONTEND_DIR="/workspace/frontend"

echo "🚀 Starting Frontend Application..."

# Kill existing frontend processes
echo "Stopping existing frontend processes..."
pkill -f "next-server" 2>/dev/null || true
sleep 2

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Check if build is needed
if [ ! -d ".next" ] || [ ! -f ".next/standalone/server.js" ]; then
    echo "📦 Building Next.js application..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    
    echo "✅ Build completed successfully"
else
    echo "✅ Build already exists"
fi

# Verify standalone server exists
if [ ! -f ".next/standalone/server.js" ]; then
    echo "❌ Standalone server not found!"
    echo "Check next.config.ts for 'output: standalone' setting"
    exit 1
fi

# Copy static assets (required for CSS/JS)
echo "📁 Copying static assets..."
if [ -d ".next/static" ]; then
    mkdir -p ".next/standalone/.next"
    cp -r ".next/static" ".next/standalone/.next/" 2>/dev/null || true
fi

if [ -d "public" ]; then
    cp -r "public" ".next/standalone/" 2>/dev/null || true
fi

# Create logs directory
mkdir -p "$APP_DIR/logs"

# Start the server
echo "🌐 Starting Next.js server..."
nohup env NODE_ENV=production HOSTNAME=0.0.0.0 node .next/standalone/server.js > "$APP_DIR/logs/frontend.log" 2> "$APP_DIR/logs/frontend-error.log" &
FRONTEND_PID=$!

echo "⏳ Waiting for server to start..."
sleep 5

# Test if server is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend server started successfully!"
    echo "🌐 Server running at: http://localhost:3000"
    echo "📊 Process ID: $FRONTEND_PID"
    echo "📝 Logs: tail -f $APP_DIR/logs/frontend.log"
else
    echo "❌ Server failed to start"
    echo "📝 Check logs: cat $APP_DIR/logs/frontend-error.log"
    exit 1
fi