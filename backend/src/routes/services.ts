import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceCategories
} from '@/controllers/serviceController';
import { validateService } from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/', getAllServices);
router.get('/categories', getServiceCategories);
router.get('/:id', getServiceById);

// Protected routes (providers only)
router.post('/', authenticate, authorize('PROVIDER'), validateService, createService);
router.put('/:id', authenticate, authorize('PROVIDER'), validateService, updateService);
router.delete('/:id', authenticate, authorize('PROVIDER'), deleteService);

export default router;