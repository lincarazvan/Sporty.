const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
});

module.exports = Report;
