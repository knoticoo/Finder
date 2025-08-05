"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReferral = exports.validateSubscription = exports.validateMessage = exports.validateReview = exports.validateBooking = exports.validateService = exports.validatePasswordResetConfirm = exports.validatePasswordReset = exports.validateLogin = exports.validateRegister = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg,
                value: error.value
            }))
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('role')
        .optional()
        .isIn(['CUSTOMER', 'PROVIDER'])
        .withMessage('Role must be either CUSTOMER or PROVIDER'),
    (0, express_validator_1.body)('language')
        .optional()
        .isIn(['LATVIAN', 'RUSSIAN', 'ENGLISH'])
        .withMessage('Language must be LATVIAN, RUSSIAN, or ENGLISH'),
    exports.handleValidationErrors
];
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    exports.handleValidationErrors
];
exports.validatePasswordReset = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    exports.handleValidationErrors
];
exports.validatePasswordResetConfirm = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Token is required'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    exports.handleValidationErrors
];
exports.validateService = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('priceType')
        .isIn(['FIXED', 'HOURLY', 'DAILY', 'NEGOTIABLE'])
        .withMessage('Price type must be FIXED, HOURLY, DAILY, or NEGOTIABLE'),
    (0, express_validator_1.body)('categoryId')
        .notEmpty()
        .withMessage('Category is required'),
    (0, express_validator_1.body)('serviceArea')
        .isArray({ min: 1 })
        .withMessage('At least one service area must be specified'),
    exports.handleValidationErrors
];
exports.validateBooking = [
    (0, express_validator_1.body)('serviceId')
        .notEmpty()
        .withMessage('Service ID is required'),
    (0, express_validator_1.body)('scheduledDate')
        .isISO8601()
        .withMessage('Scheduled date must be a valid date'),
    (0, express_validator_1.body)('address')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Address must be between 5 and 200 characters'),
    (0, express_validator_1.body)('city')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('City must be between 2 and 50 characters'),
    (0, express_validator_1.body)('totalAmount')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be a positive number'),
    exports.handleValidationErrors
];
exports.validateReview = [
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment')
        .optional()
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Comment must be between 10 and 500 characters'),
    (0, express_validator_1.body)('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    exports.handleValidationErrors
];
exports.validateMessage = [
    (0, express_validator_1.body)('receiverId')
        .notEmpty()
        .withMessage('Receiver ID is required'),
    (0, express_validator_1.body)('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message content must be between 1 and 1000 characters'),
    (0, express_validator_1.body)('messageType')
        .optional()
        .isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])
        .withMessage('Message type must be TEXT, IMAGE, FILE, or SYSTEM'),
    exports.handleValidationErrors
];
exports.validateSubscription = [
    (0, express_validator_1.body)('planType')
        .optional()
        .isIn(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])
        .withMessage('Plan type must be FREE, BASIC, PREMIUM, or ENTERPRISE'),
    (0, express_validator_1.body)('status')
        .optional()
        .isIn(['ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIAL'])
        .withMessage('Status must be ACTIVE, INACTIVE, CANCELLED, PAST_DUE, or TRIAL'),
    (0, express_validator_1.body)('stripeCustomerId')
        .optional()
        .isString()
        .withMessage('Invalid Stripe customer ID'),
    (0, express_validator_1.body)('stripeSubscriptionId')
        .optional()
        .isString()
        .withMessage('Invalid Stripe subscription ID'),
    exports.handleValidationErrors
];
exports.validateReferral = [
    (0, express_validator_1.body)('referralCode')
        .notEmpty()
        .withMessage('Referral code is required'),
    (0, express_validator_1.body)('referralCode')
        .isLength({ min: 8, max: 8 })
        .withMessage('Referral code must be exactly 8 characters'),
    exports.handleValidationErrors
];
//# sourceMappingURL=validation.js.map