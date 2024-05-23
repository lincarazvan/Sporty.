const { validationResult } = require('express-validator');
const Follow = require('../models/follow');

exports.followUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const followerId = req.user.id;
  const { followingId } = req.body;
  try {
    const follow = await Follow.create({ followerId, followingId });
    res.status(201).send(follow);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getFollowers = async (req, res) => {
  const userId = req.params.userId;
  try {
    const followers = await Follow.findAll({ where: { followingId: userId } });
    res.send(followers);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getFollowing = async (req, res) => {
  const userId = req.params.userId;
  try {
    const following = await Follow.findAll({ where: { followerId: userId } });
    res.send(following);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
