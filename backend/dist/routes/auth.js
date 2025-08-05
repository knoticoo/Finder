"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/register', validation_1.validateRegister, authController_1.register);
router.post('/login', validation_1.validateLogin, authController_1.login);
router.post('/forgot-password', validation_1.validatePasswordReset, authController_1.requestPasswordReset);
router.post('/reset-password', validation_1.validatePasswordResetConfirm, authController_1.confirmPasswordReset);
router.post('/verify-email', authController_1.verifyEmail);
router.post('/refresh-token', auth_1.authenticate, authController_1.refreshToken);
exports.default = router;
//# sourceMappingURL=auth.js.map