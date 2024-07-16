const { validationResult } = require('express-validator');
const { Post, User, Comment, Report , Sequelize, Notification } = require('../models');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');

const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  return mentions;
};

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
    const mentions = extractMentions(content);
    const mentionedUsers = await User.findAll({
      where: { username: mentions }
    });

    const post = await Post.create({ content, userId, imagePath });

    for (const user of mentionedUsers) {
      if (user.id !== userId) {
        await Notification.create({
          userId: user.id,
          type: 'mention',
          message: `${req.user.username} te-a menționat într-o postare.`,
          relatedId: post.id,
          senderId: userId,
          senderUsername: req.user.username,
          mentionedInType: 'post',
          mentionedInId: post.id
        });
        
        global.io.to(user.id.toString()).emit('notification', {
          type: 'mention',
          message: `${req.user.username} te-a menționat într-o postare.`,
          postId: post.id
        });
      }
    }

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
    const post = await Post.findByPk(req.params.id, {
      include: [{ 
        model: User, 
        attributes: ['id', 'username', 'avatarUrl'] 
      }],
    });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error' });
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

  try {
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.userId !== userId && !isAdmin) return res.status(403).json({ message: 'Unauthorized' });

    await Comment.destroy({ where: { postId } });

    await Report.destroy({ where: { postId } });

    await post.destroy();
    res.json({ message: 'Post and associated reports deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server Error' });
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