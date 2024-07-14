const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Report = sequelize.define('Report', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reportedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  commentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
});

Report.associate = function(models) {
  Report.belongsTo(models.User, { foreignKey: 'userId' });
  Report.belongsTo(models.User, { as: 'ReportedUser', foreignKey: 'reportedUserId' });
  Report.belongsTo(models.Post, { foreignKey: 'postId' });
  Report.belongsTo(models.Comment, { foreignKey: 'commentId' });
};

module.exports = Report;