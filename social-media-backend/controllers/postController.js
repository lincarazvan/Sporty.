const { validationResult } = require('express-validator');
const { Post, User } = require('../models');
const Comment = require('../models/comment');

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

exports.createPost = [upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    const post = await Post.create({ content, userId, imagePath });
    const postWithUser = await Post.findByPk(post.id, {
      include: [{ model: User, attributes: ['id', 'username'] }]
    });
    res.status(201).json(postWithUser);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}];

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).send('Post not found');
    res.send(post);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.deletePost = async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
      const post = await Post.findByPk(postId);
      if (!post) return res.status(404).send('Post not found');
      
      // Verifică dacă utilizatorul este proprietarul postării
      if (post.userId !== userId) return res.status(403).send('Unauthorized');
  
      // Șterge comentariile asociate
      await Comment.destroy({ where: { postId } });
  
      await post.destroy();
      res.send('Post deleted');
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).send('Server Error');
    }
  };

  exports.updatePost = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const postId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;
  
    try {
      const post = await Post.findByPk(postId);
      if (!post) return res.status(404).send('Post not found');
  
      // Verifică dacă utilizatorul este proprietarul postării
      if (post.userId !== userId) return res.status(403).send('Unauthorized');
  
      post.content = content;
      await post.save();
      res.send('Post updated');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };
