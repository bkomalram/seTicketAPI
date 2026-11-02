'use strict';
const DB = require('../models');
const limits = require('./sale-limits');
const rules = require('./limit-rules');
module.exports = async function repeatTicket(jornada, body) {
  const id=Number(body.ticketId);
  if(!Number.isSafeInteger(id) || id<1)rules.fail('Introduce un número de ticket válido.');
  const {game,canManage}=await limits.access(jornada,body.sorteoId,body.userId || jornada.id);
  if(game.esActivo!=='SI' || game.enVenta!=='SI')rules.fail('Selecciona un sorteo abierto y con la venta activa.',409);
  let users=[Number(jornada.id)];
  if(canManage){
    const children=await DB.User.findAll({where:{padreUsuario_id:jornada.id},attributes:['id']});
    users=users.concat(children.map(u=>Number(u.id)));
  }
  const ticket=await DB.GameTicket.findOne({where:{id,userId:{[DB.Sequelize.Op.in]:users},esValido:'SI'},include:[{model:DB.Game,required:true,where:{usuario_id:game.usuario_id},attributes:['id']}],attributes:['id','game_id']});
  if(!ticket)rules.fail('No se encontró un ticket disponible de tu equipo con ese número.',404);
  const records=await DB.GameTicketRecord.findAll({where:{gameTicketId:ticket.id},attributes:['tipo','numero','cantidad'],order:[['numero','ASC']],raw:true});
  if(!records.length)rules.fail('El ticket no contiene números para repetir.',404);
  if(records.some(r=>!['CHANCE','BILLETE'].includes(r.tipo)))rules.fail('El ticket contiene tipos de números que no se pueden repetir.');
  return {ticketId:ticket.id,sorteoId:game.id,registros:records};
};
