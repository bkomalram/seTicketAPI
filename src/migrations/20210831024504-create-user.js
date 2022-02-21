'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      padreUsuario_id: {
        type: Sequelize.INTEGER
      },
      nombre: {
        type: Sequelize.STRING
      },
      contrasena: {
        type: Sequelize.TEXT
      },
      perfil: {
        type: Sequelize.ENUM('ADMIN', 'VENDEDOR')
      },
      ultimaConexion: {
        type: Sequelize.DATE
      },
      esActivo: {
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
    await queryInterface.dropTable('Users');
  }
};