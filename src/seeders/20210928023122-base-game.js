'use strict';

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
    */

     await queryInterface.bulkInsert('Games', [{
      usuario_id: 1,
      nombre: "Sorteo Semilla #1",
      fecha: new Date(),      
      esActivo:'SI',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      usuario_id: 1,
      nombre: "Sorteo Semilla #2",
      fecha: new Date(),      
      esActivo:'SI',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      usuario_id: 1,
      nombre: "Sorteo Semilla #3",
      fecha: new Date(),      
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
     await queryInterface.bulkDelete('Games', 
     {nombre:"Sorteo Semilla #1"},
     {nombre:"Sorteo Semilla #2"},
     {nombre:"Sorteo Semilla #3"}, {});
  }
};
