"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredNotifications = exports.NotificationService = exports.createNotification = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getUserNotifications = exports.setSocketIO = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let io;
const setSocketIO = (socketIO) => {
    io = socketIO;
};
exports.setSocketIO = setSocketIO;
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { page = '1', limit = '10', type, isRead, priority } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = { userId };
        if (type)
            where.type = type;
        if (isRead !== undefined)
            where.isRead = isRead === 'true';
        if (priority)
            where.priority = priority;
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
    }
    catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};
exports.getUserNotifications = getUserNotifications;
const getUnreadCount = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};
exports.getUnreadCount = getUnreadCount;
const markAsRead = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};
exports.deleteNotification = deleteNotification;
const createNotification = async (data) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                ...data,
                type: data.type || client_1.NotificationType.INFO,
                priority: data.priority || client_1.NotificationPriority.NORMAL
            }
        });
        if (io) {
            io.to(`user:${data.userId}`).emit('notification', notification);
        }
        return notification;
    }
    catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};
exports.createNotification = createNotification;
exports.NotificationService = {
    bookingCreated: (userId, bookingId, serviceName) => (0, exports.createNotification)({
        userId,
        title: 'New Booking Confirmed',
        message: `Your booking for ${serviceName} has been confirmed.`,
        type: client_1.NotificationType.BOOKING_UPDATE,
        priority: client_1.NotificationPriority.HIGH,
        actionUrl: `/dashboard/bookings/${bookingId}`,
        actionText: 'View Booking',
        relatedId: bookingId,
        relatedType: 'booking'
    }),
    bookingStatusUpdated: (userId, bookingId, status, serviceName) => (0, exports.createNotification)({
        userId,
        title: 'Booking Status Updated',
        message: `Your booking for ${serviceName} is now ${status.toLowerCase()}.`,
        type: client_1.NotificationType.BOOKING_UPDATE,
        priority: client_1.NotificationPriority.NORMAL,
        actionUrl: `/dashboard/bookings/${bookingId}`,
        actionText: 'View Booking',
        relatedId: bookingId,
        relatedType: 'booking'
    }),
    messageReceived: (userId, senderName, conversationId) => (0, exports.createNotification)({
        userId,
        title: 'New Message',
        message: `${senderName} sent you a message.`,
        type: client_1.NotificationType.MESSAGE_RECEIVED,
        priority: client_1.NotificationPriority.NORMAL,
        actionUrl: `/dashboard/messages/${conversationId}`,
        actionText: 'View Message',
        relatedId: conversationId,
        relatedType: 'message'
    }),
    reviewReceived: (userId, rating, serviceName, reviewId) => (0, exports.createNotification)({
        userId,
        title: 'New Review Received',
        message: `You received a ${rating}-star review for ${serviceName}.`,
        type: client_1.NotificationType.REVIEW_RECEIVED,
        priority: client_1.NotificationPriority.NORMAL,
        actionUrl: `/dashboard/reviews/${reviewId}`,
        actionText: 'View Review',
        relatedId: reviewId,
        relatedType: 'review'
    }),
    paymentReceived: (userId, amount, serviceName, paymentId) => (0, exports.createNotification)({
        userId,
        title: 'Payment Received',
        message: `You received €${amount.toFixed(2)} payment for ${serviceName}.`,
        type: client_1.NotificationType.PAYMENT_UPDATE,
        priority: client_1.NotificationPriority.HIGH,
        actionUrl: `/dashboard/payments/${paymentId}`,
        actionText: 'View Payment',
        relatedId: paymentId,
        relatedType: 'payment'
    }),
    serviceApproved: (userId, serviceName, serviceId) => (0, exports.createNotification)({
        userId,
        title: 'Service Approved',
        message: `Your service "${serviceName}" has been approved and is now live.`,
        type: client_1.NotificationType.SERVICE_UPDATE,
        priority: client_1.NotificationPriority.HIGH,
        actionUrl: `/dashboard/services/${serviceId}`,
        actionText: 'View Service',
        relatedId: serviceId,
        relatedType: 'service'
    }),
    serviceRejected: (userId, serviceName, reason, serviceId) => (0, exports.createNotification)({
        userId,
        title: 'Service Rejected',
        message: `Your service "${serviceName}" was rejected. Reason: ${reason}`,
        type: client_1.NotificationType.SERVICE_UPDATE,
        priority: client_1.NotificationPriority.HIGH,
        actionUrl: `/dashboard/services/${serviceId}`,
        actionText: 'Edit Service',
        relatedId: serviceId,
        relatedType: 'service'
    }),
    welcomeMessage: (userId, userName) => (0, exports.createNotification)({
        userId,
        title: 'Welcome to VisiPakalpojumi!',
        message: `Welcome ${userName}! Complete your profile to get started.`,
        type: client_1.NotificationType.INFO,
        priority: client_1.NotificationPriority.NORMAL,
        actionUrl: '/dashboard/profile',
        actionText: 'Complete Profile'
    }),
    specialOffer: (userId, title, description, offerUrl) => (0, exports.createNotification)({
        userId,
        title,
        message: description,
        type: client_1.NotificationType.PROMOTIONAL,
        priority: client_1.NotificationPriority.LOW,
        actionUrl: offerUrl,
        actionText: 'View Offer',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })
};
const cleanupExpiredNotifications = async () => {
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
    }
    catch (error) {
        console.error('Error cleaning up expired notifications:', error);
        throw error;
    }
};
exports.cleanupExpiredNotifications = cleanupExpiredNotifications;
//# sourceMappingURL=notifications.js.map