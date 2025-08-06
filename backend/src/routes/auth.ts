import { Router } from 'express';
import {
  register,
  login,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  refreshToken,
  googleAuth,
  googleCallback,
  facebookAuth,
  facebookCallback
} from '@/controllers/authController';
import {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validatePasswordResetConfirm
} from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';
import passport from '@/config/passport';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validatePasswordReset, requestPasswordReset);
router.post('/reset-password', validatePasswordResetConfirm, confirmPasswordReset);
router.post('/verify-email', verifyEmail);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/auth/login' }), googleCallback);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/login' }), facebookCallback);

// Protected routes
router.post('/refresh-token', authenticate, refreshToken);

export default router;