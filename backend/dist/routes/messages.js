"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const messageController_1 = require("../controllers/messageController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.post('/', validation_1.validateMessage, messageController_1.sendMessage);
router.get('/conversations', messageController_1.getUserConversations);
router.get('/conversation', messageController_1.getConversation);
router.put('/read', messageController_1.markAsRead);
router.delete('/:id', messageController_1.deleteMessage);
exports.default = router;
//# sourceMappingURL=messages.js.map