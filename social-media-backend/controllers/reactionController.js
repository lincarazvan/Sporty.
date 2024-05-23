const { validationResult } = require('express-validator');
const Reaction = require('../models/reaction');

exports.createReaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { type, postId } = req.body;
  const userId = req.user.id;
  try {
    const reaction = await Reaction.create({ type, postId, userId });
    res.status(201).send(reaction);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getReactionsForPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const reactions = await Reaction.findAll({ where: { postId } });
    res.send(reactions);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
