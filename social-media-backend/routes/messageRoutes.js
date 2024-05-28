const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/:userId', authMiddleware, messageController.getMessagesForUser);
router.get('/conversation/:userId/:otherUserId', authMiddleware, messageController.getConversation);

module.exports = router;
