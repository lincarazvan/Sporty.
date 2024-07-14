const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('Role', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

Role.associate = function(models) {
  Role.hasMany(models.User, { foreignKey: 'roleId' });
};

module.exports = Role;