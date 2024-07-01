const { User, Message } = require('../models');
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
    }).filter(Boolean); // Remove any null entries

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
    await Message.update({ status }, { where: { id: messageId } });
    res.json({ message: 'Message status updated successfully' });
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ message: 'Error updating message status' });
  }
};