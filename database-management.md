# Database Management System

This project now includes a comprehensive database management system to handle Prisma migration errors (P3005, P3014) and provide clean database lifecycle management.

## Scripts Available

### 1. `delete-database.sh`
- **Purpose**: Completely removes the database and cleans up migration state
- **What it does**:
  - Drops the main database (`visipakalpojumi`)
  - Terminates active database connections
  - Cleans up Prisma migration state
  - Removes Prisma client cache
  - Resets migration files

**Usage:**
```bash
./delete-database.sh
```

### 2. `create-database.sh`
- **Purpose**: Creates a fresh database with proper permissions
- **What it does**:
  - Creates main database (`visipakalpojumi`)
  - Creates shadow database (`visipakalpojumi_shadow`) to fix P3014 errors
  - Sets up proper database permissions
  - Grants CREATEDB permission to postgres user
  - Generates Prisma client
  - Applies initial migrations

**Usage:**
```bash
./create-database.sh
```

### 3. `start-full.sh` (Enhanced)
- **Purpose**: Starts the full application with intelligent database management
- **What it does**:
  - Automatically detects if database exists
  - Creates database if missing
  - Handles P3005 errors (schema not empty) by recreating database
  - Handles P3014 errors (shadow database permissions) by fixing permissions
  - Provides clear error messages and recovery options

**Usage:**
```bash
./start-full.sh
```

## Common Error Solutions

### P3005 Error: "The database schema is not empty"
**Cause**: Database has existing data that conflicts with migrations

**Automatic Solution**: The `start-full.sh` script now automatically detects this error and recreates the database

**Manual Solution**:
```bash
./delete-database.sh
./create-database.sh
# or just run
./start-full.sh
```

### P3014 Error: "Prisma Migrate could not create the shadow database"
**Cause**: Insufficient database permissions to create shadow database

**Automatic Solution**: The system now automatically:
1. Grants CREATEDB permission to postgres user
2. Creates the shadow database manually
3. Retries the migration

**Manual Solution**:
```bash
sudo -u postgres psql -c "ALTER USER postgres CREATEDB;"
sudo -u postgres createdb visipakalpojumi_shadow
```

## Workflow

### Fresh Start (Recommended)
```bash
# 1. Clean slate
./delete-database.sh

# 2. Start application (will create database automatically)
./start-full.sh
```

### Quick Reset
```bash
# If you just want to reset the database without restarting the app
./delete-database.sh
./create-database.sh
```

### Normal Startup
```bash
# Just start the application - it handles everything automatically
./start-full.sh
```

## Database Configuration

- **Main Database**: `visipakalpojumi`
- **Shadow Database**: `visipakalpojumi_shadow`
- **User**: `postgres`
- **Host**: `localhost`
- **Port**: `5432`

## Features

1. **Automatic Database Detection**: Checks if database exists before starting
2. **Intelligent Error Handling**: Detects specific Prisma errors and applies appropriate fixes
3. **Clean State Management**: Proper cleanup of migration state and caches
4. **Permission Management**: Automatically sets up required database permissions
5. **Shadow Database Support**: Creates and manages shadow database for Prisma migrations
6. **Graceful Recovery**: Provides clear instructions for manual intervention if needed

## Troubleshooting

If you encounter issues:

1. **Check PostgreSQL Status**:
   ```bash
   sudo service postgresql status
   sudo service postgresql start  # if not running
   ```

2. **Check Database Permissions**:
   ```bash
   sudo -u postgres psql -c "ALTER USER postgres CREATEDB;"
   ```

3. **Manual Migration**:
   ```bash
   cd backend
   npm exec prisma migrate deploy
   ```

4. **Complete Reset**:
   ```bash
   ./delete-database.sh
   ./start-full.sh
   ```

The system is designed to be resilient and self-healing, automatically handling common Prisma migration issues while providing clear guidance for manual intervention when needed.