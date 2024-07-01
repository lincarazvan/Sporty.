const express = require('express');
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/conversations', authMiddleware.required, messageController.getConversations);
router.get('/:otherUserId', authMiddleware.required, messageController.getMessages);
router.post('/', authMiddleware.required, messageController.sendMessage);
router.put('/:messageId/status', authMiddleware.required, messageController.updateMessageStatus);
router.delete('/:messageId', authMiddleware.required, messageController.deleteMessage);

module.exports = router;