"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReferralStatus = exports.completeVerificationStep = exports.applyReferralCode = exports.generateReferralCode = void 0;
const database_1 = require("../config/database");
const referral_1 = require("../utils/referral");
const generateReferralCode = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        const existingReferral = await database_1.prisma.referral.findFirst({
            where: {
                referrerId: req.user.id,
                status: 'PENDING'
            }
        });
        if (existingReferral) {
            res.json({
                success: true,
                data: {
                    referralCode: existingReferral.referralCode,
                    status: existingReferral.status
                }
            });
            return;
        }
        const referralCode = (0, referral_1.generateReferralCode)();
        const referral = await database_1.prisma.referral.create({
            data: {
                referrerId: req.user.id,
                referredId: req.user.id,
                referralCode,
                status: 'PENDING',
                rewardType: req.user.role === 'PROVIDER' ? 'VISIBILITY_BOOST' : 'PREMIUM_MONTH'
            }
        });
        res.json({
            success: true,
            data: {
                referralCode: referral.referralCode,
                status: referral.status
            }
        });
    }
    catch (error) {
        console.error('Generate referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.generateReferralCode = generateReferralCode;
const applyReferralCode = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        const { referralCode } = req.body;
        if (!referralCode) {
            res.status(400).json({
                success: false,
                message: 'Referral code is required'
            });
            return;
        }
        const referral = await database_1.prisma.referral.findUnique({
            where: { referralCode },
            include: {
                referrer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            }
        });
        if (!referral) {
            res.status(404).json({
                success: false,
                message: 'Invalid referral code'
            });
            return;
        }
        if (referral.status !== 'PENDING') {
            res.status(400).json({
                success: false,
                message: 'Referral code has already been used or expired'
            });
            return;
        }
        if (referral.referrerId === req.user.id) {
            res.status(400).json({
                success: false,
                message: 'Cannot refer yourself'
            });
            return;
        }
        const existingReferral = await database_1.prisma.referral.findFirst({
            where: {
                referredId: req.user.id,
                status: 'COMPLETED'
            }
        });
        if (existingReferral) {
            res.status(400).json({
                success: false,
                message: 'You have already used a referral code'
            });
            return;
        }
        await database_1.prisma.referral.update({
            where: { id: referral.id },
            data: {
                referredId: req.user.id,
                status: 'PENDING'
            }
        });
        res.json({
            success: true,
            message: 'Referral code applied successfully. Complete verification steps to claim your reward.',
            data: {
                referralId: referral.id,
                verificationSteps: getVerificationSteps(req.user.role)
            }
        });
    }
    catch (error) {
        console.error('Apply referral code error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.applyReferralCode = applyReferralCode;
const completeVerificationStep = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        const { referralId, stepType, stepData } = req.body;
        const referral = await database_1.prisma.referral.findFirst({
            where: {
                id: referralId,
                referredId: req.user.id,
                status: 'PENDING'
            }
        });
        if (!referral) {
            res.status(404).json({
                success: false,
                message: 'Referral not found or already completed'
            });
            return;
        }
        const stepVerified = await verifyStep(stepType, stepData, req.user.id);
        if (!stepVerified) {
            res.status(400).json({
                success: false,
                message: 'Verification step failed'
            });
            return;
        }
        const updatedReferral = await database_1.prisma.referral.update({
            where: { id: referralId },
            data: {}
        });
        const allStepsCompleted = await checkAllStepsCompleted(referralId, req.user.role);
        if (allStepsCompleted) {
            await completeReferral(referralId);
        }
        res.json({
            success: true,
            message: 'Verification step completed',
            data: {
                referral: updatedReferral,
                allStepsCompleted,
                remainingSteps: getRemainingSteps(referralId, req.user.role)
            }
        });
    }
    catch (error) {
        console.error('Complete verification step error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.completeVerificationStep = completeVerificationStep;
const getReferralStatus = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        const referrals = await database_1.prisma.referral.findMany({
            where: {
                OR: [
                    { referrerId: req.user.id },
                    { referredId: req.user.id }
                ]
            },
            include: {
                referrer: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                },
                referred: {
                    select: {
                        firstName: true,
                        lastName: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({
            success: true,
            data: {
                referrals,
                stats: {
                    totalReferrals: referrals.length,
                    completedReferrals: referrals.filter(r => r.status === 'COMPLETED').length,
                    pendingReferrals: referrals.filter(r => r.status === 'PENDING').length
                }
            }
        });
    }
    catch (error) {
        console.error('Get referral status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getReferralStatus = getReferralStatus;
const getVerificationSteps = (userRole) => {
    const baseSteps = [
        {
            type: 'EMAIL_VERIFICATION',
            title: 'Verify Email Address',
            description: 'Confirm your email address is valid',
            required: true
        },
        {
            type: 'PHONE_VERIFICATION',
            title: 'Verify Phone Number',
            description: 'Add and verify your phone number',
            required: true
        },
        {
            type: 'PROFILE_COMPLETION',
            title: 'Complete Profile',
            description: 'Fill out your complete profile information',
            required: true
        }
    ];
    if (userRole === 'PROVIDER') {
        return [
            ...baseSteps,
            {
                type: 'SERVICE_CREATION',
                title: 'Create First Service',
                description: 'Create at least one service listing',
                required: true
            },
            {
                type: 'PROFILE_VERIFICATION',
                title: 'Profile Verification',
                description: 'Submit documents for profile verification',
                required: true
            },
            {
                type: 'FIRST_BOOKING',
                title: 'Complete First Booking',
                description: 'Successfully complete your first booking',
                required: true
            }
        ];
    }
    return [
        ...baseSteps,
        {
            type: 'FIRST_BOOKING',
            title: 'Make First Booking',
            description: 'Book your first service',
            required: true
        },
        {
            type: 'REVIEW_SUBMISSION',
            title: 'Submit Review',
            description: 'Leave a review after your first booking',
            required: true
        }
    ];
};
const verifyStep = async (stepType, stepData, userId) => {
    switch (stepType) {
        case 'EMAIL_VERIFICATION':
            return await verifyEmail(userId);
        case 'PHONE_VERIFICATION':
            return await verifyPhone(userId, stepData.phone);
        case 'PROFILE_COMPLETION':
            return await verifyProfileCompletion(userId);
        case 'SERVICE_CREATION':
            return await verifyServiceCreation(userId);
        case 'PROFILE_VERIFICATION':
            return await verifyProfileVerification(userId);
        case 'FIRST_BOOKING':
            return await verifyFirstBooking(userId);
        case 'REVIEW_SUBMISSION':
            return await verifyReviewSubmission(userId);
        default:
            return false;
    }
};
const verifyEmail = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { isVerified: true }
    });
    return user?.isVerified || false;
};
const verifyPhone = async (userId, phone) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true }
    });
    return user?.phone === phone && phone.length > 0;
};
const verifyProfileCompletion = async (userId) => {
    const user = await database_1.prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, phone: true }
    });
    return !!(user?.firstName && user?.lastName && user?.phone);
};
const verifyServiceCreation = async (userId) => {
    const serviceCount = await database_1.prisma.service.count({
        where: { providerId: userId }
    });
    return serviceCount > 0;
};
const verifyProfileVerification = async (userId) => {
    const profile = await database_1.prisma.providerProfile.findUnique({
        where: { userId },
        select: { isVerified: true }
    });
    return profile?.isVerified || false;
};
const verifyFirstBooking = async (userId) => {
    const bookingCount = await database_1.prisma.booking.count({
        where: {
            OR: [
                { customerId: userId, status: 'COMPLETED' },
                { providerId: userId, status: 'COMPLETED' }
            ]
        }
    });
    return bookingCount > 0;
};
const verifyReviewSubmission = async (userId) => {
    const reviewCount = await database_1.prisma.review.count({
        where: { customerId: userId }
    });
    return reviewCount > 0;
};
const checkAllStepsCompleted = async (referralId, userRole) => {
    const referral = await database_1.prisma.referral.findUnique({
        where: { id: referralId }
    });
    if (!referral)
        return false;
    const requiredSteps = getVerificationSteps(userRole);
    const completedSteps = [];
    return requiredSteps.every(step => step.required ? completedSteps.includes(step.type) : true);
};
const getRemainingSteps = (referralId, userRole) => {
    const requiredSteps = getVerificationSteps(userRole);
    return requiredSteps.filter(step => step.required);
};
const completeReferral = async (referralId) => {
    const referral = await database_1.prisma.referral.findUnique({
        where: { id: referralId },
        include: {
            referrer: true,
            referred: true
        }
    });
    if (!referral)
        return;
    await database_1.prisma.referral.update({
        where: { id: referralId },
        data: {
            status: 'COMPLETED',
            completedAt: new Date()
        }
    });
    if (referral.rewardType === 'PREMIUM_MONTH') {
        await database_1.prisma.subscription.upsert({
            where: { userId: referral.referredId },
            update: {
                planType: 'PREMIUM',
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            create: {
                userId: referral.referredId,
                planType: 'PREMIUM',
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
    }
    else if (referral.rewardType === 'VISIBILITY_BOOST') {
        await database_1.prisma.service.updateMany({
            where: { providerId: referral.referrerId },
            data: { isFeatured: true }
        });
    }
    if (referral.referrer.role === 'PROVIDER') {
        await database_1.prisma.service.updateMany({
            where: { providerId: referral.referrerId },
            data: { isFeatured: true }
        });
    }
    else {
        await database_1.prisma.subscription.upsert({
            where: { userId: referral.referrerId },
            update: {
                planType: 'PREMIUM',
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            },
            create: {
                userId: referral.referrerId,
                planType: 'PREMIUM',
                status: 'ACTIVE',
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });
    }
};
//# sourceMappingURL=referralController.js.map