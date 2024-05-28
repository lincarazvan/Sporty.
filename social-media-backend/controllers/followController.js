const { validationResult } = require('express-validator');
const Follow = require('../models/follow');

exports.followUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { followingId } = req.body;
  try {
    const follow = await Follow.create({ followerId: req.user.id, followingId });
    res.status(201).send(follow);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.acceptFollowRequest = async (req, res) => {
  const { followId } = req.params;
  try {
    const follow = await Follow.findOne({ where: { id: followId, followingId: req.user.id, status: 'pending' } });
    if (follow) {
      follow.status = 'accepted';
      await follow.save();
      res.send(follow);
    } else {
      res.status(404).send('Follow request not found');
    }
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getFollowers = async (req, res) => {
  const { userId } = req.params;
  try {
    const followers = await Follow.findAll({ where: { followingId: userId, status: 'accepted' } });
    res.send(followers);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getFollowing = async (req, res) => {
  const { userId } = req.params;
  try {
    const following = await Follow.findAll({ where: { followerId: userId, status: 'accepted' } });
    res.send(following);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getFriends = async (req, res) => {
  try {
    const friends = await Follow.findAll({ where: { followerId: req.user.id, status: 'accepted' } });
    res.send(friends);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
