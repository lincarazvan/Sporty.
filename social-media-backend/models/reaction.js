const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Reaction = sequelize.define('Reaction', {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
});
module.exports = Reaction;
