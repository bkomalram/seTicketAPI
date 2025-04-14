'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'perfil', {
      type: Sequelize.ENUM('ADMIN', 'VENDEDOR', 'SUPERVISOR'),
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    // En el rollback quitamos SUPERVISOR
    await queryInterface.changeColumn('Users', 'perfil', {
      type: Sequelize.ENUM('ADMIN', 'VENDEDOR'),
      allowNull: false
    });
  }
};
