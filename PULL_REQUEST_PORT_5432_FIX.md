# Pull Request: Fix Port 5432 Conflict in Application Startup

## Problem
The application startup script `start-full.sh` was failing with the error:
```
[WARNING] Port 5432 is already in use
[ERROR] Could not free up ports after 3 attempts. Exiting.
```

This was happening because:
1. Missing network diagnostic tools (`ss`, `netstat`, `lsof`) on the system
2. Incorrect port checking logic that treated PostgreSQL on port 5432 as a conflict

## Root Cause Analysis
1. **Missing Network Tools**: The startup script uses `ss -tlnp` to check port usage, but `ss` was not installed, causing the port check to fail silently and report false positives.

2. **Flawed Port Logic**: The `check_ports()` function included port 5432 in the list of ports that should be "free", but PostgreSQL is supposed to run on port 5432.

3. **Inconsistent Port Arrays**: The script had two different port arrays:
   - `check_ports()`: `(3000 3001 5432)` - checked all three ports as "should be free"
   - `kill_existing_processes()`: `(3000 3001)` - only killed processes on app ports

## Solution

### 1. Install Required Network Tools
```bash
sudo apt update && sudo apt install -y iproute2 net-tools procps psmisc
```

This provides:
- `ss` (from iproute2) - socket statistics
- `netstat` (from net-tools) - network connections  
- `lsof` (from psmisc) - list open files
- Process management tools (from procps)

### 2. Install and Start PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
sudo service postgresql start
```

### 3. Fix Port Checking Logic
Modified the `check_ports()` function in `start-full.sh`:

**Before:**
```bash
check_ports() {
    local ports=(3000 3001 5432)  # Treated 5432 as should be free
    local available=true
    
    for port in "${ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            print_warning "Port $port is already in use"
            available=false
        fi
    done
    # ... rest of function
}
```

**After:**
```bash
check_ports() {
    local app_ports=(3000 3001)  # Only check app ports as should be free
    local available=true
    
    for port in "${app_ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            print_warning "Port $port is already in use"
            available=false
        fi
    done
    
    # Check PostgreSQL port separately - it should be running
    if ss -tlnp | grep -q ":5432 "; then
        if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
            print_status "PostgreSQL is running on port 5432 (expected)"
        else
            print_warning "Port 5432 is in use but PostgreSQL is not responding properly"
            available=false
        fi
    else
        print_status "PostgreSQL is not running on port 5432 - will start it"
    fi
    # ... rest of function
}
```

## Changes Made

### Files Modified
- `start-full.sh`: Updated `check_ports()` function to properly handle PostgreSQL on port 5432

### Key Improvements
1. **Separated App Ports from Database Port**: Application ports (3000, 3001) are checked as "should be free", while PostgreSQL port (5432) is checked as "should be running"

2. **Intelligent PostgreSQL Detection**: 
   - If port 5432 is in use, check if it's PostgreSQL responding properly
   - If PostgreSQL is not running, the script will start it
   - Only report an error if port 5432 is occupied by something other than a working PostgreSQL instance

3. **Better Error Messages**: Clear distinction between app port conflicts and database status

## Testing
The fix can be verified by:
1. Ensuring PostgreSQL is running: `pg_isready -h localhost -p 5432`
2. Checking port status: `ss -tlnp | grep :5432`
3. Running the startup script: `./start-full.sh`

## Impact
- ✅ Resolves startup failures due to false port conflicts
- ✅ Allows proper PostgreSQL detection and management
- ✅ Maintains existing functionality for app port checking
- ✅ Provides clearer error messages for debugging

## Dependencies
This fix requires the following system packages to be installed:
- `iproute2` (provides `ss` command)
- `postgresql` (database server)
- `net-tools` (provides `netstat` - optional but helpful)
- `psmisc` (provides `lsof` - optional but helpful)

The startup script will handle PostgreSQL startup automatically once these dependencies are installed.