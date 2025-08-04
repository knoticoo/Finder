import { Request, Response } from 'express';
import { AuthRequest } from '@/middleware/auth';
import { prisma } from '@/config/database';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        providerProfile: {
          select: {
            id: true,
            businessName: true,
            description: true,
            address: true,
            city: true,
            postalCode: true,
            website: true,
            socialMedia: true,
            isVerified: true,
            hasInsurance: true,
            insuranceDetails: true,
            certifications: true,
            businessHours: true
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const { firstName, lastName, phone, language, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        language,
        avatar
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        role: true,
        language: true,
        isVerified: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateProviderProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'PROVIDER') {
      res.status(403).json({
        success: false,
        message: 'Only providers can update provider profile'
      });
      return;
    }

    const {
      businessName,
      description,
      address,
      city,
      postalCode,
      website,
      socialMedia,
      hasInsurance,
      insuranceDetails,
      certifications,
      businessHours
    } = req.body;

    const providerProfile = await prisma.providerProfile.upsert({
      where: { userId: req.user.id },
      update: {
        businessName,
        description,
        address,
        city,
        postalCode,
        website,
        socialMedia,
        hasInsurance,
        insuranceDetails,
        certifications,
        businessHours
      },
      create: {
        userId: req.user.id,
        businessName,
        description,
        address,
        city,
        postalCode,
        website,
        socialMedia,
        hasInsurance,
        insuranceDetails,
        certifications,
        businessHours
      },
      select: {
        id: true,
        businessName: true,
        description: true,
        address: true,
        city: true,
        postalCode: true,
        website: true,
        socialMedia: true,
        isVerified: true,
        hasInsurance: true,
        insuranceDetails: true,
        certifications: true,
        businessHours: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'Provider profile updated successfully',
      data: providerProfile
    });
  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id: req.user.id },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const stats = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
            services: true,
            providerBookings: true,
            providerReviews: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: stats?._count || {
        bookings: 0,
        reviews: 0,
        services: 0,
        providerBookings: 0,
        providerReviews: 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};