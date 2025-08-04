import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { prisma } from '@/config/database';

export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      duration,
      address,
      city,
      postalCode,
      notes,
      totalAmount
    } = req.body;

    // Check if service exists and is available
    const service = await prisma.service.findUnique({
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

    const booking = await prisma.booking.create({
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
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserBookings = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const where: any = {
      customerId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
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

    const total = await prisma.booking.count({ where });

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
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProviderBookings = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const where: any = {
      providerId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
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

    const total = await prisma.booking.count({ where });

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
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getBookingById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const booking = await prisma.booking.findUnique({
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

    // Check if user has access to this booking
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
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const booking = await prisma.booking.findUnique({
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

    // Only providers can update booking status
    if (booking.providerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'Only the service provider can update booking status'
      });
      return;
    }

    const updateData: any = { status };

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.completionNotes = completionNotes;
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const updatedBooking = await prisma.booking.update({
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
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response): Promise<void> => {
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

    const booking = await prisma.booking.findUnique({
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

    const updatedBooking = await prisma.booking.update({
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
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};