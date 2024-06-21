const express = require('express');
const { check, validationResult } = require('express-validator');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', 
  authMiddleware,
  [
  check('content', 'Content is required').not().isEmpty()
], postController.createPost);

router.get('/', authMiddleware, postController.getPosts);
router.get('/:id', authMiddleware, postController.getPostById);

router.delete('/:id', authMiddleware, postController.deletePost);

router.put('/:id', [
    authMiddleware,
    check('content', 'Content is required').not().isEmpty()
  ], postController.updatePost);

module.exports = router;
