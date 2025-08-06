# OAuth Authentication Setup

This document explains how to set up Google and Facebook OAuth authentication for the VisiPakalpojumi application.

## Overview

The application now supports social authentication through Google and Facebook OAuth providers. Users can register and login using their existing social media accounts.

## Features Added

✅ **Register Page Fixed** - Removed client-side exception error caused by useLocale dependency
✅ **Google OAuth** - Complete integration with Google OAuth 2.0  
✅ **Facebook OAuth** - Complete integration with Facebook Login
✅ **Backend OAuth Routes** - /api/auth/google and /api/auth/facebook endpoints
✅ **Frontend OAuth Buttons** - Functional buttons on both login and register pages
✅ **OAuth Callback Handler** - Dedicated page to handle OAuth redirects
✅ **Database Schema** - Added googleId and facebookId fields to User model

## Setup Instructions

1. Configure OAuth credentials in backend/.env:
   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
   - FACEBOOK_APP_ID and FACEBOOK_APP_SECRET
   - SESSION_SECRET for OAuth sessions

2. Run database migration: npx prisma migrate dev --name add-oauth-fields

3. Test the OAuth flow by clicking the social login buttons

## OAuth Flow
1. User clicks Google/Facebook button
2. Redirected to OAuth provider
3. After authentication, redirected to /auth/callback
4. Token stored and user redirected to dashboard
