'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameTicketRecord extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.GameTicket)
    }
  };
  GameTicketRecord.init({
    gameTicketId: DataTypes.INTEGER,
    tipo: DataTypes.ENUM('CHANCE', 'BILLETE', 'EXTRAORDINARIO'),
    numero: DataTypes.STRING,
    cantidad: DataTypes.INTEGER,
    precio_unidad: DataTypes.DOUBLE,
    valorcompra: DataTypes.DOUBLE,
    ganador: DataTypes.ENUM('SI', 'NO'),
    primer_premio: DataTypes.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_PRIMEROS_ULTIMO_NUMERO', 'DOS_PRIMEROS', 'DOS_ULTIMOS', 'ULTIMO_NUMERO'),
    segundo_premio: DataTypes.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_ULTIMOS'),
    tercer_premio: DataTypes.ENUM('CHANCE_GANADOR', 'CUATRO_NUMEROS', 'TRES_PRIMEROS', 'TRES_ULTIMOS', 'DOS_ULTIMOS'),
    valorganador: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'GameTicketRecord',
  });
  return GameTicketRecord;
};