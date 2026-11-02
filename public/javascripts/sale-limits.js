/* Limits disable entry after recorded sales; loaded tickets are preserved. */
(function () {
  'use strict';
  const dialog = document.getElementById('sale-limit-dialog');
  const userSelect = document.getElementById('limit-user');
  const feedback = document.getElementById('limit-feedback');
  const rows = document.getElementById('limit-exceptions');
  const status = document.getElementById('sale-limit-status');
  let state = null, key = '', loading = false, panelGame = null, panelVersion = 0;
  const identity = () => [localStorage.getItem('choose-game'),localStorage.getItem('sesion-id'),localStorage.getItem('edit-ticket-number') || ''];
  const headers = () => ({'Content-Type':'application/json',Authorization:'Bearer ' + localStorage.getItem('tokenSSO')});
  async function request(url, options) {
    const response = await fetch(url,Object.assign({headers:headers()},options));
    const data = await response.json();
    if (!response.ok || !data.exitoso) throw Error(typeof data.resultado === 'string' ? data.resultado : 'No se pudieron cargar los límites.');
    return data.resultado;
  }
  function available(number) {
    if (!state) return null;
    const tipo = number.length === 2 ? 'CHANCE' : 'BILLETE';
    const config = state.configuration;
    const e = config.exceptions.find(e => e.tipo === tipo && e.numero === number);
    const max = e ? e.maximo : config[tipo === 'CHANCE' ? 'chance' : 'billete'];
    return max === null ? null : Math.max(0,max - Number(state.sold[tipo + ':' + number] || 0));
  }
  function paint() {
    document.querySelectorAll('#chanceBuilder input').forEach(input => {
      const remaining = available(input.name);
      input.disabled = !!state && remaining === 0;
      input.classList.toggle('limit-exhausted',input.disabled);
      input.removeAttribute('max');
      input.title = remaining === null ? 'Sin límite configurado' : 'Disponible: ' + remaining;
    });
    [['#iSingleChance','#iSingleChanceQty'],['#iBillete','#iBilleteQty'],['[name="mobile-filler-number"]','[name="mobile-filler-qty"]']].forEach(pair => {
      const numberInput=document.querySelector(pair[0]), qtyInput=document.querySelector(pair[1]);
      if(!numberInput || !qtyInput)return;
      const remaining=available(numberInput.value);
      qtyInput.disabled=!!state && remaining===0;
      qtyInput.title=remaining===null?'Sin límite configurado':'Disponible: '+remaining;
      qtyInput.removeAttribute('max');
    });
    if (!state) return;
    const blocked = Array.from(document.querySelectorAll('#chanceBuilder input')).filter(i => i.disabled).length;
    status.textContent = blocked ? blocked + ' chances sin cupo para nuevas entradas.' : '';
    status.classList.remove('limit-status-blocked');
  }
  async function refresh(force) {
    const ids = identity(), current = ids.join(':');
    if (!ids[0] || !ids[1] || loading) return;
    if (current !== key) {state=null;key=current;paint();}
    loading=true;
    try {
      const data = await request('/limites?sorteoId=' + encodeURIComponent(ids[0]) + '&userId=' + encodeURIComponent(ids[1]));
      if (identity().join(':') !== current) return;
      state=data; paint();
      document.querySelectorAll('[data-open-limits]').forEach(button => {button.hidden=!data.canManage;});
    } catch(e) {status.textContent='No se pudieron actualizar los cupos. Intenta actualizar la página.';}
    finally {loading=false;}
  }
  // Reloading and editing a ticket never filters or changes its lines.
  const render = bag.render;
  bag.render = function () { const result=render.apply(this,arguments);paint();return result; };
  function addException(value) {
    const row=document.createElement('div');row.className='limit-exception';
    row.innerHTML='<select aria-label="Tipo de excepción"><option value="CHANCE">Chance</option><option value="BILLETE">Billete</option></select><input aria-label="Número de excepción" placeholder="Número" inputmode="numeric" required pattern="[0-9]{1,4}" maxlength="4"><input aria-label="Máximo de excepción" placeholder="Máximo" type="number" min="0" max="2147483647" step="1" required><button class="btn btn-secondary" type="button" aria-label="Quitar excepción">Quitar</button>';
    if(value){row.children[0].value=value.tipo;row.children[1].value=value.numero;row.children[2].value=value.maximo;}
    row.children[3].onclick=()=>row.remove();rows.appendChild(row);
  }
  async function loadPanel(userId, users) {
    const version=++panelVersion;
    document.getElementById('limit-save').disabled=true;
    feedback.textContent='Cargando límites…';
    try {
      const data=await request('/limites?sorteoId='+encodeURIComponent(panelGame)+'&userId='+encodeURIComponent(userId));
      if(version!==panelVersion || !dialog.open)return;
      if(!data.canManage)throw Error('No tienes permisos para configurar estos límites.');
      if(users){userSelect.replaceChildren();data.users.forEach(u=>{const o=document.createElement('option');o.value=u.id;o.textContent=u.nombre;userSelect.appendChild(o);});userSelect.value=userId;}
      document.getElementById('limit-chance').value=data.configuration.chance===null?'':data.configuration.chance;
      document.getElementById('limit-billete').value=data.configuration.billete===null?'':data.configuration.billete;
      rows.replaceChildren();data.configuration.exceptions.forEach(addException);
      feedback.textContent='';document.getElementById('limit-save').disabled=false;
    }catch(e){feedback.textContent=e.message;}
  }
  const openPanel=()=>{
    panelGame=localStorage.getItem('choose-game');
    if(!panelGame){status.textContent='Selecciona un sorteo antes de configurar los límites.';return;}
    document.getElementById('limit-draw').textContent='Sorteo #'+panelGame;
    dialog.showModal();loadPanel(localStorage.getItem('sesion-id'),true);
  };
  document.querySelectorAll('[data-open-limits]').forEach(button => {button.onclick=openPanel;});
  userSelect.onchange=()=>loadPanel(userSelect.value,false);
  document.getElementById('limit-add').onclick=()=>addException();
  document.getElementById('limit-cancel').onclick=()=>dialog.close();
  document.getElementById('sale-limit-form').onsubmit=async e=>{
    e.preventDefault();document.getElementById('limit-save').disabled=true;userSelect.disabled=true;
    const exceptions=Array.from(rows.children).map(row=>({tipo:row.children[0].value,numero:row.children[1].value,maximo:row.children[2].value}));
    try {
      await request('/limites',{method:'PUT',body:JSON.stringify({sorteoId:panelGame,userId:userSelect.value,configuration:{chance:document.getElementById('limit-chance').value,billete:document.getElementById('limit-billete').value,exceptions}})});
      feedback.textContent='Límites guardados. Las ventas existentes cuentan para el cupo.';await refresh(true);
    }catch(error){feedback.textContent=error.message;}
    finally{document.getElementById('limit-save').disabled=false;userSelect.disabled=false;}
  };
  // Count committed sales before disabling new entry. Polling covers other sessions.
  const originalFetch=window.fetch;
  window.fetch=async function(resource,options){
    const response=await originalFetch.apply(this,arguments);
    if(options && options.method==='POST' && /\/tiquete(?:\/mq)?$/.test(String(resource)) && response.ok) {
      const data=await response.clone().json();
      if(data.exitoso) await refresh(true);
    }
    return response;
  };
  document.addEventListener('input',event=>{if(event.target.matches('#iSingleChance,#iBillete,[name=mobile-filler-number]'))paint();});
  window.addEventListener('focus',()=>refresh(true));
  setInterval(()=>{if(!document.hidden)refresh();},10000);
  setInterval(()=>{if(identity().join(':')!==key)refresh();},1000);
  refresh(true);
})();
