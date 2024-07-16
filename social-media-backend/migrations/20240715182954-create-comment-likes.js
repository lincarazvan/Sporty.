'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Verifică dacă tabelul CommentLikes există deja
    const tableExists = await queryInterface.showAllTables()
      .then(tables => tables.includes('CommentLikes'));

    if (!tableExists) {
      await queryInterface.createTable('CommentLikes', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        commentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'Comments',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        }
      });
    }

    // Verifică dacă indexul există deja
    const indexExists = await queryInterface.showIndex('CommentLikes')
      .then(indexes => indexes.some(index => index.name === 'comment_likes_user_id_comment_id'));

    if (!indexExists) {
      await queryInterface.addIndex('CommentLikes', ['userId', 'commentId'], {
        unique: true,
        name: 'comment_likes_user_id_comment_id'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CommentLikes');
  }
};