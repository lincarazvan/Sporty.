'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Notifications', 'mentionedInType', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Notifications', 'mentionedInId', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Notifications', 'mentionedInType');
    await queryInterface.removeColumn('Notifications', 'mentionedInId');
  }
};