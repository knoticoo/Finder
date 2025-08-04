import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import {
  createReview,
  getServiceReviews,
  getProviderReviews,
  updateReview,
  deleteReview,
  respondToReview
} from '@/controllers/reviewController';
import { validateReview } from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.post('/', authenticate, validateReview, createReview);
router.put('/:id', authenticate, validateReview, updateReview);
router.delete('/:id', authenticate, deleteReview);
router.post('/:id/respond', authenticate, authorize('PROVIDER'), respondToReview);

export default router;