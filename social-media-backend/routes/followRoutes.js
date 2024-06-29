const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.required, followController.followUser);
router.delete('/:followingId', authMiddleware.required, followController.unfollowUser);
router.get('/followers/:userId?', authMiddleware.required, followController.getFollowers);
router.get('/following/:userId?', authMiddleware.required, followController.getFollowing);

module.exports = router;