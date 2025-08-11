"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.updateBookingStatus = exports.getBookingById = exports.getProviderBookings = exports.getUserBookings = exports.createBooking = void 0;
const database_1 = require("../config/database");
const createBooking = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { serviceId, scheduledDate, scheduledTime, duration, address, city, postalCode, notes, totalAmount } = req.body;
        const service = await database_1.prisma.service.findUnique({
            where: { id: serviceId },
            include: { provider: true }
        });
        if (!service) {
            res.status(404).json({
                success: false,
                message: 'Service not found'
            });
            return;
        }
        if (!service.isAvailable) {
            res.status(400).json({
                success: false,
                message: 'Service is not available'
            });
            return;
        }
        const booking = await database_1.prisma.booking.create({
            data: {
                customerId: req.user.id,
                providerId: service.providerId,
                serviceId,
                scheduledDate: new Date(scheduledDate),
                scheduledTime,
                duration,
                address,
                city,
                postalCode,
                notes,
                totalAmount
            },
            include: {
                service: {
                    include: {
                        provider: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                },
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    }
    catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.createBooking = createBooking;
const getUserBookings = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            customerId: req.user.id
        };
        if (status) {
            where.status = status;
        }
        const bookings = await database_1.prisma.booking.findMany({
            where,
            include: {
                service: {
                    include: {
                        provider: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatar: true
                            }
                        }
                    }
                }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await database_1.prisma.booking.count({ where });
        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getUserBookings = getUserBookings;
const getProviderBookings = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'PROVIDER') {
            res.status(403).json({
                success: false,
                message: 'Only providers can access provider bookings'
            });
            return;
        }
        const { page = 1, limit = 10, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const where = {
            providerId: req.user.id
        };
        if (status) {
            where.status = status;
        }
        const bookings = await database_1.prisma.booking.findMany({
            where,
            include: {
                service: true,
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true
                    }
                }
            },
            skip,
            take: Number(limit),
            orderBy: { createdAt: 'desc' }
        });
        const total = await database_1.prisma.booking.count({ where });
        res.status(200).json({
            success: true,
            data: bookings,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get provider bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProviderBookings = getProviderBookings;
const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const booking = await database_1.prisma.booking.findUnique({
            where: { id },
            include: {
                service: {
                    include: {
                        provider: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                                avatar: true
                            }
                        }
                    }
                },
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        avatar: true
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
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
                message: 'Access denied'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: booking
        });
    }
    catch (error) {
        console.error('Get booking by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getBookingById = getBookingById;
const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completionNotes } = req.body;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const booking = await database_1.prisma.booking.findUnique({
            where: { id },
            select: { providerId: true, status: true }
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }
        if (booking.providerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'Only the service provider can update booking status'
            });
            return;
        }
        const updateData = { status };
        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
            updateData.completionNotes = completionNotes;
        }
        else if (status === 'CANCELLED') {
            updateData.cancelledAt = new Date();
        }
        const updatedBooking = await database_1.prisma.booking.update({
            where: { id },
            data: updateData,
            include: {
                service: true,
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Booking status updated successfully',
            data: updatedBooking
        });
    }
    catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateBookingStatus = updateBookingStatus;
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason } = req.body;
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        const booking = await database_1.prisma.booking.findUnique({
            where: { id },
            select: { customerId: true, status: true }
        });
        if (!booking) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }
        if (booking.customerId !== req.user.id) {
            res.status(403).json({
                success: false,
                message: 'You can only cancel your own bookings'
            });
            return;
        }
        if (booking.status === 'CANCELLED') {
            res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
            return;
        }
        const updatedBooking = await database_1.prisma.booking.update({
            where: { id },
            data: {
                status: 'CANCELLED',
                cancelledAt: new Date(),
                cancellationReason
            }
        });
        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: updatedBooking
        });
    }
    catch (error) {
        console.error('Cancel booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.cancelBooking = cancelBooking;
//# sourceMappingURL=bookingController.js.map