const { validationResult } = require('express-validator');
const Comment = require('../models/comment');
const Notification = require('../models/notification');
const Post = require('../models/post'); 

exports.createComment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { content, postId } = req.body;
  const userId = req.user.id;
  try {
    const comment = await Comment.create({ content, postId, userId });

    // Obține proprietarul postării pentru a trimite notificarea
    const post = await Post.findByPk(postId);
    if (post && post.userId !== userId) {
      await Notification.create({
        type: 'comment',
        message: `New comment on your post: ${content}`,
        userId: post.userId
      });
    }

    res.status(201).send(comment);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getCommentsForPost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const comments = await Comment.findAll({ where: { postId } });
    res.send(comments);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const userId = req.user.id;
    try {
      const comment = await Comment.findByPk(commentId);
      if (!comment) return res.status(404).send('Comment not found');
      
      // Verifică dacă utilizatorul este proprietarul comentariului
      if (comment.userId !== userId) return res.status(403).send('Unauthorized');
  
      await comment.destroy();
      res.send('Comment deleted');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };

  exports.updateComment = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const commentId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;
  
    try {
      const comment = await Comment.findByPk(commentId);
      if (!comment) return res.status(404).send('Comment not found');
  
      // Verifică dacă utilizatorul este proprietarul comentariului
      if (comment.userId !== userId) return res.status(403).send('Unauthorized');
  
      comment.content = content;
      await comment.save();
      res.send('Comment updated');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
