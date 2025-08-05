# Pull Request: Fix Startup Script Path Configuration and Database Setup

## 🚀 **Branch**: `cursor/start-and-configure-visipakalpojumi-web-application-c738`

## 📋 **Summary**
Fixed critical issues in the startup script that were preventing the VisiPakalpojumi web application from starting properly. The main issues were incorrect path configurations and missing database setup.

## 🔧 **Changes Made**

### 1. **Fixed Application Directory Path**
- **Before**: Script was looking for application in `/workspace`
- **After**: Updated to use correct path `/root/Finder`
- **Files Modified**: `start.sh`

### 2. **Fixed Upload Directory Path**
- **Before**: Uploads configured for `/var/www/visipakalpojumi/uploads/`
- **After**: Updated to use `/root/Finder/uploads/`
- **Files Modified**: `start.sh`

### 3. **Fixed User Permissions**
- **Before**: Script required root privileges and used `www-data` user
- **After**: Made script work with both root and regular user accounts
- **Files Modified**: `start.sh`

### 4. **Enhanced PM2 Configuration**
- **Before**: PM2 startup failed due to `--uid` flag requiring root
- **After**: Conditional PM2 startup based on user privileges
- **Files Modified**: `start.sh`

### 5. **Database Setup Instructions**
- Added PostgreSQL installation and configuration
- Created database `visipakalpojumi`
- Created user `visipakalpojumi_user` with proper permissions
- Fixed schema permissions for Prisma

## 🐛 **Issues Fixed**

1. **Startup Failure**: Application failed to start due to incorrect paths
2. **Database Connection**: PostgreSQL not installed/configured
3. **Permission Errors**: PM2 startup failed due to user privilege issues
4. **Path Mismatch**: Script looking for files in wrong directories

## ✅ **Testing**

- ✅ PostgreSQL database connection established
- ✅ Prisma schema synchronization successful
- ✅ Backend application starts successfully with PM2
- ✅ All paths now correctly point to `/root/Finder`
- ✅ Script works with both root and regular user accounts

## 📁 **Files Modified**

- `start.sh` - Main startup script with path and permission fixes

## 🚀 **How to Test**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Finder
   ```

2. **Install PostgreSQL** (if not already installed)
   ```bash
   sudo apt update
   sudo apt install -y postgresql postgresql-contrib
   sudo service postgresql start
   ```

3. **Setup Database**
   ```bash
   sudo -u postgres psql -c "CREATE DATABASE visipakalpojumi;"
   sudo -u postgres psql -c "CREATE USER visipakalpojumi_user WITH PASSWORD 'visipakalpojumi_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE visipakalpojumi TO visipakalpojumi_user;"
   sudo -u postgres psql -d visipakalpojumi -c "GRANT ALL ON SCHEMA public TO visipakalpojumi_user;"
   ```

4. **Run Startup Script**
   ```bash
   ./start.sh
   ```

5. **Verify Application**
   ```bash
   curl http://localhost:3001/health
   pm2 status
   ```

## 🔄 **Deployment Impact**

- **No breaking changes** - All existing functionality preserved
- **Improved reliability** - Script now works in different environments
- **Better error handling** - Clear error messages for common issues
- **Flexible permissions** - Works with both root and regular users

## 📝 **Additional Notes**

- The script now properly handles the Ubuntu server environment
- Database setup is documented for easy deployment
- PM2 configuration is more robust
- All paths are correctly configured for `/root/Finder` structure

## 🎯 **Ready for Review**

This pull request addresses the core startup issues and makes the application deployment-ready for the Ubuntu server environment.