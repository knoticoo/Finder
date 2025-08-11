"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const reviewController_1 = require("@/controllers/reviewController");
const validation_1 = require("@/middleware/validation");
const router = (0, express_1.Router)();
router.get('/service/:serviceId', reviewController_1.getServiceReviews);
router.get('/provider/:providerId', reviewController_1.getProviderReviews);
router.post('/', auth_1.authenticate, validation_1.validateReview, reviewController_1.createReview);
router.put('/:id', auth_1.authenticate, validation_1.validateReview, reviewController_1.updateReview);
router.delete('/:id', auth_1.authenticate, reviewController_1.deleteReview);
router.post('/:id/respond', auth_1.authenticate, (0, auth_1.authorize)('PROVIDER'), reviewController_1.respondToReview);
exports.default = router;
//# sourceMappingURL=reviews.js.map