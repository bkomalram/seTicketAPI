'use strict';
const router = require('express').Router();
const DB = require('../models');
const limits = require('../services/sale-limits');
const rules = require('../services/limit-rules');
function error(res,e) { res.status(e.status || 500).json({exitoso:false,resultado:e.status ? e.message : 'No se pudieron procesar los límites.'}); }
router.get('/', async (req,res) => {
  try {
    const gameId = req.query.sorteoId, userId = req.query.userId || req.jornada.id;
    const {game,canManage} = await limits.access(req.jornada,gameId,userId);
    const users = canManage ? await DB.User.findAll({where:{esActivo:'SI',[DB.Sequelize.Op.or]:[{id:game.usuario_id},{padreUsuario_id:game.usuario_id}]},attributes:['id','nombre'],order:[['nombre','ASC']]}) : [];
    res.json({exitoso:true,resultado:{configuration:await limits.configuration(gameId,userId),sold:await limits.sold(gameId,userId),users,canManage}});
  } catch(e) {error(res,e);}
});
router.put('/', async (req,res) => {
  try {
    const config = rules.config(req.body.configuration);
    await DB.sequelize.transaction(async transaction => {
      const {game,canManage} = await limits.access(req.jornada,req.body.sorteoId,req.body.userId,transaction);
      if (!canManage) rules.fail('Solo el administrador del sorteo puede cambiar los límites.',403);
      if (game.esActivo !== 'SI') rules.fail('El sorteo está cerrado.',409);
      await DB.SaleLimit.upsert({game_id:game.id,user_id:req.body.userId,configuration:config},{transaction});
    });
    res.json({exitoso:true,resultado:'Límites guardados.'});
  } catch(e) {error(res,e);}
});
module.exports = router;
