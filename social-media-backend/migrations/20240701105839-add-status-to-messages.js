'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Messages', 'status', {
      type: Sequelize.ENUM('sent', 'delivered', 'read'),
      defaultValue: 'sent'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Messages', 'status');
  }
};