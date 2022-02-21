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
      let developmentGameTicketRecord = []
    for (let index = 0; index < 10; index++) {      
      const element = {
        gameTicketId: index+1,
        tipo: index%2==0?'CHANCE':'BILLETE',
        numero: index%2==0?'2'+index:'564'+index,
        cantidad: index+1,
        precio_unidad: 0.25,
        valorcompra: 0.25*(index+1),
        ganador: 'NO',
        primer_premio: null,
        segundo_premio: null,
        tercer_premio: null,
        valorganador: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      developmentGameTicketRecord.push(element)
    }    
     await queryInterface.bulkInsert('GameTicketRecords', developmentGameTicketRecord, {});       
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
     await queryInterface.bulkDelete('GameTicketRecords', {gameTicketId:{[Sequelize.Op.lte]:10}}, {})
  }
};
