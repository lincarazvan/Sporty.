const express = require('express');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.required, commentController.createComment);
router.get('/:postId', commentController.getComments);
router.delete('/:id', authMiddleware.required, commentController.deleteComment);
router.put('/:id', authMiddleware.required, commentController.updateComment);
router.post('/:id/like', authMiddleware.required, commentController.likeComment);

module.exports = router;