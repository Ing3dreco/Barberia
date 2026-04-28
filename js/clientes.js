async function cargarClientes(){
  const { data } = await db
    .from('clientes')
    .select('*')
    .eq('user_id', user.id)
    .order('nombre');

  clientes = data || [];
  renderLista();
}

function buscar(q){
  const dd = byId('dd');

  if(q.length < 2){
    dd.classList.remove('show');
    dd.innerHTML = '';
    return;
  }

  const res = clientes.filter(c =>
    c.nombre.toLowerCase().includes(q.toLowerCase())
  ).slice(0,6);

  dd.innerHTML = res.map(c => `
    <div class="item" onclick="seleccionar('${c.id}')">
      <span>${c.nombre}</span>
      <span class="muted">${c.cortes_acumulados}</span>
    </div>
  `).join('');

  dd.classList.add('show');
}

function seleccionar(id){
  activo = clientes.find(x => x.id === id);
  byId('dd').classList.remove('show');
  byId('q').value = activo.nombre;
  renderDetalle();
}

async function crear(){
  const nombre = byId('n-nombre').value.trim();
  const telefono = byId('n-tel').value.trim();

  if(!nombre){ toast('Nombre requerido'); return; }

  const { data, error } = await db.from('clientes').insert([{
    user_id: user.id,
    nombre,
    telefono,
    cortes_acumulados: 1,
    premios_canjeados: 0
  }]).select().single();

  if(error){ toast('Error'); return; }

  clientes.push(data);
  clientes.sort((a,b)=>a.nombre.localeCompare(b.nombre));

  activo = data;

  byId('nuevo').style.display = 'none';
  byId('n-nombre').value = '';
  byId('n-tel').value = '';

  renderDetalle();
  renderLista();

  toast('Cliente creado');
}
