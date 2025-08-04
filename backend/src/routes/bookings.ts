import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';
import {
  createBooking,
  getUserBookings,
  getProviderBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from '@/controllers/bookingController';
import { validateBooking } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Customer routes
router.post('/', validateBooking, createBooking);
router.get('/user', getUserBookings);
router.get('/user/:id', getBookingById);
router.put('/user/:id/cancel', cancelBooking);

// Provider routes
router.get('/provider', authorize('PROVIDER'), getProviderBookings);
router.get('/provider/:id', authorize('PROVIDER'), getBookingById);
router.put('/provider/:id/status', authorize('PROVIDER'), updateBookingStatus);

export default router;