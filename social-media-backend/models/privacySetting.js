const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PrivacySetting = sequelize.define('PrivacySetting', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  visibility: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'public'
  }
});

module.exports = PrivacySetting;
