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
      this.belongsTo(models.User)
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

  return GameTicket;
};