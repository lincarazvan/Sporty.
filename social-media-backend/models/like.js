const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Like = sequelize.define('Like', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'Likes', // Asigură-te că numele tabelului este specificat corect
  indexes: [
    {
      unique: true,
      fields: ['userId', 'postId']
    }
  ]
});

Like.associate = function(models) {
  Like.belongsTo(models.User, { foreignKey: 'userId' });
  Like.belongsTo(models.Post, { foreignKey: 'postId' });
};

module.exports = Like;