const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

Follow.associate = function(models) {
  Follow.belongsTo(models.User, { as: 'follower', foreignKey: 'followerId' });
  Follow.belongsTo(models.User, { as: 'following', foreignKey: 'followingId' });
};

module.exports = Follow;
