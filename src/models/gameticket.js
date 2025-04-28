'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameTicket extends Model {
    static associate(models) {
      // define association here      
      this.hasMany(models.GameTicketRecord)
      this.belongsTo(models.User)
      this.belongsTo(models.Game, { foreignKey: 'game_id' }) // Add Game association
    }
  };
  GameTicket.init({
    game_id: DataTypes.INTEGER,
    fecha: DataTypes.DATE,
    userId: DataTypes.INTEGER,
    ganador: DataTypes.ENUM('SI', 'NO'),
    valorcompra: DataTypes.DOUBLE,
    valorganador: DataTypes.DOUBLE,
    cambio: DataTypes.ENUM('SI', 'NO'),
    esValido: DataTypes.ENUM('SI', 'NO')
  }, {
    sequelize,
    modelName: 'GameTicket',
  });  
  
  GameTicket.prototype.setRedeemed = async function() {    
    this.cambio = "SI";
    return await this.save()
  }

  GameTicket.prototype.setInvalid = async function() {    
    this.esValido = "NO";
    return await this.save()
  }

  GameTicket.prototype.setValid = async function() {    
    this.esValido = "SI";
    return await this.save()
  }

  GameTicket.prototype.validateGame = async function() {
    const game = await this.getGame();
    if (!game) {
      throw new Error('Game not found');
    }
    return game.esActivo === 'SI' && game.enVenta === 'SI';
  }

  return GameTicket;
};