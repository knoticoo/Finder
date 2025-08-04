#!/bin/bash

# VisiPakalpojumi - Installation Script
# This script installs all dependencies for the web application on Ubuntu 24.04

set -e  # Exit on any error

echo "🚀 Starting VisiPakalpojumi installation..."

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
   print_status "Running as root - proceeding with installation"
else
   print_error "This script must be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 20.x
print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_success "Node.js $NODE_VERSION and npm $NPM_VERSION installed"

# Install PostgreSQL 17
print_status "Installing PostgreSQL 17..."
sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt update
apt install -y postgresql-17 postgresql-contrib-17

# Start and enable PostgreSQL
print_status "Starting PostgreSQL service..."
systemctl start postgresql
systemctl enable postgresql

# Install Nginx
print_status "Installing Nginx..."
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Install PM2 globally
print_status "Installing PM2 process manager..."
npm install -g pm2

# Install additional tools
print_status "Installing additional tools..."
apt install -y net-tools htop tree

# Create application directory
print_status "Creating application directory..."
mkdir -p /var/www/visipakalpojumi
chown www-data:www-data /var/www/visipakalpojumi

# Set up firewall
print_status "Configuring firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3001
ufw --force enable

# Install Certbot for SSL certificates
print_status "Installing Certbot for SSL certificates..."
apt install -y certbot python3-certbot-nginx

# Create environment file template
print_status "Creating environment file template..."
cat > /var/www/visipakalpojumi/.env.example << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://visipakalpojumi_user:your_password@localhost:5432/visipakalpojumi"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server Configuration
PORT=3001
NODE_ENV="production"
FRONTEND_URL="https://your-domain.com"

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

# Set proper permissions
chown www-data:www-data /var/www/visipakalpojumi/.env.example
chmod 644 /var/www/visipakalpojumi/.env.example

print_success "Installation completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Copy your application files to /var/www/visipakalpojumi"
echo "2. Configure your .env file with real values"
echo "3. Run the database setup script"
echo "4. Start the application with ./start.sh"
echo ""
echo "🔧 Useful commands:"
echo "- Check PostgreSQL status: systemctl status postgresql"
echo "- Check Nginx status: systemctl status nginx"
echo "- View logs: pm2 logs"
echo "- Monitor processes: pm2 monit"