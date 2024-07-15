const { validationResult } = require('express-validator');
const { Post, User, Comment , Sequelize } = require('../models');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

exports.searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const posts = await Post.findAll({
      where: {
        content: {
          [Op.iLike]: `%${query}%`
        }
      },
      include: [{ 
        model: User, 
        attributes: ['id', 'username', 'avatarUrl'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(posts);
  } catch (error) {
    console.error('Error searching posts:', error);
    res.status(500).json({ message: 'Error searching posts', error: error.toString() });
  }
};

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
          as: 'User',
          attributes: ['id', 'username', 'avatarUrl']
        },
        {
          model: Comment,
          as: 'Comments',
          include: [
            {
              model: User,
              as: 'User',
              attributes: ['id', 'username', 'avatarUrl']
            },
            {
              model: Comment,
              as: 'Replies',
              include: [
                {
                  model: User,
                  as: 'User',
                  attributes: ['id', 'username', 'avatarUrl']
                }
              ]
            }
          ],
          where: { parentCommentId: null },
          separate: true
        }
      ],
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(DISTINCT "Comments"."id") + 
              COUNT(DISTINCT "Replies"."id")
              FROM "Comments"
              LEFT OUTER JOIN "Comments" AS "Replies" ON "Comments"."id" = "Replies"."parentCommentId"
              WHERE "Comments"."postId" = "Post"."id"
            )`),
            'commentCount'
          ]
        ]
      },
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

exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { userId: req.params.userId },
      include: [{ model: User, attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deletePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;
  const isAdmin = req.user.roleId === 1; 

  console.log("Delete post request received:");
  console.log("Post ID:", postId);
  console.log("User ID:", userId);
  console.log("Is Admin:", isAdmin);

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      console.log("Post not found");
      return res.status(404).json({ message: 'Post not found' });
    }
    
    console.log("Post found:", post.id);
    console.log("Post owner ID:", post.userId);

    if (post.userId !== userId && !isAdmin) {
      console.log("Unauthorized delete attempt");
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Comment.destroy({ where: { postId } });
    console.log("Comments deleted");

    await post.destroy();
    console.log("Post deleted successfully");
    return res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

  exports.updatePost = [upload.single('image'), async (req, res) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;
      const { content } = req.body;
  
      const post = await Post.findByPk(postId, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });
      if (!post) return res.status(404).json({ error: 'Post not found' });
      if (post.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
  
      post.content = content;
      if (req.file) {
        post.imagePath = `uploads/${req.file.filename}`;
      }
      await post.save();
  
      // Reîncărcați postarea cu informațiile despre utilizator
      const updatedPost = await Post.findByPk(post.id, {
        include: [{ model: User, attributes: ['id', 'username'] }]
      });
  
      res.json(updatedPost);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  }];


exports.deletePostImage = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    if (post.imagePath) {
      const imagePath = path.join(__dirname, '..', post.imagePath);
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting image file:', err);
      });
      post.imagePath = null;
      await post.save();
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting post image:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};