const { validationResult } = require('express-validator');
const Post = require('../models/post');
const Comment = require('../models/comment');

exports.createPost = async (req, res) => {
  console.log('Creating post'); // Debugging

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debugging
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content } = req.body;
  const userId = req.user.id;
  try {
    console.log('Data:', { title, content, userId }); // Debugging
    const post = await Post.create({ title, content, userId });
    console.log('Post created:', post); // Debugging
    res.status(201).send(post);
  } catch (error) {
    console.error('Error creating post:', error); // Debugging
    res.status(500).send('Server Error');
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.send(posts);
  } catch (error) {
    res.status(400).send(error);
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
    const { title, content } = req.body;
  
    try {
      const post = await Post.findByPk(postId);
      if (!post) return res.status(404).send('Post not found');
  
      // Verifică dacă utilizatorul este proprietarul postării
      if (post.userId !== userId) return res.status(403).send('Unauthorized');
  
      post.title = title;
      post.content = content;
      await post.save();
      res.send('Post updated');
    } catch (error) {
      res.status(500).send('Server Error');
    }
  };