'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    static associate(models) {
      // define association here
      this.hasMany(models.GameTicket, { foreignKey: 'game_id' })
    }
  };
  Game.init({
    usuario_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    fecha: DataTypes.DATE,
    esActivo: DataTypes.ENUM('SI', 'NO'),
    enVenta: DataTypes.ENUM('SI', 'NO')
  }, {
    sequelize,
    modelName: 'Game',
  });

  Game.prototype.createGame = async function(nombre,usuarioId) {
    
  }

  Game.prototype.invalidar= async function() {    
    this.esActivo = "NO";
    return await this.save()
  }

  Game.prototype.detenerVenta= async function() {    
    this.enVenta = "NO";
    return await this.save()
  }

  return Game;
};