const { Notification, User } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    const formattedNotifications = notifications.map(notification => ({
      ...notification.toJSON(),
      senderId: notification.sender ? notification.sender.id : null,
      senderUsername: notification.sender ? notification.sender.username : null
    }));

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update(
      { read: true },
      { where: { userId: req.user.id, read: false } }
    );

    const updatedNotifications = await Notification.findAll({
      where: { userId: req.user.id },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatarUrl']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedNotifications = updatedNotifications.map(notification => {
      const notificationJSON = notification.toJSON();
      return {
        ...notificationJSON,
        senderId: notificationJSON.sender ? notificationJSON.sender.id : null,
        senderUsername: notificationJSON.sender ? notificationJSON.sender.username : null,
        senderAvatarUrl: notificationJSON.sender ? notificationJSON.sender.avatarUrl : null,
      };
    });

    res.json(formattedNotifications);
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.count({
      where: { userId: req.user.id, read: false }
    });
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};