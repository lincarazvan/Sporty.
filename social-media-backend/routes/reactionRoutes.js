const express = require('express');
const { check, validationResult } = require('express-validator');
const reactionController = require('../controllers/reactionController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware,
  check('type', 'Reaction type is required').not().isEmpty(),
  check('postId', 'Post ID is required').isInt()
], reactionController.createReaction);

router.get('/post/:postId', authMiddleware, reactionController.getReactionsForPost);

module.exports = router;
