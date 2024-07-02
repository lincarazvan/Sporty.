const { Comment, User, Post, Notification } = require('../models');

exports.createComment = async (req, res) => {
  try {
    const { content, postId, parentCommentId } = req.body;
    const userId = req.user.id;

    const comment = await Comment.create({
      content,
      userId,
      postId,
      parentCommentId
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }]
    });

    const post = await Post.findByPk(postId, { include: [{ model: User }] });
    if (post.userId !== userId) {
      const notification = await Notification.create({
        userId: post.userId,
        type: 'comment',
        message: `${req.user.username} a comentat la postarea ta.`,
        relatedId: postId
      });
      
      global.io.to(post.userId.toString()).emit('notification', notification);
    }

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.findAll({
      where: { postId, parentCommentId: null },
      include: [
        { model: User, attributes: ['id', 'username', 'avatarUrl'] },
        { 
          model: Comment, 
          as: 'Replies', 
          include: [{ model: User, attributes: ['id', 'username', 'avatarUrl'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    comment.likes += 1;
    await comment.save();
    res.status(200).json({ likes: comment.likes });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await comment.destroy();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    comment.content = content;
    await comment.save();

    res.status(200).json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};