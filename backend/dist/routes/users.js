"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("@/controllers/userController");
const auth_1 = require("@/middleware/auth");
const express_validator_1 = require("express-validator");
const validation_1 = require("@/middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/profile', userController_1.getProfile);
router.put('/profile', [
    (0, express_validator_1.body)('firstName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('lastName').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('language').optional().isIn(['LATVIAN', 'RUSSIAN', 'ENGLISH']),
    validation_1.handleValidationErrors
], userController_1.updateProfile);
router.put('/provider-profile', [
    (0, express_validator_1.body)('businessName').optional().trim().isLength({ min: 2, max: 100 }),
    (0, express_validator_1.body)('description').optional().trim().isLength({ min: 10, max: 1000 }),
    (0, express_validator_1.body)('address').optional().trim().isLength({ min: 5, max: 200 }),
    (0, express_validator_1.body)('city').optional().trim().isLength({ min: 2, max: 50 }),
    (0, express_validator_1.body)('postalCode').optional().trim().isLength({ min: 4, max: 10 }),
    (0, express_validator_1.body)('website').optional().isURL(),
    (0, express_validator_1.body)('hasInsurance').optional().isBoolean(),
    (0, express_validator_1.body)('insuranceDetails').optional().trim().isLength({ min: 5, max: 500 }),
    (0, express_validator_1.body)('certifications').optional().isArray(),
    (0, express_validator_1.body)('businessHours').optional().isObject(),
    validation_1.handleValidationErrors
], userController_1.updateProviderProfile);
router.get('/stats', userController_1.getUserStats);
router.delete('/account', userController_1.deleteAccount);
exports.default = router;
//# sourceMappingURL=users.js.map