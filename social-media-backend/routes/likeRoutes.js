const express = require('express');
const likeController = require('../controllers/likeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:postId', authMiddleware.optional, likeController.getLikes);
router.post('/:postId', authMiddleware.required, likeController.toggleLike);

module.exports = router;