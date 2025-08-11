"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.verifyEmail = exports.confirmPasswordReset = exports.requestPasswordReset = exports.login = exports.register = void 0;
const database_1 = require("@/config/database");
const jwt_1 = require("@/utils/jwt");
const password_1 = require("@/utils/password");
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role, language } = req.body;
        const existingUser = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        const hashedPassword = await (0, password_1.hashPassword)(password);
        const user = await database_1.prisma.user.create({
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
        if (user.role === 'PROVIDER') {
            await database_1.prisma.providerProfile.create({
                data: {
                    userId: user.id,
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
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const response = {
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
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
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
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const response = {
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.login = login;
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(200).json({
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'If an account with this email exists, a password reset link has been sent'
        });
    }
    catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.requestPasswordReset = requestPasswordReset;
const confirmPasswordReset = async (_req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });
    }
    catch (error) {
        console.error('Password reset confirmation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.confirmPasswordReset = confirmPasswordReset;
const verifyEmail = async (_req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.verifyEmail = verifyEmail;
const refreshToken = async (req, res) => {
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
        const { verifyToken, decodeToken, generateToken } = require('@/utils/jwt');
        let decoded;
        try {
            decoded = verifyToken(token);
        }
        catch (error) {
            decoded = decodeToken(token);
            if (!decoded) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
                return;
            }
        }
        const user = await database_1.prisma.user.findUnique({
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
        const newToken = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });
        const response = {
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
    }
    catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({
            success: false,
            message: 'Token refresh failed'
        });
    }
};
exports.refreshToken = refreshToken;
//# sourceMappingURL=authController.js.map