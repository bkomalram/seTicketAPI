(function(){
  'use strict';
  const $=id=>document.getElementById(id),dialog=$('photo-import-dialog'),canvas=$('photo-canvas'),context=canvas.getContext('2d'),body=$('photo-rows'),type=$('photo-type'),feedback=$('photo-feedback');
  let image=null,selection=null,start=null,available=false,busy=false,version=0,controller=null,replacement=null,loadedKey='',prepared=null;
  const identity=()=>[localStorage.getItem('choose-game'),localStorage.getItem('sesion-id')].join(':');
  function invalidate(){prepared=null;replacement=null;$('photo-replace').hidden=true;$('photo-reviewed').checked=false;update();}
  function rows(){return Array.from(body.children).map(tr=>({numero:tr.querySelector('[data-number]').value,cantidad:tr.querySelector('[data-quantity]').value}));}
  function draft(){return PhotoList.draft(rows(),type.value,Number(type.value==='CHANCE'?globalChance.price:globalChance.bprice));}
  function update(){
    try{const data=draft();$('photo-summary').textContent=data.items.length+' números · '+data.units+' unidades · Total: '+data.total.toFixed(2)+(data.duplicates?' · '+data.duplicates+' filas repetidas: sus cantidades se sumarán.':'');$('photo-apply').disabled=!$('photo-reviewed').checked||busy;}
    catch(e){$('photo-summary').textContent=body.children.length?e.message:'Todavía no hay números para revisar.';$('photo-apply').disabled=true;}
  }
  function add(row){
    if(body.children.length>=1000){feedback.textContent='Máximo 1000 filas por lista.';return;}
    const tr=document.createElement('tr');
    tr.innerHTML='<td><input data-number aria-label="Número" type="text" inputmode="numeric" maxlength="4"></td><td><input data-quantity aria-label="Cantidad" type="text" inputmode="numeric"></td><td><small></small></td><td><button type="button" class="btn btn-secondary" aria-label="Quitar fila">×</button></td>';
    tr.querySelector('[data-number]').value=row.numero||'';tr.querySelector('[data-quantity]').value=row.cantidad||'';
    tr.classList.toggle('photo-suspect',!!row.dudoso);
    tr.querySelector('small').textContent=(row.dudoso?'Revisar · ':'')+(row.original||'Agregada manualmente');
    tr.querySelector('button').onclick=()=>{tr.remove();invalidate();};
    tr.addEventListener('input',()=>invalidate());body.appendChild(tr);
  }
  function clearSelection(){selection=null;start=null;$('photo-selection').hidden=true;$('photo-crop').disabled=true;}
  function resetReview(){body.replaceChildren();$('photo-unread').hidden=true;feedback.textContent='';invalidate();}
  function setBusy(value){busy=value;['photo-file','photo-type','photo-rotate','photo-restore','photo-add'].forEach(id=>$(id).disabled=value||((id==='photo-rotate'||id==='photo-restore')&&!image));$('photo-analyze').disabled=value||!image||!available;$('photo-crop').disabled=value||!selection;$('photo-analyze').textContent=value?'Leyendo foto…':'Analizar foto';update();}
  function drawOriginal(){const scale=Math.min(1,2400/Math.max(image.naturalWidth,image.naturalHeight));canvas.width=Math.round(image.naturalWidth*scale);canvas.height=Math.round(image.naturalHeight*scale);context.drawImage(image,0,0,canvas.width,canvas.height);canvas.hidden=false;clearSelection();}
  function transformed(){resetReview();version++;clearSelection();}
  function point(e){const rect=canvas.getBoundingClientRect();return {x:Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width)),y:Math.max(0,Math.min(1,(e.clientY-rect.top)/rect.height))};}
  canvas.addEventListener('pointerdown',e=>{if(!image||busy)return;e.preventDefault();start=point(e);canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(!start||busy)return;const p=point(e);selection={x:Math.min(start.x,p.x),y:Math.min(start.y,p.y),w:Math.abs(p.x-start.x),h:Math.abs(p.y-start.y)};
    const box=$('photo-selection');box.hidden=false;Object.assign(box.style,{left:selection.x*100+'%',top:selection.y*100+'%',width:selection.w*100+'%',height:selection.h*100+'%'});
  });
  canvas.addEventListener('pointerup',()=>{start=null;if(selection&&selection.w>.02&&selection.h>.02)$('photo-crop').disabled=false;else clearSelection();});
  canvas.addEventListener('pointercancel',clearSelection);
  $('photo-file').addEventListener('change',async()=>{
    const file=$('photo-file').files[0];version++;resetReview();image=null;canvas.hidden=true;clearSelection();setBusy(false);
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>12*1024*1024){feedback.textContent='Elige una foto JPG, PNG o WebP de hasta 12 MB.';return;}
    const current=version,url=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);if(current!==version)return;if(img.naturalWidth*img.naturalHeight>50000000){feedback.textContent='La foto tiene demasiada resolución. Elige una versión más pequeña.';return;}image=img;drawOriginal();setBusy(false);};
    img.onerror=()=>{URL.revokeObjectURL(url);if(current===version)feedback.textContent='No se pudo abrir la foto. Intenta con otra imagen.';};img.src=url;
  });
  $('photo-rotate').onclick=()=>{if(!image||busy)return;const copy=document.createElement('canvas');copy.width=canvas.width;copy.height=canvas.height;copy.getContext('2d').drawImage(canvas,0,0);canvas.width=copy.height;canvas.height=copy.width;context.translate(canvas.width,0);context.rotate(Math.PI/2);context.drawImage(copy,0,0);context.setTransform(1,0,0,1,0,0);transformed();};
  $('photo-crop').onclick=()=>{if(!selection||busy)return;const copy=document.createElement('canvas');copy.width=Math.max(1,Math.round(selection.w*canvas.width));copy.height=Math.max(1,Math.round(selection.h*canvas.height));copy.getContext('2d').drawImage(canvas,selection.x*canvas.width,selection.y*canvas.height,selection.w*canvas.width,selection.h*canvas.height,0,0,copy.width,copy.height);canvas.width=copy.width;canvas.height=copy.height;context.drawImage(copy,0,0);transformed();};
  $('photo-restore').onclick=()=>{if(!image||busy)return;drawOriginal();transformed();};
  type.onchange=()=>{resetReview();version++;};
  $('photo-add').onclick=()=>{add({});invalidate();};
  $('photo-reviewed').onchange=()=>{replacement=null;$('photo-replace').hidden=true;update();};
  async function checkAvailability(){
    available=false;setBusy(false);
    try{const res=await fetch(api+'importar-foto/estado',{headers:{Authorization:'Bearer '+localStorage.getItem('tokenSSO')}}),data=await res.json();if(!res.ok||!data.exitoso)throw Error();available=data.resultado.disponible;$('photo-availability').textContent=available?'Lectura de fotos disponible. Revisa siempre el resultado antes de pasarlo al ticket.':'La lectura automática está pendiente de activación de Google Cloud Vision. Puedes probar la foto, el recorte y la revisión manual.';}
    catch(e){$('photo-availability').textContent='No se pudo comprobar la lectura de fotos. Revisa tu sesión y vuelve a abrir este panel.';}setBusy(false);
  }
  document.querySelectorAll('[data-open-photo]').forEach(button=>{button.onclick=()=>{loadedKey=identity();invalidate();dialog.showModal();checkAvailability();};});
  function stop(){version++;if(controller)controller.abort();controller=null;setBusy(false);replacement=null;$('photo-replace').hidden=true;}
  $('photo-close').onclick=()=>dialog.close();dialog.addEventListener('close',stop);
  $('photo-analyze').onclick=async()=>{
    if(!image||busy||!available)return;
    const key=identity(),requestVersion=++version;controller=new AbortController();const timeout=setTimeout(()=>controller&&controller.abort(),55000);setBusy(true);feedback.textContent='Leyendo la foto. Esto puede tardar unos segundos.';
    try{
      const imageData=canvas.toDataURL('image/jpeg',.9);
      const response=await fetch(api+'importar-foto',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem('tokenSSO')},body:JSON.stringify({sorteoId:localStorage.getItem('choose-game'),userId:localStorage.getItem('sesion-id'),tipo:type.value,imagen:imageData})});
      const data=await response.json();if(requestVersion!==version||!dialog.open)return;
      if(!response.ok||!data.exitoso)throw Error(typeof data.resultado==='string'?data.resultado:'No se pudo leer la foto.');
      if(key!==identity())throw Error('El sorteo o vendedor cambió. Abre nuevamente el panel.');
      resetReview();loadedKey=key;data.resultado.rows.forEach(add);
      const unread=$('photo-unread');unread.hidden=!data.resultado.unread.length;unread.querySelector('pre').textContent=data.resultado.unread.join('\n');
      feedback.textContent=data.resultado.rows.length?'Compara toda la lista con la foto, incluidas las filas sin interpretar.':'No se reconocieron pares de cantidad y número. Puedes recortar una columna, volver a analizar o agregar filas manualmente.';
      if(data.resultado.truncated)feedback.textContent+=' Se alcanzó el máximo de 1000 filas; divide la lista en varias fotos.';
      update();
    }catch(e){if(requestVersion===version)feedback.textContent=e.name==='AbortError'?'Se canceló la lectura o tardó demasiado. Intenta nuevamente.':e.message;}
    finally{clearTimeout(timeout);if(requestVersion===version){controller=null;setBusy(false);}}
  };
  function apply(data){
    if(loadedKey!==identity()){feedback.textContent='El sorteo o vendedor cambió. Abre nuevamente el panel y revisa la lista.';return;}
    localStorage.removeItem('edit-ticket-number');globalChance.receiptCount=0;bag.items=data.items;bag.calc();
    document.querySelectorAll('#chanceBuilder input').forEach(input=>{const item=data.items.find(i=>i.number===input.name);input.value=item?item.qty:'';});
    ['#btnEditar','#mobile-btn-kit-1',"[name='mobile-edit-ticket']","[name='optional-customer-name-mobile']"].forEach(s=>document.querySelector(s).classList.remove('d-none'));
    ['#btnAceptarEditar','#btnEliminarEditar','#mobile-btn-kit-2'].forEach(s=>document.querySelector(s).classList.add('d-none'));
    ['#noOldTicket',"[name='mobile-edit-ticket']",'#iSingleChance','#iSingleChanceQty','#iBillete','#iBilleteQty'].forEach(s=>document.querySelector(s).value='');
    bag.render();dialog.close();document.querySelectorAll('[data-photo-result]').forEach(p=>{p.textContent='Lista cargada: '+data.items.length+' números. Revisa el ticket antes de vender.';});
  }
  $('photo-apply').onclick=()=>{
    if(!$('photo-reviewed').checked||busy)return;
    try{prepared=draft();if(loadedKey!==identity())throw Error('El sorteo o vendedor cambió. Abre nuevamente el panel.');
      if(bag.items.length||localStorage.getItem('edit-ticket-number')){replacement=prepared;$('photo-replace').hidden=false;}else apply(prepared);
    }catch(e){feedback.textContent=e.message;}
  };
  $('photo-confirm').onclick=()=>{if(replacement&&$('photo-reviewed').checked)apply(draft());};
  $('photo-keep').onclick=()=>{replacement=null;$('photo-replace').hidden=true;feedback.textContent='Se conservó el ticket en preparación.';};
})();
