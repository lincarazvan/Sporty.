const express = require('express');
const { check, validationResult } = require('express-validator');
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware,
  check('followingId', 'Following ID is required').isInt()
], followController.followUser);

router.get('/followers/:userId', authMiddleware, followController.getFollowers);
router.get('/following/:userId', authMiddleware, followController.getFollowing);

module.exports = router;
