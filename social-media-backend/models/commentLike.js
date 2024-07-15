const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommentLike = sequelize.define('CommentLike', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'CommentLikes',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'commentId']
    }
  ]
});

CommentLike.associate = function(models) {
  CommentLike.belongsTo(models.User, { foreignKey: 'userId' });
  CommentLike.belongsTo(models.Comment, { foreignKey: 'commentId' });
};

module.exports = CommentLike;