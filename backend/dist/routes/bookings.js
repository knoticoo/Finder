"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("@/middleware/auth");
const bookingController_1 = require("@/controllers/bookingController");
const validation_1 = require("@/middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', validation_1.validateBooking, bookingController_1.createBooking);
router.get('/user', bookingController_1.getUserBookings);
router.get('/user/:id', bookingController_1.getBookingById);
router.put('/user/:id/cancel', bookingController_1.cancelBooking);
router.get('/provider', (0, auth_1.authorize)('PROVIDER'), bookingController_1.getProviderBookings);
router.get('/provider/:id', (0, auth_1.authorize)('PROVIDER'), bookingController_1.getBookingById);
router.put('/provider/:id/status', (0, auth_1.authorize)('PROVIDER'), bookingController_1.updateBookingStatus);
exports.default = router;
//# sourceMappingURL=bookings.js.map