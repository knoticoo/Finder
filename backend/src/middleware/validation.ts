import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: (error as any).param,
        message: error.msg,
        value: (error as any).value
      }))
    });
    return;
  }
  
  next();
};

// Authentication validation rules
export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['CUSTOMER', 'PROVIDER'])
    .withMessage('Role must be either CUSTOMER or PROVIDER'),
  body('language')
    .optional()
    .isIn(['LATVIAN', 'RUSSIAN', 'ENGLISH'])
    .withMessage('Language must be LATVIAN, RUSSIAN, or ENGLISH'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validatePasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

export const validatePasswordResetConfirm = [
  body('token')
    .notEmpty()
    .withMessage('Token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Service validation rules
export const validateService = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('priceType')
    .isIn(['FIXED', 'HOURLY', 'DAILY', 'NEGOTIABLE'])
    .withMessage('Price type must be FIXED, HOURLY, DAILY, or NEGOTIABLE'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required'),
  body('serviceArea')
    .isArray({ min: 1 })
    .withMessage('At least one service area must be specified'),
  handleValidationErrors
];

// Booking validation rules
export const validateBooking = [
  body('serviceId')
    .notEmpty()
    .withMessage('Service ID is required'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Scheduled date must be a valid date'),
  body('address')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  handleValidationErrors
];

// Message validation rules
export const validateMessage = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message content must be between 1 and 1000 characters'),
  body('messageType')
    .optional()
    .isIn(['TEXT', 'IMAGE', 'FILE', 'SYSTEM'])
    .withMessage('Message type must be TEXT, IMAGE, FILE, or SYSTEM'),
  handleValidationErrors
];

// Subscription validation rules
export const validateSubscription = [
  body('planType')
    .optional()
    .isIn(['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'])
    .withMessage('Plan type must be FREE, BASIC, PREMIUM, or ENTERPRISE'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'CANCELLED', 'PAST_DUE', 'TRIAL'])
    .withMessage('Status must be ACTIVE, INACTIVE, CANCELLED, PAST_DUE, or TRIAL'),
  body('stripeCustomerId')
    .optional()
    .isString()
    .withMessage('Invalid Stripe customer ID'),
  body('stripeSubscriptionId')
    .optional()
    .isString()
    .withMessage('Invalid Stripe subscription ID'),
  handleValidationErrors
];

// Referral validation rules
export const validateReferral = [
  body('referralCode')
    .notEmpty()
    .withMessage('Referral code is required'),
  body('referralCode')
    .isLength({ min: 8, max: 8 })
    .withMessage('Referral code must be exactly 8 characters'),
  handleValidationErrors
];