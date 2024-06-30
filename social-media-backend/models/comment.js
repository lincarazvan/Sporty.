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
  parentCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'Comments'
});

Comment.associate = function(models) {
  Comment.belongsTo(models.User, { foreignKey: 'userId' });
  Comment.belongsTo(models.Post, { foreignKey: 'postId' });
  Comment.hasMany(Comment, { as: 'Replies', foreignKey: 'parentCommentId' });
  Comment.belongsTo(Comment, { as: 'ParentComment', foreignKey: 'parentCommentId' });
};

module.exports = Comment;