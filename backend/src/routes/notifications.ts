import express from 'express';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '@/controllers/notifications';
import { authenticateToken } from '@/middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get user notifications with pagination and filtering
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;