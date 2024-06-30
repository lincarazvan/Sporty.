const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'Posts'
});

Post.associate = function(models) {
  Post.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  Post.hasMany(models.Like, { foreignKey: 'postId' });
  Post.hasMany(models.Comment, { foreignKey: 'postId' });
};

module.exports = Post;