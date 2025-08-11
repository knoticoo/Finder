"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notifications_1 = require("../controllers/notifications");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.get('/', notifications_1.getUserNotifications);
router.get('/unread-count', notifications_1.getUnreadCount);
router.patch('/:id/read', notifications_1.markAsRead);
router.patch('/mark-all-read', notifications_1.markAllAsRead);
router.delete('/:id', notifications_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notifications.js.map