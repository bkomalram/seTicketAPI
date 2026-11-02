'use strict';
module.exports = (sequelize, DataTypes) => sequelize.define('SaleLimit', {
  game_id: {type: DataTypes.INTEGER, allowNull: false},
  user_id: {type: DataTypes.INTEGER, allowNull: false},
  configuration: {type: DataTypes.JSON, allowNull: false}
}, {indexes: [{unique: true, fields: ['game_id','user_id']}]});
