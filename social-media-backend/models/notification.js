const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  senderUsername: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mentionedInType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mentionedInId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
});

Notification.associate = function(models) {
  Notification.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });
};

module.exports = Notification;