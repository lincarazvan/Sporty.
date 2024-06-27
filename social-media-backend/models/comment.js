const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Comments'
});

Comment.associate = function(models) {
  Comment.belongsTo(models.User, { foreignKey: 'userId' });
  Comment.belongsTo(models.Post, { foreignKey: 'postId' });
};

module.exports = Comment;