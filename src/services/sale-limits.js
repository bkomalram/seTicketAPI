'use strict';
const DB = require('../models');
const rules = require('./limit-rules');
const empty = () => ({chance:null, billete:null, exceptions:[]});
async function access(jornada, gameId, userId, transaction) {
  if (!jornada || !Number(jornada.id) || !Number(jornada.accesos)) rules.fail('Acceso denegado.',403);
  if (!Number.isSafeInteger(Number(gameId)) || Number(gameId) < 1 || !Number.isSafeInteger(Number(userId)) || Number(userId) < 1) rules.fail('Sorteo o usuario inválido.');
  // All writes lock the same game row, serializing configuration and ticket changes.
  const game = await DB.Game.findByPk(gameId, {transaction, ...(transaction ? {lock:transaction.LOCK.UPDATE} : {})});
  if (!game) rules.fail('Sorteo no encontrado.',404);
  const owner = Number(game.usuario_id), self = Number(jornada.id);
  if (owner !== self && owner !== Number(jornada.padreUsuario_id)) rules.fail('No tienes acceso a este sorteo.',403);
  const user = await DB.User.findByPk(userId, {transaction});
  if (!user || user.esActivo !== 'SI') rules.fail('Usuario no disponible.',404);
  if (Number(user.id) !== owner && Number(user.padreUsuario_id) !== owner) rules.fail('El usuario no pertenece al sorteo.',403);
  if (Number(user.id) !== self && !(owner === self && Number(jornada.accesos) >= 2)) rules.fail('No puedes operar con otro usuario.',403);
  return {game, user, canManage:owner === self && Number(jornada.accesos) >= 2};
}
async function configuration(gameId, userId, transaction) {
  const row = await DB.SaleLimit.findOne({where:{game_id:gameId,user_id:userId},transaction});
  if (!row) return empty();
  return typeof row.configuration === 'string' ? JSON.parse(row.configuration) : row.configuration;
}
async function sold(gameId, userId, exclude, transaction) {
  const where = {game_id:gameId,userId,esValido:'SI'};
  if (exclude) where.id = {[DB.Sequelize.Op.ne]:exclude};
  const rows = await DB.GameTicketRecord.findAll({
    attributes:['tipo','numero','cantidad'], include:[{model:DB.GameTicket,attributes:[],required:true,where}], transaction, raw:true
  });
  const result = {};
  rows.forEach(r => { const key = r.tipo + ':' + r.numero; result[key] = (result[key] || 0) + Number(r.cantidad); });
  return result;
}
async function saveTicket(jornada, body) {
  const records = rules.validateRecords(body.registros);
  const userId = body.userId || jornada.id;
  const value = Number(body.valor);
  if (!Number.isFinite(value) || Math.abs(records.reduce((sum,r) => sum + r.valor,0) - value) > .011) rules.fail('El total no coincide con los registros.');
  return DB.sequelize.transaction(async transaction => {
    const {game} = await access(jornada, body.sorteoId, userId, transaction);
    if (game.esActivo !== 'SI' || game.enVenta !== 'SI') rules.fail('Venta detenida o cerrada para sorteo.',409);
    let ticket;
    if (body.editar) {
      ticket = await DB.GameTicket.findByPk(body.editar,{transaction,lock:transaction.LOCK.UPDATE});
      if (!ticket || Number(ticket.game_id) !== Number(game.id) || Number(ticket.userId) !== Number(userId) || ticket.esValido !== 'SI' || ticket.cambio === 'SI') rules.fail('Este ticket no se puede editar.',403);
    }
    // The limit applies to subsequent entry, never to lines already in the ticket.
    // Persist the full ticket; the UI recounts committed records after success.
    const header = {game_id:game.id,userId,fecha:new Date(),ganador:'NO',valorcompra:value,valorganador:0,cambio:'NO',esValido:'SI'};
    if (ticket) {
      await ticket.update(header,{transaction});
      await DB.GameTicketRecord.destroy({where:{gameTicketId:ticket.id},transaction});
    } else ticket = await DB.GameTicket.create(header,{transaction});
    await DB.GameTicketRecord.bulkCreate(records.map(r => ({gameTicketId:ticket.id,tipo:r.tipo,numero:r.numero,cantidad:r.cantidad,precio_unidad:r.precio,valorcompra:r.valor,ganador:'NO',valorganador1er:0,valorganador2do:0,valorganador3ro:0})),{transaction});
    return ticket;
  });
}
module.exports = {access, configuration, sold, saveTicket};
