"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMessage = exports.markAsRead = exports.getUserConversations = exports.getConversation = exports.sendMessage = void 0;
const database_1 = require("@/config/database");
const sendMessage = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { receiverId, bookingId, content, messageType = 'TEXT', attachments } = req.body;
        if (bookingId) {
            const booking = await database_1.prisma.booking.findUnique({
                where: { id: bookingId }
            });
            if (!booking) {
                res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
                return;
            }
            if (booking.customerId !== req.user.id && booking.providerId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied to this booking'
                });
                return;
            }
        }
        const message = await database_1.prisma.message.create({
            data: {
                senderId: req.user.id,
                receiverId,
                bookingId,
                content,
                messageType,
                attachments: attachments || []
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.sendMessage = sendMessage;
const getConversation = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { otherUserId, bookingId } = req.query;
        const { page = 1, limit = 50 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            OR: [
                {
                    senderId: req.user.id,
                    receiverId: otherUserId
                },
                {
                    senderId: otherUserId,
                    receiverId: req.user.id
                }
            ]
        };
        if (bookingId) {
            where.bookingId = bookingId;
        }
        const messages = await database_1.prisma.message.findMany({
            where,
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await database_1.prisma.message.count({ where });
        res.status(200).json({
            success: true,
            data: messages.reverse(),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getConversation = getConversation;
const getUserConversations = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const conversations = await database_1.prisma.message.findMany({
            where: {
                OR: [
                    { senderId: req.user.id },
                    { receiverId: req.user.id }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                booking: {
                    select: {
                        id: true,
                        service: {
                            select: {
                                title: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        const conversationMap = new Map();
        conversations.forEach(message => {
            const otherUserId = message.senderId === req.user.id
                ? message.receiverId
                : message.senderId;
            if (!conversationMap.has(otherUserId)) {
                conversationMap.set(otherUserId, {
                    otherUser: message.senderId === req.user.id
                        ? message.receiver
                        : message.sender,
                    lastMessage: message,
                    unreadCount: 0
                });
            }
        });
        const conversationList = Array.from(conversationMap.values());
        res.status(200).json({
            success: true,
            data: conversationList
        });
    }
    catch (error) {
        console.error('Get user conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUserConversations = getUserConversations;
const markAsRead = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { messageIds } = req.body;
        if (!Array.isArray(messageIds)) {
            res.status(400).json({
                success: false,
                message: 'messageIds must be an array'
            });
            return;
        }
        await database_1.prisma.message.updateMany({
            where: {
                id: { in: messageIds },
                receiverId: req.user.id,
                isRead: false
            },
            data: {
                isRead: true,
                readAt: new Date()
            }
        });
        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.markAsRead = markAsRead;
const deleteMessage = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const message = await database_1.prisma.message.findUnique({
            where: { id }
        });
        if (!message) {
            res.status(404).json({
                success: false,
                message: 'Message not found'
            });
            return;
        }
        if (message.senderId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only delete your own messages'
            });
            return;
        }
        await database_1.prisma.message.delete({
            where: { id }
        });
        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.deleteMessage = deleteMessage;
//# sourceMappingURL=messageController.js.map