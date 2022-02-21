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
     await queryInterface.bulkInsert('Configs', [{
      propiedad: "nombre",
      valor: "Sorteo Semilla Developer BK",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      propiedad: "precioChance",
      valor: "0.25",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      propiedad: "precioBillete",
      valor: "1.00",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      propiedad: "impresion",
      valor: "80mm*200mm",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      propiedad: "gameId",
      valor: "1",
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
     await queryInterface.bulkDelete('Configs', {}, {});
  }
};
