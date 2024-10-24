'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('GameTicketRecords', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      gameTicketId: {
        type: Sequelize.INTEGER
      },
      tipo: {
        type: Sequelize.ENUM('CHANCE', 'BILLETE', 'EXTRAORDINARIO')
      },
      numero: {
        type: Sequelize.STRING
      },
      cantidad: {
        type: Sequelize.INTEGER
      },
      precio_unidad: {
        type: Sequelize.DOUBLE
      },
      valorcompra: {
        type: Sequelize.DOUBLE
      },
      ganador: {
        type: Sequelize.ENUM('SI', 'NO')
      },
      primer_premio: {
        type: Sequelize.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_PRIMEROS_ULTIMO_NUMERO', 'DOS_PRIMEROS', 'DOS_ULTIMOS', 'ULTIMO_NUMERO')
      },
      segundo_premio: {
        type: Sequelize.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_ULTIMOS')
      },
      tercer_premio: {
        type: Sequelize.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_ULTIMOS')
      },
      valorganador: {
        type: Sequelize.DOUBLE
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
    await queryInterface.dropTable('GameTicketRecords');
  }
};