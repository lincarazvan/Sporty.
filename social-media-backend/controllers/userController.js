const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;

  const emailExists = await User.findOne({ where: { email } });
  if (emailExists) return res.status(400).send('Email already exists');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  try {
    const savedUser = await user.save();
    res.send({ user: savedUser.id });
  } catch (err) {
    res.status(400).send(err);
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
  console.log('Generated Token:', token); // Debugging
  res.header('Authorization', `Bearer ${token}`).send({ token });
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
