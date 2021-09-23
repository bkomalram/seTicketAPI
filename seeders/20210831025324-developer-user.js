'use strict';
const bcrypt = require("bcrypt")
require('dotenv').config()
module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     * padreUsuario_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    contrasena: DataTypes.TEXT,
    perfil: DataTypes.ENUM('ADMIN', 'VENDEDOR'),
    ultimaConexion: DataTypes.DATE,
    esActivo: DataTypes.ENUM('SI', 'NO')
    */
    
    const salt = await bcrypt.genSalt(10); //whatever number you want
    const contrasena = await bcrypt.hash('dummy', salt);

    await queryInterface.bulkInsert('Users', [{
      padreUsuario_id: null,
      nombre: 'seapi',
      contrasena:contrasena,
      perfil:'ADMIN',
      ultimaConexion:null,
      esActivo:'SI',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('Users', {nombre:'seapi'}, {});
  }
};
