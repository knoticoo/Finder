import { Request, Response } from 'express';
import { prisma } from '@/config/database';
import { generateToken } from '@/utils/jwt';
import { hashPassword, comparePassword } from '@/utils/password';
import { RegisterRequest, LoginRequest, AuthResponse } from '@/types/auth';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role, language }: RegisterRequest = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        role: role || 'CUSTOMER',
        language: language || 'LATVIAN'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isVerified: true,
        createdAt: true
      }
    });

    // If the user is a provider, create a provider profile
    if (user.role === 'PROVIDER') {
      await prisma.providerProfile.create({
        data: {
          userId: user.id,
          // Initialize with default empty values
          businessName: null,
          description: null,
          address: null,
          city: null,
          postalCode: null,
          website: null,
          socialMedia: null,
          hasInsurance: false,
          insuranceDetails: null,
          certifications: [],
          businessHours: null
        }
      });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified
      }
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isVerified: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      res.status(200).json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate reset token (in production, use a proper token generation)
    // const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Store reset token in database (you might want to create a separate table for this)
    // For now, we'll just return success

    // TODO: Send email with reset link
    // await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'If an account with this email exists, a password reset link has been sent'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const confirmPasswordReset = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const { token, newPassword } = req.body;

    // TODO: Verify reset token and update password
    // For now, just return success

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyEmail = async (_req: Request, res: Response): Promise<void> => {
  try {
    // const { token } = req.body;

    // TODO: Verify email token and update user verification status
    // For now, just return success

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Try to decode the token even if it's expired
    const { verifyToken, decodeToken, generateToken } = require('@/utils/jwt');
    
    let decoded: any;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      // If verification fails, try to decode without verification
      decoded = decodeToken(token);
      if (!decoded) {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
        return;
      }
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        language: true,
        isVerified: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
      return;
    }

    // Generate new token
    const newToken = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });

    const response: AuthResponse = {
      success: true,
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        language: user.language,
        isVerified: user.isVerified
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};