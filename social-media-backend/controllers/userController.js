const bcrypt = require('bcryptjs');
const upload = require('../config/multerConfig');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post'); // Adaugă importurile necesare
const Comment = require('../models/comment'); // Adaugă importurile necesare
const Follow = require('../models/follow'); // Adaugă importurile necesare
const Notification = require('../models/notification'); // Adaugă importurile necesare
const PrivacySetting = require('../models/privacySetting'); // Adaugă importurile necesare

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username'], // Selectează doar câmpurile necesare
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

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log('User saved:', savedUser);
    return res.status(201).json({ user: savedUser.id });
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
    console.log('Login attempt:', email); // Debugging

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log('User not found:', email); // Debugging
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match for user:', email); // Debugging
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Login successful for user:', user.username); // Debugging
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
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
    // Șterge toate postările utilizatorului
    await Post.destroy({ where: { userId } });

    // Șterge toate comentariile utilizatorului
    await Comment.destroy({ where: { userId } });

    // Șterge toate urmăririle asociate utilizatorului
    await Follow.destroy({ where: { followerId: userId } });
    await Follow.destroy({ where: { followingId: userId } });

    // Șterge toate notificările utilizatorului
    await Notification.destroy({ where: { userId } });

    // Șterge setările de confidențialitate ale utilizatorului
    await PrivacySetting.destroy({ where: { userId } });

    // Șterge utilizatorul
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
