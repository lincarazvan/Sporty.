const express = require('express');
const { check } = require('express-validator');
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', [
  authMiddleware.required,
  check('followingId', 'Following ID is required').isInt()
], followController.followUser);

router.put('/accept/:followId', authMiddleware.required, followController.acceptFollowRequest);

router.get('/followers/:userId', authMiddleware.required, followController.getFollowers);
router.get('/following/:userId', authMiddleware.required, followController.getFollowing);

router.get('/friends', authMiddleware.required, followController.getFriends);

module.exports = router;
