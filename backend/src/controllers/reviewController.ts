import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { prisma } from '@/config/database';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const {
      bookingId,
      rating,
      title,
      comment,
      images
    } = req.body;

    // Check if booking exists and belongs to user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true
      }
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
        message: 'You can only review your own bookings'
      });
      return;
    }

    if (booking.status !== 'COMPLETED') {
      res.status(400).json({
        success: false,
        message: 'You can only review completed bookings'
      });
      return;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        customerId_bookingId: {
          customerId: req.user.id,
          bookingId
        }
      }
    });

    if (existingReview) {
      res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
      return;
    }

    const review = await prisma.review.create({
      data: {
        customerId: req.user.id,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        bookingId,
        rating,
        title,
        comment,
        images: images || []
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update service average rating
    const serviceReviews = await prisma.review.findMany({
      where: { serviceId: booking.serviceId },
      select: { rating: true }
    });

    const averageRating = serviceReviews.reduce((sum, review) => sum + review.rating, 0) / serviceReviews.length;

    await prisma.service.update({
      where: { id: booking.serviceId },
      data: {
        averageRating,
        totalReviews: serviceReviews.length
      }
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getServiceReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await prisma.review.findMany({
      where: {
        serviceId,
        isApproved: true
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        provider: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({
      where: {
        serviceId,
        isApproved: true
      }
    });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get service reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getProviderReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const reviews = await prisma.review.findMany({
      where: {
        providerId,
        isApproved: true
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        service: {
          select: {
            title: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.review.count({
      where: {
        providerId,
        isApproved: true
      }
    });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get provider reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { service: true }
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    if (review.customerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating,
        title,
        comment,
        images: images || []
      },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Update service average rating
    const serviceReviews = await prisma.review.findMany({
      where: { serviceId: review.serviceId },
      select: { rating: true }
    });

    const averageRating = serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length;

    await prisma.service.update({
      where: { id: review.serviceId },
      data: {
        averageRating,
        totalReviews: serviceReviews.length
      }
    });

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: { service: true }
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    if (review.customerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
      return;
    }

    await prisma.review.delete({
      where: { id }
    });

    // Update service average rating
    const serviceReviews = await prisma.review.findMany({
      where: { serviceId: review.serviceId },
      select: { rating: true }
    });

    const averageRating = serviceReviews.length > 0 
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length 
      : 0;

    await prisma.service.update({
      where: { id: review.serviceId },
      data: {
        averageRating,
        totalReviews: serviceReviews.length
      }
    });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const respondToReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { response } = req.body;

    if (!req.user || req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        message: 'Only providers can respond to reviews'
      });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: 'Review not found'
      });
      return;
    }

    if (review.providerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only respond to reviews for your services'
      });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        providerResponse: response,
        responseDate: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};