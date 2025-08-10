# VisiPakalpojumi - VPS Fixes

This document contains the fixes for the authentication and admin issues you encountered.

## 🔧 Issues Fixed

1. **User not having admin privileges** - Script to update your user role to ADMIN
2. **Services page logging you out** - Improved authentication handling
3. **JWT token expiration issues** - Added automatic token refresh

## 📋 Step-by-Step Instructions

### 1. Make User Admin

Run this command on your VPS in the backend directory:

```bash
cd /path/to/your/backend
node make-admin.js
```

This script will:
- Look for user with email `emalinovskis@me.com`
- Update the role to ADMIN if found
- Show all users if the email doesn't match
- Verify the user is active and verified

**If the email is different:**
1. Edit the `make-admin.js` file
2. Replace `emalinovskis@me.com` with your actual email
3. Run the script again

### 2. Update Frontend Files

The following files have been updated to fix authentication issues:

#### New Files:
- `frontend/src/hooks/useAuth.ts` - Authentication state management
- `frontend/src/components/providers/AuthProvider.tsx` - Authentication provider

#### Updated Files:
- `frontend/src/app/services/page.tsx` - Now authentication-aware
- `frontend/src/components/providers/Providers.tsx` - Includes AuthProvider
- `frontend/src/lib/api.ts` - Improved error handling and token refresh
- `backend/src/controllers/authController.ts` - Added proper token refresh

### 3. Deploy Updates

1. **Stop your application:**
   ```bash
   pm2 stop all
   # or however you're running the app
   ```

2. **Update the files** (copy the updated files to your VPS)

3. **Install any missing dependencies:**
   ```bash
   cd frontend
   npm install
   npm run build

   cd ../backend
   npm install
   ```

4. **Start the application:**
   ```bash
   pm2 start all
   # or however you start your app
   ```

## 🔍 What Was Fixed

### Authentication Issues
- **Services page no longer logs you out** - Now properly handles authentication state
- **Token refresh** - Automatically refreshes expired tokens instead of logging out
- **Better error handling** - Network errors don't cause unnecessary logouts
- **User role display** - Shows admin/provider badges in the UI

### JWT Token Improvements
- **Automatic refresh** - Tokens are refreshed automatically before they expire
- **Queue management** - Multiple requests during token refresh are properly handled
- **Better error messages** - More informative error messages for debugging

### Admin Features
- **Role management** - Easy script to make users admin
- **User verification** - Admin users are automatically verified and active

## 🧪 Testing

After applying the fixes:

1. **Test admin access:**
   - Login with your account
   - You should see "Admin" badge in the services page
   - Try accessing admin-only features

2. **Test services page:**
   - Go to `/services`
   - Should show your login status
   - Should not log you out
   - Should show proper booking options

3. **Test token refresh:**
   - Use the app for extended periods
   - Tokens should refresh automatically
   - No unexpected logouts

## 🚨 Troubleshooting

### Script Issues
```bash
# If the admin script fails:
1. Make sure PostgreSQL is running
2. Check your DATABASE_URL in .env
3. Make sure no other Node.js processes are using the database
```

### Authentication Issues
```bash
# If auth still doesn't work:
1. Clear browser storage (localStorage)
2. Check browser console for errors
3. Verify backend is running and accessible
4. Check network tab for API call failures
```

### Token Issues
```bash
# If tokens still expire:
1. Check JWT_SECRET and JWT_EXPIRES_IN in backend .env
2. Verify the refresh endpoint is working: POST /api/auth/refresh-token
3. Check browser console for refresh errors
```

## 📧 Your Credentials

- **Email:** emalinovskis@me.com
- **Password:** Millie1991
- **New Role:** ADMIN (after running the script)

## 🎯 Next Steps

1. Run the admin script
2. Deploy the updated files
3. Test the authentication
4. Enjoy your admin privileges!

The app should now work smoothly without unexpected logouts when navigating to the services page.