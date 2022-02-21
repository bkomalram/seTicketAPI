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
      let developmentGameStates = []
    for (let index = 0; index < 100; index++) {
      let chance = index.toString()
      const element = {
        game_id: 1,
        usuario_id: 1,
        chance: chance.padStart(2,'0'),
        cantidad: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      developmentGameStates.push(element)
    }    
     await queryInterface.bulkInsert('GameStates', developmentGameStates, {});       
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
     await queryInterface.bulkDelete('GameStates', {game_id:1}, {})
  }
};
