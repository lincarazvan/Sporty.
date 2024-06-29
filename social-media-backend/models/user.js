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
    allowNull: true,
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
    defaultValue: '/default-avatar.png' // O imagine implicită pentru utilizatorii fără avatar personalizat
  },
}, {
  tableName: 'Users'
});

User.associate = function(models) {
  User.hasMany(models.Post, { foreignKey: 'userId', onDelete: 'CASCADE' });
  User.hasMany(models.Like, { foreignKey: 'userId' });
  User.hasMany(models.Follow, { as: 'Followers', foreignKey: 'followingId' });
  User.hasMany(models.Follow, { as: 'Following', foreignKey: 'followerId' });
};

module.exports = User;