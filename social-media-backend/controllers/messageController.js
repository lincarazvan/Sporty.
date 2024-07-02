const { User, Message, Notification } = require('../models');
const { Op, Sequelize } = require('sequelize');

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Message.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('senderId')), 'otherUserId'],
        [Sequelize.fn('MAX', Sequelize.col('Message.createdAt')), 'lastMessageTime']
      ],
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatarUrl'],
        where: {
          id: { [Op.ne]: userId }
        },
        required: false
      }, {
        model: User,
        as: 'receiver',
        attributes: ['id', 'username', 'avatarUrl'],
        where: {
          id: { [Op.ne]: userId }
        },
        required: false
      }],
      group: [
        'Message.senderId',
        'sender.id',
        'receiver.id'
      ],
      order: [[Sequelize.fn('MAX', Sequelize.col('Message.createdAt')), 'DESC']]
    });

    const formattedConversations = conversations.map(conv => {
      const otherUser = conv.sender && conv.sender.id !== userId ? conv.sender : conv.receiver;
      if (!otherUser) {
        console.error('No other user found for conversation:', conv);
        return null;
      }
      return {
        id: otherUser.id,
        username: otherUser.username,
        avatarUrl: otherUser.avatarUrl,
        lastMessageTime: conv.get('lastMessageTime')
      };
    }).filter(Boolean);

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId }
        ]
      },
      order: [['createdAt', 'ASC']],
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatarUrl']
      }]
    });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    const newMessage = await Message.create({
      senderId,
      receiverId,
      content,
      status: 'sent'
    });
    const messageWithSender = await Message.findByPk(newMessage.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatarUrl']
      }]
    });

    const notification = await Notification.create({
      userId: receiverId,
      type: 'message',
      message: `Ai primit un mesaj nou de la ${req.user.username}.`,
      relatedId: newMessage.id
    });

    global.io.to(receiverId.toString()).emit('newMessage', messageWithSender);
    global.io.to(receiverId.toString()).emit('notification', notification);

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    message.status = status;
    if (status === 'seen') {
      message.seenAt = new Date();
    }
    await message.save();
    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this message' });
    }

    message.isDeleted = true;
    message.content = 'This message has been deleted';
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};