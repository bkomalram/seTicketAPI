'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    try {
      await queryInterface.renameColumn('GameStates', 'sorteo_id', 'game_id')      
    } catch (error) {
      console.log(error)
    }     
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     try {
      await queryInterface.renameColumn('GameStates', 'game_id', 'sorteo_id')
    } catch (error) {
      console.log(error)
    }     
  }
};
