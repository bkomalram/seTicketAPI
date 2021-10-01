'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameTicket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here      
      this.hasMany(models.GameTicketRecord)
    }
  };
  GameTicket.init({
    game_id: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    vendedor_id: DataTypes.INTEGER,
    ganador: DataTypes.ENUM('SI', 'NO'),
    valorcompra: DataTypes.DOUBLE,
    valorganador: DataTypes.DOUBLE,
    cambio: DataTypes.ENUM('SI', 'NO'),
    esValido: DataTypes.ENUM('SI', 'NO')
  }, {
    sequelize,
    modelName: 'GameTicket',
  });  
  
  return GameTicket;
};