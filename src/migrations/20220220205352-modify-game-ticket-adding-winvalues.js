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
      await queryInterface.renameColumn('GameTicketRecords', 'valorganador', 'valorganador1er')
      await queryInterface.addColumn('GameTicketRecords', 'valorganador2do',{
        type: Sequelize.DOUBLE,
        after: 'valorganador1er'
      })
      await queryInterface.addColumn('GameTicketRecords', 'valorganador3ro',{
        type: Sequelize.DOUBLE,
        after: 'valorganador2do'
      }
      )

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
      await queryInterface.renameColumn('GameTicketRecords', 'valorganador1er', 'valorganador')
      await queryInterface.removeColumn('GameTicketRecords', 'valorganador2do')
      await queryInterface.removeColumn('GameTicketRecords', 'valorganador3ro')

    } catch (error) {
      console.log(error)
    }
  }
};
