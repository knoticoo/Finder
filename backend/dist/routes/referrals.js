"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const referralController_1 = require("../controllers/referralController");
const router = (0, express_1.Router)();
router.post('/generate', auth_1.authenticate, referralController_1.generateReferralCode);
router.post('/apply', auth_1.authenticate, validation_1.validateReferral, referralController_1.applyReferralCode);
router.post('/verify-step', auth_1.authenticate, referralController_1.completeVerificationStep);
router.get('/status', auth_1.authenticate, referralController_1.getReferralStatus);
exports.default = router;
//# sourceMappingURL=referrals.js.map