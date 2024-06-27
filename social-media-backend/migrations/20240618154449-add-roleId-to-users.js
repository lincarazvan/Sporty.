'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifică dacă coloana există înainte de a încerca să o adaugi
    const tableInfo = await queryInterface.describeTable('Users');
    if (!tableInfo.roleId) {
      await queryInterface.addColumn('Users', 'roleId', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'roleId');
  }
};