const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

Message.associate = function(models) {
  Message.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
  Message.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });
};

module.exports = Message;