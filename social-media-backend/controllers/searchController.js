const { Op } = require('sequelize');
const Post = require('../models/post');
const User = require('../models/user');

exports.search = async (req, res) => {
  const { query } = req.query;
  try {
    const posts = await Post.findAll({
      where: {
        content: {
          [Op.like]: `%${query}%`
        }
      }
    });

    const users = await User.findAll({
      where: {
        username: {
          [Op.like]: `%${query}%`
        }
      }
    });

    res.send({ posts, users });
  } catch (error) {
    res.status(500).send('Server error');
  }
};
