'use strict';
const assert=require('assert'),vm=require('vm'),fs=require('fs');
const elements={};
function element(){return {value:'',disabled:false,hidden:false,textContent:'',classList:{toggle(){},remove(){}},removeAttribute(name){delete this[name];}};}
const board=element();board.name='15';
const qty=element(),number=element();number.value='15';
const bag={items:[],add(item){this.items.push(item);},render(){}};
let sold=40,getCount=0;
const window={addEventListener(){},async fetch(resource,options){
 if(options && options.method==='POST')sold=120;else getCount++;
 const data=options && options.method==='POST'?{exitoso:true}:{exitoso:true,resultado:{configuration:{chance:50,billete:null,exceptions:[]},sold:{'CHANCE:15':sold},canManage:true}};
 return {ok:true,async json(){return data;},clone(){return this;}};
}};
const context={window,bag,document:{hidden:false,getElementById(id){return elements[id]||(elements[id]=element());},querySelectorAll(selector){return selector==='#chanceBuilder input'?[board]:[];},querySelector(selector){return selector==='#iSingleChance'?number:selector==='#iSingleChanceQty'?qty:null;},addEventListener(){}},localStorage:{getItem(key){return key==='choose-game'||key==='sesion-id'?'1':'';}},setInterval(){},setTimeout,console};
context.fetch=(...args)=>window.fetch(...args);
vm.runInNewContext(fs.readFileSync(require.resolve('../public/javascripts/sale-limits.js'),'utf8'),context);
(async()=>{
 await new Promise(setImmediate);
 assert.equal(board.disabled,false);assert.equal(qty.disabled,false);
 assert.equal(board.max,undefined,'Remaining quantity must not cap ticket input');
 const loaded={number:'15',qty:80};bag.add(loaded);bag.render();
 assert.equal(bag.items[0],loaded,'Loaded lines above the limit remain unchanged');
 await window.fetch('/tiquete/mq',{method:'POST'});
 assert.equal(board.disabled,true,'Disable exhausted table entries after the sale');
 assert.equal(qty.disabled,true);
 assert.equal(bag.items[0].qty,80,'Recount must not remove or trim the ticket');
 assert.ok(getCount>=2,'A successful sale triggers a recount');
 console.log('OK: complete loaded lines, no quantity caps or modal calls, post-sale recount and disabled inputs.');
})().catch(e=>{console.error(e);process.exit(1);});
