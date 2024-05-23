const express = require('express');
const { check, validationResult } = require('express-validator');
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware,
  check('content', 'Content is required').not().isEmpty(),
  check('postId', 'Post ID is required').isInt()
], commentController.createComment);

router.get('/post/:postId', authMiddleware, commentController.getCommentsForPost);

router.delete('/:id', authMiddleware, commentController.deleteComment);

router.put('/:id', [
    authMiddleware,
    check('content', 'Content is required').not().isEmpty()
  ], commentController.updateComment);

module.exports = router;
