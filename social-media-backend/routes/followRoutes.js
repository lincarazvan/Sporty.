const express = require('express');
const { check } = require('express-validator');
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware,
  check('followingId', 'Following ID is required').isInt()
], followController.followUser);

router.put('/accept/:followId', authMiddleware, followController.acceptFollowRequest);

router.get('/followers/:userId', authMiddleware, followController.getFollowers);
router.get('/following/:userId', authMiddleware, followController.getFollowing);

router.get('/friends', authMiddleware, followController.getFriends);

module.exports = router;
