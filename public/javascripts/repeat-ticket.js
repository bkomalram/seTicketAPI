/* Copy numbers into a new draft; no sale is made by this action. */
(function () {
  'use strict';
  document.querySelectorAll('[data-repeat-ticket]').forEach(panel=>{
    const input=panel.querySelector('input'),load=panel.querySelector('[data-repeat-load]'),message=panel.querySelector('[role=status]'),confirm=panel.querySelector('[data-repeat-confirm]'),cancel=panel.querySelector('[data-repeat-cancel]');
    let pending=null,busy=false;
    const identity=()=>[localStorage.getItem('choose-game'),localStorage.getItem('sesion-id')].join(':');
    function reset(){pending=null;confirm.hidden=true;cancel.hidden=true;}
    function apply(data,key){
      if(identity()!==key){reset();message.textContent='El sorteo o vendedor cambió. Busca el ticket nuevamente.';return;}
      const items=data.registros.map(r=>{
        const price=Number(r.tipo==='CHANCE'?globalChance.price:globalChance.bprice);
        const qty=Number(r.cantidad);
        return {number:String(r.numero),qty,price,total:Math.round(qty*price*100)/100};
      });
      // Reset editing controls so the next sale creates a new ticket.
      localStorage.removeItem('edit-ticket-number');globalChance.receiptCount=0;
      bag.items=items;bag.calc();
      document.querySelectorAll('#chanceBuilder input').forEach(i=>{const item=items.find(r=>r.number===i.name);i.value=item?item.qty:'';});
      ['#btnEditar','#mobile-btn-kit-1',"[name='mobile-edit-ticket']","[name='optional-customer-name-mobile']"].forEach(s=>document.querySelector(s).classList.remove('d-none'));
      ['#btnAceptarEditar','#btnEliminarEditar','#mobile-btn-kit-2'].forEach(s=>document.querySelector(s).classList.add('d-none'));
      ['#noOldTicket',"[name='mobile-edit-ticket']",'#iSingleChance','#iSingleChanceQty','#iBillete','#iBilleteQty'].forEach(s=>document.querySelector(s).value='');
      bag.render();reset();
      message.textContent='Números del ticket #'+data.ticketId+' listos para el sorteo #'+data.sorteoId+'. Revisa el detalle y vende como de costumbre.';
    }
    async function search(){
      if(busy)return;
      reset();
      if(!/^\d+$/.test(input.value.trim()) || Number(input.value)<1){message.textContent='Introduce el número del ticket anterior.';return;}
      const game=localStorage.getItem('choose-game'),user=localStorage.getItem('sesion-id'),key=identity();
      if(!game || !user){message.textContent='Selecciona un sorteo y un vendedor antes de repetir el ticket.';return;}
      busy=true;load.disabled=true;message.textContent='Buscando ticket…';
      try{
        const response=await fetch(api+'tiquete/'+encodeURIComponent(input.value.trim())+'/repetir?sorteoId='+encodeURIComponent(game)+'&userId='+encodeURIComponent(user),{headers:{Authorization:'Bearer '+localStorage.getItem('tokenSSO')}});
        const data=await response.json();
        if(!response.ok || !data.exitoso)throw Error(typeof data.resultado==='string'?data.resultado:'No se pudo recuperar el ticket.');
        if(identity()!==key)throw Error('El sorteo o vendedor cambió. Busca el ticket nuevamente.');
        if(bag.items.length || localStorage.getItem('edit-ticket-number')){
          pending={data:data.resultado,key};message.textContent='Ya tienes un ticket en preparación. ¿Reemplazar sus números por los del ticket #'+data.resultado.ticketId+'?';confirm.hidden=false;cancel.hidden=false;
        }else apply(data.resultado,key);
      }catch(e){message.textContent=e.message;}
      finally{busy=false;load.disabled=false;}
    }
    load.addEventListener('click',search);
    input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();search();}});
    input.addEventListener('input',()=>{reset();message.textContent='';});
    confirm.addEventListener('click',()=>{if(pending)apply(pending.data,pending.key);});
    cancel.addEventListener('click',()=>{reset();message.textContent='Se conservó el ticket en preparación.';});
  });
})();
