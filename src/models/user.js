'use strict';
const {
  Model
} = require('sequelize');
const bcrypt = require("bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.GameTicket)
    }
  };
  User.init({
    padreUsuario_id: DataTypes.INTEGER,
    nombre: DataTypes.STRING,
    porcentajeComision:DataTypes.DOUBLE,
    porcentajeComisionBillete:DataTypes.DOUBLE,
    contrasena: DataTypes.TEXT,
    perfil: DataTypes.ENUM('ADMIN', 'VENDEDOR'),
    ultimaConexion: DataTypes.DATE,
    esActivo: DataTypes.ENUM('SI', 'NO')
  }, {
    sequelize,
    modelName: 'User',
    hooks:{
      beforeCreate: async function(user) {
        const salt = await bcrypt.genSalt(10); //whatever number you want
        user.contrasena = await bcrypt.hash(user.contrasena, salt);
      }      
    },    
  });

  User.prototype.validPassword = async function(contrasena) {
    return await bcrypt.compare(contrasena, this.contrasena);
  }

  User.prototype.changePassword = async function(contrasena) {
    const salt = await bcrypt.genSalt(10); //whatever number you want
    this.contrasena = await bcrypt.hash(contrasena, salt);
    return await this.save()
  }

  User.prototype.changePercentage = async function(comision) {
    this.porcentajeComision = comision;
    return await this.save()
  }


  return User;
};