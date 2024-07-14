const bcrypt = require('bcryptjs');
const upload = require('../config/multerConfig');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post'); 
const Comment = require('../models/comment'); 
const Follow = require('../models/follow'); 
const Notification = require('../models/notification'); 
const PrivacySetting = require('../models/privacySetting'); 
const { Op } = require('sequelize');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username'], 
    });
    res.send(users);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    console.log('Fetching profile for username:', req.params.username);
    const user = await User.findOne({ 
      where: { username: req.params.username },
      attributes: ['id', 'username', 'email', 'bio', 'avatarUrl']
    });
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userProfile = user.toJSON();
    
    console.log('User found:', userProfile);
    res.json(userProfile);
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.register = async (req, res) => {
  console.log('Received registration data:', req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    console.log('User saved:', user);
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    return res.status(201).json({ 
      user: { id: user.id, username: user.username, email: user.email },
      token 
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    console.log('Login attempt:', email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email);
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', user.username);
    res.json({ 
      user: { id: user.id, username: user.username, email: user.email, roleId: user.roleId }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email', 'bio', 'avatarUrl']
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.profile = async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });
  if (!user) return res.status(404).send('User not found');
  res.send(user);
};

exports.deleteProfile = async (req, res) => {
  const userId = req.user.id;
  try {
    
    await Post.destroy({ where: { userId } });
    
    await Comment.destroy({ where: { userId } });
    
    await Follow.destroy({ where: { followerId: userId } });
    await Follow.destroy({ where: { followingId: userId } });
    
    await Notification.destroy({ where: { userId } });
    
    await PrivacySetting.destroy({ where: { userId } });
    
    await User.destroy({ where: { id: userId } });

    res.send('Profile deleted');
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = [
  upload.single('avatar'),
  async (req, res) => {
    try {
      console.log('Received update profile request:', req.body);
      const { username, bio, currentPassword, newPassword } = req.body;
      const updateData = { username, bio };

      if (req.file) {
        updateData.avatarUrl = `/uploads/avatars/${req.file.filename}`;
      }

      if (currentPassword && newPassword) {
        const user = await User.findByPk(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
      }

      console.log('Update data:', updateData);

      const [updatedRows, [updatedUser]] = await User.update(updateData, {
        where: { id: req.user.id },
        returning: true,
        individualHooks: true
      });

      if (updatedRows === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const userResponse = updatedUser.toJSON();
      delete userResponse.password;

      console.log('Updated user:', userResponse);
      res.json(userResponse);
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
];

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.findAll({
      where: {
        username: {
          [Op.iLike]: `%${query}%`
        },
        id: {
          [Op.ne]: req.user.id 
        }
      },
      attributes: ['id', 'username', 'avatarUrl'],
      limit: 10
    });
    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
};
