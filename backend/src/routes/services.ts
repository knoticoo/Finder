import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// TODO: Implement service routes
// - GET /api/services - List all services
// - GET /api/services/:id - Get service details
// - POST /api/services - Create new service (providers only)
// - PUT /api/services/:id - Update service (owner only)
// - DELETE /api/services/:id - Delete service (owner only)
// - GET /api/services/search - Search services
// - GET /api/services/categories - Get service categories

router.get('/', (req, res) => {
  res.json({ message: 'Service routes - TODO: Implement' });
});

export default router;