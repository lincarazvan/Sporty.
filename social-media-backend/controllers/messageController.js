const { validationResult } = require('express-validator');
const Message = require('../models/message');

exports.sendMessage = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { receiverId, content } = req.body;
  const senderId = req.user.id;
  try {
    const message = await Message.create({ senderId, receiverId, content });
    res.status(201).send(message);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getMessagesForUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const messages = await Message.findAll({ where: { receiverId: userId } });
    res.send(messages);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};

exports.getConversation = async (req, res) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      order: [['timestamp', 'ASC']],
    });
    res.send(messages);
  } catch (error) {
    res.status(500).send('Server Error');
  }
};
