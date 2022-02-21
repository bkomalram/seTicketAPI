'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameTickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      game_id: {
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATE
      },
      vendedor_id: {
        type: Sequelize.INTEGER
      },
      ganador: {
        type: Sequelize.ENUM('SI', 'NO')
      },
      valorcompra: {
        type: Sequelize.DOUBLE
      },
      valorganador: {
        type: Sequelize.DOUBLE
      },
      cambio: {
        type: Sequelize.ENUM('SI', 'NO')
      },
      esValido: {
        type: Sequelize.ENUM('SI', 'NO')
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('GameTickets');
  }
};