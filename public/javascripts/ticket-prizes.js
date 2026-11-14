/* The same detail records drive the history total and the ticket detail. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.TicketPrizes=factory();})(typeof window==='object'?window:this,function(){
  'use strict';
  function amount(value){if(value==null)return 0;const number=Number(value);if(!Number.isFinite(number))throw Error('Importe de premio inválido.');return number;}
  function record(row){return row.ganador==='SI'?amount(row.valorganador1er)+amount(row.valorganador2do)+amount(row.valorganador3ro):0;}
  function total(rows){return rows.reduce((sum,row)=>sum+record(row),0);}
  return {record,total};
});
