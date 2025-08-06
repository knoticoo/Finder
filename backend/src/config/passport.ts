import passport from 'passport';
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

export default passport;