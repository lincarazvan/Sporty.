const express = require('express');
const { check, validationResult } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, notificationController.getNotifications);
router.post('/mark-read', authMiddleware, notificationController.markNotificationsRead);

module.exports = router;
