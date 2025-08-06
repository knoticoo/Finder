import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { prisma } from './database';
import { generateToken } from '@/utils/jwt';

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isVerified: true
      }
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          }
        });

        if (user) {
          // Update Google ID if not set
          if (!user.googleId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { googleId: profile.id },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                language: true,
                isVerified: true
              }
            });
          }
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0]?.value || '',
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              role: 'CUSTOMER',
              language: 'LATVIAN',
              isVerified: true, // Google accounts are pre-verified
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              language: true,
              isVerified: true
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'emails', 'name'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Facebook ID
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { facebookId: profile.id },
              { email: profile.emails?.[0]?.value }
            ]
          }
        });

        if (user) {
          // Update Facebook ID if not set
          if (!user.facebookId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { facebookId: profile.id },
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                language: true,
                isVerified: true
              }
            });
          }
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              facebookId: profile.id,
              email: profile.emails?.[0]?.value || '',
              firstName: profile.name?.givenName || '',
              lastName: profile.name?.familyName || '',
              role: 'CUSTOMER',
              language: 'LATVIAN',
              isVerified: true, // Facebook accounts are pre-verified
            },
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              language: true,
              isVerified: true
            }
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;