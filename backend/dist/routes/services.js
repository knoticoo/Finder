"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const serviceController_1 = require("../controllers/serviceController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Services routes working' });
});
router.get('/', serviceController_1.getAllServices);
router.get('/categories', serviceController_1.getServiceCategories);
router.get('/:id', serviceController_1.getServiceById);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('PROVIDER'), validation_1.validateService, serviceController_1.createService);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('PROVIDER'), validation_1.validateService, serviceController_1.updateService);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('PROVIDER'), serviceController_1.deleteService);
exports.default = router;
//# sourceMappingURL=services.js.map