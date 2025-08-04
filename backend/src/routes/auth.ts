import { Router } from 'express';
import {
  register,
  login,
  requestPasswordReset,
  confirmPasswordReset,
  verifyEmail,
  refreshToken
} from '@/controllers/authController';
import {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validatePasswordResetConfirm
} from '@/middleware/validation';
import { authenticate } from '@/middleware/auth';

const router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validatePasswordReset, requestPasswordReset);
router.post('/reset-password', validatePasswordResetConfirm, confirmPasswordReset);
router.post('/verify-email', verifyEmail);

// Protected routes
router.post('/refresh-token', authenticate, refreshToken);

export default router;