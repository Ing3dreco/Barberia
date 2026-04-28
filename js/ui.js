function renderDetalle(){
  if(!activo) return;

  byId('detalle').style.display = 'block';
  byId('d-nombre').innerText = activo.nombre;
  byId('d-tel').innerText = activo.telefono || 'Sin teléfono';

  const ciclo = activo.cortes_acumulados % META;
  const pct = (ciclo / META) * 100;

  byId('fill').style.width = pct + '%';
  byId('p-text').innerText = `${ciclo}/${META}`;

  const dots = byId('dots');
  dots.innerHTML = '';

  for(let i=0;i<META;i++){
    dots.innerHTML += `<div class="dot ${i<ciclo?'on':''}">${i<ciclo?'✂️':''}</div>`;
  }
}

function renderLista(){
  const l = byId('lista');
  l.innerHTML = '';

  clientes.forEach(c=>{
    const ciclo = c.cortes_acumulados % META;

    l.innerHTML += `
      <div class="row" onclick="seleccionar('${c.id}')">
        <div>${c.nombre}</div>
        <div class="muted">${ciclo}/${META}</div>
      </div>
    `;
  });
}

function byId(id){ return document.getElementById(id); }

function toast(msg){
  const t = byId('toast');
  t.innerText = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}
