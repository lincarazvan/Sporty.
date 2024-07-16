const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const { Op } = require('sequelize');
const User = require('../models/user');
const transporter = require('../config/emailService');

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:3001/reset-password/${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset</p>
        <p>Please go to this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      where: {
        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).send('User not found');

    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) return res.status(400).send('Invalid current password');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.send('Password updated');
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
