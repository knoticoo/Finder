"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const subscriptionController_1 = require("../controllers/subscriptionController");
const router = (0, express_1.Router)();
router.get('/plans', subscriptionController_1.getSubscriptionPlans);
router.get('/', auth_1.authenticate, subscriptionController_1.getSubscription);
router.post('/', auth_1.authenticate, validation_1.validateSubscription, subscriptionController_1.createSubscription);
router.put('/', auth_1.authenticate, validation_1.validateSubscription, subscriptionController_1.updateSubscription);
router.delete('/', auth_1.authenticate, subscriptionController_1.cancelSubscription);
router.get('/premium-features', auth_1.authenticate, subscriptionController_1.checkPremiumFeatures);
exports.default = router;
//# sourceMappingURL=subscriptions.js.map