import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  sendMessage,
  getConversation,
  getUserConversations,
  markAsRead,
  deleteMessage
} from '@/controllers/messageController';
import { validateMessage } from '@/middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Message routes
router.post('/', validateMessage, sendMessage);
router.get('/conversations', getUserConversations);
router.get('/conversation', getConversation);
router.put('/read', markAsRead);
router.delete('/:id', deleteMessage);

export default router;