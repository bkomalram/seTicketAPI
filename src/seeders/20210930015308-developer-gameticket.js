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
     try {
      let developmentGameTicket = []
    for (let index = 0; index < 10; index++) {
      let chance = index.toString()
      const element = {
        game_id: 1,
        fecha: new Date(),
        vendedor_id: 1,
        ganador: 'NO',
        valorcompra: 1.00 + index,
        valorganador: null,
        cambio: 'NO',
        esValido: 'SI',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      developmentGameTicket.push(element)
    }    
     await queryInterface.bulkInsert('GameTickets', developmentGameTicket, {});       
    } catch (error) {
      console.log(error)      
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
     await queryInterface.bulkDelete('GameTickets', {game_id:1,vendedor_id:1}, {})
  }
};
