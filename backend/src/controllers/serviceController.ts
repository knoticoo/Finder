import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { prisma } from '@/config/database';

export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, category, search, minPrice, maxPrice, rating } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {
      isAvailable: true,
      isActive: true
    };

    if (category) {
      where.categoryId = category as string;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    if (rating) {
      where.averageRating = { gte: Number(rating) };
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            providerProfile: {
              select: {
                businessName: true,
                isVerified: true,
                city: true
              }
            }
          }
        },
        category: true,
        subcategory: true,
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.service.count({ where });

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            providerProfile: {
              select: {
                businessName: true,
                description: true,
                isVerified: true,
                city: true,
                hasInsurance: true,
                certifications: true
              }
            }
          }
        },
        category: true,
        subcategory: true,
        reviews: {
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: {
            reviews: true,
            bookings: true
          }
        }
      }
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        message: 'Only providers can create services'
      });
      return;
    }

    const {
      title,
      titleLv,
      titleRu,
      titleEn,
      description,
      descriptionLv,
      descriptionRu,
      descriptionEn,
      price,
      priceType,
      currency,
      categoryId,
      subcategoryId,
      serviceArea,
      travelFee,
      images,
      videos
    } = req.body;

    const service = await prisma.service.create({
      data: {
        providerId: req.user.id,
        title,
        titleLv,
        titleRu,
        titleEn,
        description,
        descriptionLv,
        descriptionRu,
        descriptionEn,
        price,
        priceType,
        currency,
        categoryId,
        subcategoryId,
        serviceArea,
        travelFee,
        images: images || [],
        videos: videos || []
      },
      include: {
        category: true,
        subcategory: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id },
      select: { providerId: true }
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    if (service.providerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own services'
      });
      return;
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
        subcategory: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteService = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const service = await prisma.service.findUnique({
      where: { id },
      select: { providerId: true }
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found'
      });
      return;
    }

    if (service.providerId !== req.user.id) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own services'
      });
      return;
    }

    await prisma.service.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getServiceCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      where: { isActive: true },
      include: {
        subcategories: {
          where: { isActive: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get service categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};