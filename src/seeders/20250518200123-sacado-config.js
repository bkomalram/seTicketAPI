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
      propiedad: "sacado-billetes",
      valor: "1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      propiedad: "sacado-chance",
      valor: "100",
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
    // Delete the records sacado-billete and sacado-chance
    await queryInterface.bulkDelete('Configs', {
      propiedad: {
        [Sequelize.Op.or]: ['sacado-billetes', 'sacado-chance']
      }
    }, {});
    
     //await queryInterface.bulkDelete('Configs', {}, {});
  }
};
