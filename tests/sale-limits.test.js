'use strict';
const assert=require('assert');
const rules=require('../src/services/limit-rules');
const vm=require('vm'),fs=require('fs');
const config=rules.config({chance:100,billete:200,exceptions:[{tipo:'CHANCE',numero:'15',maximo:50}]});
assert.equal(rules.maximum(config,'CHANCE','15'),50);
assert.equal(rules.maximum(config,'CHANCE','16'),100);
assert.equal(rules.maximum(config,'BILLETE','0015'),200);
assert.throws(()=>rules.check(config,{'CHANCE:15':40},[{tipo:'CHANCE',numero:'15',cantidad:11}]),/Disponible: 10/);
assert.throws(()=>rules.check(config,{},[{tipo:'CHANCE',numero:'15',cantidad:30},{tipo:'CHANCE',numero:'15',cantidad:21}]),/Cupo/);
assert.throws(()=>rules.config({chance:-1,exceptions:[]}),/entero/);
assert.throws(()=>rules.config({exceptions:[{tipo:'CHANCE',numero:'1',maximo:2},{tipo:'CHANCE',numero:'01',maximo:3}]}),/duplicadas/);
assert.throws(()=>rules.validateRecords([{tipo:'CHANCE',numero:'15',cantidad:1.5,precio:1,valor:1.5}]),/entero/);
rules.check(rules.config({chance:'',billete:'',exceptions:[]}),{},[{tipo:'CHANCE',numero:'15',cantidad:100000}]);
let tickets=[],records=[],mutex=Promise.resolve(),id=0;
const DB={Sequelize:{Op:{ne:'ne'}},sequelize:{transaction(fn){const run=mutex.then(async()=>{const before=JSON.stringify({tickets,records});try{return await fn({LOCK:{UPDATE:'UPDATE'}});}catch(e){({tickets,records}=JSON.parse(before));throw e;}});mutex=run.catch(()=>{});return run;}},
Game:{async findByPk(){return {id:1,usuario_id:1,esActivo:'SI',enVenta:'SI'};}},User:{async findByPk(userId){return {id:Number(userId),padreUsuario_id:1,esActivo:'SI'};}},
SaleLimit:{async findOne(){return {configuration:config};}},
GameTicket:{async findByPk(ticketId){const t=tickets.find(t=>t.id===ticketId);if(t)t.update=async function(h){Object.assign(this,h);};return t;},async create(header){const ticket=Object.assign({id:++id,async update(h){Object.assign(this,h);}},header);tickets.push(ticket);return ticket;}},
GameTicketRecord:{async findAll(options){const w=options.include[0].where;return records.filter(r=>tickets.some(t=>t.id===r.gameTicketId && Number(t.userId)===Number(w.userId) && (!w.id || t.id!==w.id.ne)));},async destroy(options){records=records.filter(r=>r.gameTicketId!==options.where.gameTicketId);},async bulkCreate(rows){records.push(...rows);}}};
const sandbox={require(name){return name==='../models'?DB:rules;},module:{exports:{}},console};
vm.runInNewContext(fs.readFileSync(require.resolve('../src/services/sale-limits'),'utf8'),sandbox);
const service=sandbox.module.exports,jornada={id:1,accesos:2},body={sorteoId:1,userId:1,valor:30,registros:[{tipo:'CHANCE',numero:'15',cantidad:30,precio:1,valor:30}]};
(async()=>{
const result=await Promise.allSettled([service.saveTicket(jornada,body),service.saveTicket(jornada,body)]);
assert.equal(result.filter(r=>r.status==='fulfilled').length,2,'Complete tickets are saved even when they cross the limit');
assert.equal(tickets.length,2);assert.equal(records.length,2);
await service.saveTicket(jornada,Object.assign({},body,{editar:1}));assert.equal(records.length,2,'Editing replaces the previous quantities without deleting lines');
await assert.rejects(service.saveTicket({id:2,padreUsuario_id:1,accesos:1},body),/otro usuario/);
await service.saveTicket(jornada,Object.assign({},body,{userId:2}));assert.equal(tickets.length,3,'Each seller has separate recorded sales');
const total=await service.sold(1,1);assert.equal(total['CHANCE:15'],60,'Post-sale counts include all stored tickets');
await service.saveTicket(jornada,Object.assign({},body,{editar:1,valor:50,registros:[{tipo:'CHANCE',numero:'15',cantidad:50,precio:1,valor:50}]}));
assert.equal(records.find(r=>r.gameTicketId===1).cantidad,50,'Editing to the limit preserves the line');
await service.saveTicket(jornada,Object.assign({},body,{editar:1,valor:80,registros:[{tipo:'CHANCE',numero:'15',cantidad:80,precio:1,valor:80}]}));
assert.equal(records.find(r=>r.gameTicketId===1).cantidad,80,'Editing beyond the limit preserves the line');
console.log('OK: limits, exceptions, duplicate lines, isolated users, edits, authorization, complete tickets across limits and post-sale counts (mock transaction).');
})().catch(e=>{console.error(e);process.exit(1);});
