const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware.required, messageController.sendMessage);
router.get('/:userId', authMiddleware.required, messageController.getMessagesForUser);
router.get('/conversation/:userId/:otherUserId', authMiddleware.required, messageController.getConversation);

module.exports = router;
