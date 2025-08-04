#!/bin/bash

# VisiPakalpojumi - Setup Script
# This script copies application files and sets up the database

set -e  # Exit on any error

echo "🔧 Setting up VisiPakalpojumi application..."

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
   print_status "Running as root - proceeding with setup"
else
   print_error "This script must be run as root"
   exit 1
fi

# Application directory
APP_DIR="/var/www/visipakalpojumi"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"

# Create application directory structure
print_status "Creating application directory structure..."
mkdir -p "$APP_DIR"
mkdir -p "$BACKEND_DIR"
mkdir -p "$FRONTEND_DIR"
mkdir -p "$APP_DIR/logs"
mkdir -p "$APP_DIR/uploads"

# Set proper ownership
chown -R www-data:www-data "$APP_DIR"

# Copy backend files
print_status "Copying backend files..."
if [ -d "backend" ]; then
    cp -r backend/* "$BACKEND_DIR/"
    chown -R www-data:www-data "$BACKEND_DIR"
    print_success "Backend files copied"
else
    print_error "Backend directory not found in current location"
    exit 1
fi

# Copy frontend files
print_status "Copying frontend files..."
if [ -d "frontend" ]; then
    cp -r frontend/* "$FRONTEND_DIR/"
    chown -R www-data:www-data "$FRONTEND_DIR"
    print_success "Frontend files copied"
else
    print_warning "Frontend directory not found - skipping"
fi

# Copy scripts
print_status "Copying scripts..."
cp install.sh start.sh stop.sh "$APP_DIR/"
chmod +x "$APP_DIR"/*.sh
chown www-data:www-data "$APP_DIR"/*.sh
print_success "Scripts copied"

# Set up database
print_status "Setting up database..."

# Create database user and database
print_status "Creating PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE USER visipakalpojumi_user WITH PASSWORD 'visipakalpojumi_password';" 2>/dev/null || print_warning "User may already exist"
sudo -u postgres psql -c "CREATE DATABASE visipakalpojumi OWNER visipakalpojumi_user;" 2>/dev/null || print_warning "Database may already exist"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE visipakalpojumi TO visipakalpojumi_user;"

# Create .env file if it doesn't exist
if [ ! -f "$BACKEND_DIR/.env" ]; then
    print_status "Creating .env file..."
    cat > "$BACKEND_DIR/.env" << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://visipakalpojumi_user:visipakalpojumi_password@localhost:5432/visipakalpojumi"

# JWT Configuration
JWT_SECRET="visipakalpojumi-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="production"
FRONTEND_URL="http://localhost:3000"

# Email Configuration (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@your-domain.com"

# Payment Configuration (Stripe)
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"

# File Upload Configuration
UPLOAD_PATH="/var/www/visipakalpojumi/uploads"
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL="info"
EOF
    chown www-data:www-data "$BACKEND_DIR/.env"
    chmod 600 "$BACKEND_DIR/.env"
    print_success ".env file created"
else
    print_status ".env file already exists"
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm install

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

# Run database migrations
print_status "Running database migrations..."
npx prisma db push --accept-data-loss

print_success "Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit $BACKEND_DIR/.env with your real configuration"
echo "2. Run: cd $APP_DIR && ./start.sh"
echo "3. Access your application at: http://$(hostname -I | awk '{print $1}'):80"
echo ""
echo "🔧 Useful commands:"
echo "- Start application: cd $APP_DIR && ./start.sh"
echo "- Stop application: cd $APP_DIR && ./stop.sh"
echo "- View logs: pm2 logs"
echo "- Check status: pm2 status"