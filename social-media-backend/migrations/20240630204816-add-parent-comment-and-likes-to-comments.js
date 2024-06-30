'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Verifică dacă coloana parentCommentId există deja
      const parentCommentIdExists = await queryInterface.describeTable('Comments')
        .then(tableDefinition => tableDefinition.hasOwnProperty('parentCommentId'))
        .catch(() => false);

      if (!parentCommentIdExists) {
        await queryInterface.addColumn('Comments', 'parentCommentId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'Comments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }, { transaction });
      }

      // Verifică dacă coloana likes există deja
      const likesExists = await queryInterface.describeTable('Comments')
        .then(tableDefinition => tableDefinition.hasOwnProperty('likes'))
        .catch(() => false);

      if (!likesExists) {
        await queryInterface.addColumn('Comments', 'likes', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        }, { transaction });
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('Comments', 'parentCommentId', { transaction });
      await queryInterface.removeColumn('Comments', 'likes', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};