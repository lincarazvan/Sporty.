const Like = require('../models/like');
const Post = require('../models/post');

exports.toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existingLike = await Like.findOne({ where: { userId, postId } });

    if (existingLike) {
      await existingLike.destroy();
      res.json({ liked: false });
    } else {
      await Like.create({ userId, postId });
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLikes = async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user ? req.user.id : null;
  
      const likes = await Like.count({ where: { postId } });
      
      let userLiked = false;
      if (userId) {
        userLiked = await Like.findOne({ where: { postId, userId } }) !== null;
      }
  
      res.json({ likes, userLiked });
    } catch (error) {
      console.error('Error getting likes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };