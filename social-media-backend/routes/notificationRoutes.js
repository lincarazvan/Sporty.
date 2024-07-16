const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.required, notificationController.getNotifications);
router.put('/mark-read', authMiddleware.required, notificationController.markAsRead);
router.get('/unread-count', authMiddleware.required, notificationController.getUnreadCount);
router.delete('/', authMiddleware.required, notificationController.deleteAllNotifications);

module.exports = router;