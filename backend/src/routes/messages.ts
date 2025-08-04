import { Router } from 'express';
import { authenticate, authorize } from '@/middleware/auth';

const router = Router();

// TODO: Implement message routes
// - GET /api/messages - List user messages
// - GET /api/messages/:id - Get message details
// - POST /api/messages - Send new message
// - PUT /api/messages/:id/read - Mark message as read
// - DELETE /api/messages/:id - Delete message
// - GET /api/messages/conversation/:userId - Get conversation with user
// - GET /api/messages/booking/:bookingId - Get booking messages

router.get('/', (req, res) => {
  res.json({ message: 'Message routes - TODO: Implement' });
});

export default router;