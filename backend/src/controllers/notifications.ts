import { Request, Response } from 'express';
import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';
import { AuthRequest } from '@/types/auth';
import { Server } from 'socket.io';

const prisma = new PrismaClient();

// Store io instance
let io: Server;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

// Get all notifications for a user
export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = '1', limit = '10', type, isRead, priority } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where: any = { userId };
    if (type) where.type = type;
    if (isRead !== undefined) where.isRead = isRead === 'true';
    if (priority) where.priority = priority;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where })
    ]);

    res.json({
      notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json(updatedNotification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const notification = await prisma.notification.findFirst({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id }
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Create notification (internal use)
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  expiresAt?: Date;
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        ...data,
        type: data.type || NotificationType.INFO,
        priority: data.priority || NotificationPriority.NORMAL
      }
    });

    // Send real-time notification if socket.io is available
    if (io) {
      io.to(`user:${data.userId}`).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Notification service functions
export const NotificationService = {
  // Booking notifications
  bookingCreated: (userId: string, bookingId: string, serviceName: string) =>
    createNotification({
      userId,
      title: 'New Booking Confirmed',
      message: `Your booking for ${serviceName} has been confirmed.`,
      type: NotificationType.BOOKING_UPDATE,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'View Booking',
      relatedId: bookingId,
      relatedType: 'booking'
    }),

  bookingStatusUpdated: (userId: string, bookingId: string, status: string, serviceName: string) =>
    createNotification({
      userId,
      title: 'Booking Status Updated',
      message: `Your booking for ${serviceName} is now ${status.toLowerCase()}.`,
      type: NotificationType.BOOKING_UPDATE,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/dashboard/bookings/${bookingId}`,
      actionText: 'View Booking',
      relatedId: bookingId,
      relatedType: 'booking'
    }),

  // Message notifications
  messageReceived: (userId: string, senderName: string, conversationId: string) =>
    createNotification({
      userId,
      title: 'New Message',
      message: `${senderName} sent you a message.`,
      type: NotificationType.MESSAGE_RECEIVED,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/dashboard/messages/${conversationId}`,
      actionText: 'View Message',
      relatedId: conversationId,
      relatedType: 'message'
    }),

  // Review notifications
  reviewReceived: (userId: string, rating: number, serviceName: string, reviewId: string) =>
    createNotification({
      userId,
      title: 'New Review Received',
      message: `You received a ${rating}-star review for ${serviceName}.`,
      type: NotificationType.REVIEW_RECEIVED,
      priority: NotificationPriority.NORMAL,
      actionUrl: `/dashboard/reviews/${reviewId}`,
      actionText: 'View Review',
      relatedId: reviewId,
      relatedType: 'review'
    }),

  // Payment notifications
  paymentReceived: (userId: string, amount: number, serviceName: string, paymentId: string) =>
    createNotification({
      userId,
      title: 'Payment Received',
      message: `You received €${amount.toFixed(2)} payment for ${serviceName}.`,
      type: NotificationType.PAYMENT_UPDATE,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/payments/${paymentId}`,
      actionText: 'View Payment',
      relatedId: paymentId,
      relatedType: 'payment'
    }),

  // Service notifications
  serviceApproved: (userId: string, serviceName: string, serviceId: string) =>
    createNotification({
      userId,
      title: 'Service Approved',
      message: `Your service "${serviceName}" has been approved and is now live.`,
      type: NotificationType.SERVICE_UPDATE,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/services/${serviceId}`,
      actionText: 'View Service',
      relatedId: serviceId,
      relatedType: 'service'
    }),

  serviceRejected: (userId: string, serviceName: string, reason: string, serviceId: string) =>
    createNotification({
      userId,
      title: 'Service Rejected',
      message: `Your service "${serviceName}" was rejected. Reason: ${reason}`,
      type: NotificationType.SERVICE_UPDATE,
      priority: NotificationPriority.HIGH,
      actionUrl: `/dashboard/services/${serviceId}`,
      actionText: 'Edit Service',
      relatedId: serviceId,
      relatedType: 'service'
    }),

  // System notifications
  welcomeMessage: (userId: string, userName: string) =>
    createNotification({
      userId,
      title: 'Welcome to VisiPakalpojumi!',
      message: `Welcome ${userName}! Complete your profile to get started.`,
      type: NotificationType.INFO,
      priority: NotificationPriority.NORMAL,
      actionUrl: '/dashboard/profile',
      actionText: 'Complete Profile'
    }),

  // Promotional notifications
  specialOffer: (userId: string, title: string, description: string, offerUrl?: string) =>
    createNotification({
      userId,
      title,
      message: description,
      type: NotificationType.PROMOTIONAL,
      priority: NotificationPriority.LOW,
      actionUrl: offerUrl,
      actionText: 'View Offer',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })
};

// Clean up expired notifications (can be run as a cron job)
export const cleanupExpiredNotifications = async () => {
  try {
    const result = await prisma.notification.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`Cleaned up ${result.count} expired notifications`);
    return result.count;
  } catch (error) {
    console.error('Error cleaning up expired notifications:', error);
    throw error;
  }
};