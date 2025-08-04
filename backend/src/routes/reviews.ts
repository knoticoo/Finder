import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// TODO: Implement review routes
// - GET /api/reviews - List reviews
// - GET /api/reviews/:id - Get review details
// - POST /api/reviews - Create new review
// - PUT /api/reviews/:id - Update review
// - DELETE /api/reviews/:id - Delete review
// - GET /api/reviews/service/:serviceId - Get service reviews
// - GET /api/reviews/provider/:providerId - Get provider reviews

router.get('/', (req, res) => {
  res.json({ message: 'Review routes - TODO: Implement' });
});

export default router;