#!/bin/bash

# VisiPakalpojumi - Start Application Script
# This script starts the web application and all required services

set -e  # Exit on any error

echo "🚀 Starting VisiPakalpojumi web application..."

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
   print_error "This script must be run as root"
   exit 1
fi

# Application directory
APP_DIR="/var/www/visipakalpojumi"
BACKEND_DIR="$APP_DIR/backend"

# Check if application directory exists
if [ ! -d "$APP_DIR" ]; then
    print_error "Application directory not found: $APP_DIR"
    print_status "Please run install.sh first or copy your application files to $APP_DIR"
    exit 1
fi

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Check if .env file exists
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        chown www-data:www-data "$BACKEND_DIR/.env"
        print_status "Please edit $BACKEND_DIR/.env with your configuration"
    else
        print_error "No .env.example file found"
        exit 1
    fi
fi

# Navigate to backend directory
cd "$BACKEND_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing Node.js dependencies..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    print_status "Generating Prisma client..."
    npx prisma generate
fi

# Check database connection and run migrations
print_status "Checking database connection..."
if npx prisma db push --accept-data-loss; then
    print_success "Database schema updated"
else
    print_error "Database connection failed"
    print_status "Please check your DATABASE_URL in .env file"
    exit 1
fi

# Stop any existing PM2 processes
print_status "Stopping existing processes..."
pm2 stop visipakalpojumi-backend 2>/dev/null || true
pm2 delete visipakalpojumi-backend 2>/dev/null || true

# Create logs directory if it doesn't exist
mkdir -p "$APP_DIR/logs"
chown www-data:www-data "$APP_DIR/logs"

# Start the backend application with PM2
print_status "Starting backend application..."
pm2 start "npx ts-node -r tsconfig-paths/register src/index.ts" \
    --name "visipakalpojumi-backend" \
    --cwd "$BACKEND_DIR" \
    --env production \
    --log "$APP_DIR/logs/backend.log" \
    --error "$APP_DIR/logs/backend-error.log" \
    --uid www-data

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

# Configure Nginx
print_status "Configuring Nginx..."

# Create Nginx configuration
tee /etc/nginx/sites-available/visipakalpojumi << 'EOF'
server {
    listen 80;
    server_name _;

    # Redirect HTTP to HTTPS (when SSL is configured)
    # return 301 https://$server_name$request_uri;
    
    # For now, serve HTTP directly
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Upload files
    location /uploads/ {
        alias /var/www/visipakalpojumi/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }
}

# HTTPS server (uncomment when SSL is configured)
# server {
#     listen 443 ssl http2;
#     server_name your-domain.com www.your-domain.com;
#
#     # SSL Configuration (will be set up by Certbot)
#     # ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
#     # ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
#
#     # Security headers
#     add_header X-Frame-Options "SAMEORIGIN" always;
#     add_header X-XSS-Protection "1; mode=block" always;
#     add_header X-Content-Type-Options "nosniff" always;
#     add_header Referrer-Policy "no-referrer-when-downgrade" always;
#     add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
#
#     # Gzip compression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_proxied expired no-cache no-store private must-revalidate auth;
#     gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
#
#     # API proxy
#     location /api/ {
#         proxy_pass http://localhost:3001/api/;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         proxy_read_timeout 86400;
#     }
#
#     # WebSocket support
#     location /socket.io/ {
#         proxy_pass http://localhost:3001/socket.io/;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection "upgrade";
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
#
#     # Frontend static files (when frontend is built)
#     location / {
#         root /var/www/visipakalpojumi/frontend/.next;
#         try_files $uri $uri/ /index.html;
#         
#         # Cache static assets
#         location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
#             expires 1y;
#             add_header Cache-Control "public, immutable";
#         }
#     }
#
#     # Health check
#     location /health {
#         proxy_pass http://localhost:3001/health;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
#
#     # Upload files
#     location /uploads/ {
#         alias /var/www/visipakalpojumi/uploads/;
#         expires 1y;
#         add_header Cache-Control "public";
#     }
# }
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/visipakalpojumi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
if nginx -t; then
    print_success "Nginx configuration is valid"
    systemctl reload nginx
else
    print_error "Nginx configuration is invalid"
    exit 1
fi

# Create uploads directory
mkdir -p "$APP_DIR/uploads"
chmod 755 "$APP_DIR/uploads"
chown www-data:www-data "$APP_DIR/uploads"

# Wait for application to start
print_status "Waiting for application to start..."
sleep 5

# Check if application is running
if curl -s http://localhost:3001/health > /dev/null; then
    print_success "Backend application is running on port 3001"
else
    print_error "Backend application failed to start"
    print_status "Check logs with: pm2 logs visipakalpojumi-backend"
    exit 1
fi

# Show status
print_success "Application started successfully!"
echo ""
echo "📊 Application Status:"
pm2 status
echo ""
echo "🌐 Services:"
echo "- Backend API: http://localhost:3001"
echo "- Health Check: http://localhost:3001/health"
echo "- Nginx: http://localhost:80"
echo "- Public Access: http://$(hostname -I | awk '{print $1}'):80"
echo ""
echo "📋 Useful commands:"
echo "- View logs: pm2 logs"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart visipakalpojumi-backend"
echo "- Stop: ./stop.sh"
echo ""
echo "🔧 Next steps:"
echo "1. Update your domain in Nginx configuration"
echo "2. Set up SSL certificate with: certbot --nginx -d your-domain.com"
echo "3. Build and deploy frontend (when ready)"