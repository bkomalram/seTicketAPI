'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.renameColumn('GameTickets', 'vendedor_id', 'userId')  
     
     await queryInterface.addConstraint('GameTickets', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fkUser_Ticket',
      references: { //Required field
        table: 'Users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     //await queryInterface.removeConstraint('GameTickets','fkUser_Ticket')
     //await queryInterface.renameColumn('GameTickets', 'userId', 'vendedor_id') 
  }
};
