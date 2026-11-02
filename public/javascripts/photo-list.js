/* Shared validation for image-import drafts. Never substitutes uncertain digits. */
(function(root,factory){if(typeof module==='object' && module.exports)module.exports=factory();else root.PhotoList=factory();})(typeof window==='object'?window:this,function(){
  'use strict';
  function parse(lines,type){
    const rows=[],unread=[];
    lines.forEach(line=>{
      const text=String(line.text||'').trim();if(!text)return;
      const expression=/(?:^|\s)(\d{1,6})\s*(?:[-=.:]\s*|\s+)([0-9OolI?]{1,8})(?=\s|$)/g;
      let match,found=false,end=0;
      while((match=expression.exec(text))){
        if(/\d/.test(text.slice(end,match.index)))unread.push(text.slice(end,match.index).trim());
        const number=match[2],qty=Number(match[1]);
        const valid=(type==='CHANCE'?/^\d{2}$/:/^\d{4}$/).test(number) && qty>0 && qty<=2147483647;
        rows.push({numero:number,cantidad:match[1],original:match[0].trim(),dudoso:!valid || line.confidence==null || line.confidence<.9});
        found=true;end=expression.lastIndex;
      }
      if(!found || /\d/.test(text.slice(end)))unread.push(found?text.slice(end).trim():text);
    });
    return {rows:rows.slice(0,1000),unread:unread.slice(0,1000),truncated:rows.length>1000};
  }
  function draft(rows,type,price){
    if(!['CHANCE','BILLETE'].includes(type))throw Error('Selecciona chances o billetes.');
    if(!rows.length || rows.length>1000)throw Error('Agrega entre 1 y 1000 filas.');
    if(!Number.isFinite(price)||price<0)throw Error('El precio actual no es válido.');
    const grouped=new Map();let units=0;
    rows.forEach((row,index)=>{
      const number=String(row.numero).trim(),quantity=String(row.cantidad).trim();
      if(!(type==='CHANCE'?/^\d{2}$/:/^\d{4}$/).test(number))throw Error('Revisa el número de la fila '+(index+1)+'. Debe tener '+(type==='CHANCE'?2:4)+' dígitos.');
      const qty=Number(quantity);
      if(!/^\d+$/.test(quantity)||!Number.isSafeInteger(qty)||qty<1||qty>2147483647)throw Error('Revisa la cantidad de la fila '+(index+1)+'.');
      const sum=(grouped.get(number)||0)+qty;if(sum>2147483647)throw Error('Cantidad acumulada demasiado grande para '+number+'.');
      grouped.set(number,sum);units+=qty;
    });
    const items=Array.from(grouped,([number,qty])=>({number,qty,price,total:Math.round(qty*price*100)/100}));
    return {items,units,duplicates:rows.length-items.length,total:items.reduce((sum,r)=>sum+r.total,0)};
  }
  return {parse,draft};
});
