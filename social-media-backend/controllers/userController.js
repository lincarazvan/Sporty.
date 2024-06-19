const bcrypt = require('bcryptjs');
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
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).send('Email or password is wrong');

  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) return res.status(400).send('Invalid password');

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.header('Authorization', `Bearer ${token}`).send({ token, user: { id: user.id, username: user.username, email: user.email } });
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'email']
    });
    if (!user) return res.status(404).send('User not found');
    res.send(user);
  } catch (error) {
    res.status(500).send('Server Error');
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

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { username, email } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('User not found');

    user.username = username;
    user.email = email;
    await user.save();
    res.send('Profile updated');
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.register = async (req, res) => {
  console.log('Received registration data:', req.body); // Debugging

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array()); // Debugging
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  try {
    const emailExists = await User.findOne({ where: { email } });
    if (emailExists) {
      console.log('Email already exists:', email); // Debugging
      return res.status(400).json({ error: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Hashed password:', hashedPassword); // Debugging

    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    console.log('User saved:', savedUser); // Debugging
    return res.status(201).json({ user: savedUser.id });
  } catch (err) {
    console.error('Registration error:', err); // Debugging
    return res.status(500).json({ error: 'Registration failed' });
  }
};

