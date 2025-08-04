import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  updateProviderProfile,
  deleteAccount,
  getUserStats
} from '@/controllers/userController';
import { authenticate, authorize } from '@/middleware/auth';
import { body } from 'express-validator';
import { handleValidationErrors } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', [
  body('firstName').optional().trim().isLength({ min: 2, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('language').optional().isIn(['LATVIAN', 'RUSSIAN', 'ENGLISH']),
  handleValidationErrors
], updateProfile);

// Update provider profile (only for providers)
router.put('/provider-profile', [
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('address').optional().trim().isLength({ min: 5, max: 200 }),
  body('city').optional().trim().isLength({ min: 2, max: 50 }),
  body('postalCode').optional().trim().isLength({ min: 4, max: 10 }),
  body('website').optional().isURL(),
  body('hasInsurance').optional().isBoolean(),
  body('insuranceDetails').optional().trim().isLength({ min: 5, max: 500 }),
  body('certifications').optional().isArray(),
  body('businessHours').optional().isObject(),
  handleValidationErrors
], updateProviderProfile);

// Get user statistics
router.get('/stats', getUserStats);

// Delete account
router.delete('/account', deleteAccount);

export default router;