const express = require('express');
const { check } = require('express-validator');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware.required,
  check('content', 'Content is required').not().isEmpty()
], postController.createPost);

router.get('/search-posts', authMiddleware.required, postController.searchPosts); 
router.get('/', authMiddleware.required, postController.getPosts);
router.get('/:id', authMiddleware.required, postController.getPostById);

router.delete('/:id', authMiddleware.required, postController.deletePost);
router.delete('/:id/image', authMiddleware.required, postController.deletePostImage);

router.put('/:id', [
  authMiddleware.required,
  check('content', 'Content is required').not().isEmpty()
], postController.updatePost);

router.get('/user/:userId', authMiddleware.required, postController.getUserPosts);

module.exports = router;