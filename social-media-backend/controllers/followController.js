const { Follow, User } = require('../models');

exports.followUser = async (req, res) => {
  try {
    const { followingId } = req.body;
    const followerId = req.user.id;

    if (followerId === followingId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const [follow, created] = await Follow.findOrCreate({
      where: { followerId, followingId },
      defaults: { followerId, followingId }
    });

    if (!created) {
      return res.status(400).json({ message: "You're already following this user" });
    }

    res.status(201).json(follow);
  } catch (error) {
    console.error('Error in followUser:', error);
    res.status(500).json({ message: 'Error following user', error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { followingId } = req.params;
    const followerId = req.user.id;

    const follow = await Follow.findOne({
      where: { followerId, followingId }
    });

    if (!follow) {
      return res.status(400).json({ message: "You're not following this user" });
    }

    await follow.destroy();
    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const followers = await Follow.findAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'follower', attributes: ['id', 'username', 'avatarUrl'] }]
    });
    res.status(200).json(followers.map(f => f.follower));
  } catch (error) {
    res.status(500).json({ message: 'Error getting followers', error: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Follow,
          as: 'Following',
          include: [
            {
              model: User,
              as: 'following',
              attributes: ['id', 'username', 'avatarUrl']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const following = user.Following.map(follow => follow.following);
    res.status(200).json(following);
  } catch (error) {
    console.error('Error in getFollowing:', error);
    res.status(500).json({ message: 'Error getting following', error: error.message });
  }
};