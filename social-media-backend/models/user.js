const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 2
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '/default-avatar.png'
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpire: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Users'
});

User.associate = function(models) {
  User.hasMany(models.Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
  User.hasMany(models.Like, { foreignKey: 'userId' });
  User.hasMany(models.Follow, { as: 'Followers', foreignKey: 'followingId' });
  User.hasMany(models.Follow, { as: 'Following', foreignKey: 'followerId' });
  User.hasMany(models.Message, { as: 'sentMessages', foreignKey: 'senderId' });
  User.hasMany(models.Message, { as: 'receivedMessages', foreignKey: 'receiverId' });
  User.belongsTo(models.Role, { foreignKey: 'roleId' });
  User.hasMany(models.Report, { as: 'ReportsCreated', foreignKey: 'userId' });
  User.hasMany(models.Report, { as: 'ReportsReceived', foreignKey: 'reportedUserId' });
};

module.exports = User;