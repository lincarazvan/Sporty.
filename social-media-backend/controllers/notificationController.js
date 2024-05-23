const { validationResult } = require('express-validator');
const Notification = require('../models/notification');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ where: { userId: req.user.id, read: false } });
    res.send(notifications);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.markNotificationsRead = async (req, res) => {
  try {
    await Notification.update({ read: true }, { where: { userId: req.user.id, read: false } });
    res.send('Notifications marked as read');
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
