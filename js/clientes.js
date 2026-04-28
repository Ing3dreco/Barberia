import { db, state } from "./supabase.js";
import { byId, toast, renderDetalle, renderLista, mostrarTab } from "./ui.js";

export async function cargarClientes() {
  const { data, error } = await db
    .from('clientes')
    .select('*')
    .eq('user_id', state.user.id)
    .order('nombre');

  if (error) {
    toast('Error cargando clientes');
    return;
  }

  state.clientes = data || [];
  renderLista();
}

export function buscar(q) {
  const dd = byId('dd');

  if (q.length < 2) {
    dd.classList.remove('show');
    dd.innerHTML = '';
    return;
  }

  const res = state.clientes
    .filter(c => c.nombre.toLowerCase().includes(q.toLowerCase()))
    .slice(0, 6);

  if (!res.length) {
    dd.innerHTML = '<div class="item" style="color:var(--muted)">Sin resultados</div>';
    dd.classList.add('show');
    return;
  }

  dd.innerHTML = res.map(c => {
    const ciclo  = c.cortes_acumulados % state.META;
    const premio = ciclo === 0 && c.cortes_acumulados > 0;
    return `
      <div class="item" onclick="window.__clientes.seleccionar('${c.id}')">
        <span>${c.nombre}</span>
        <span class="muted">${premio ? '🏆' : `${ciclo}/${state.META}`}</span>
      </div>
    `;
  }).join('');

  dd.classList.add('show');
}

export function seleccionar(id) {
  state.activo = state.clientes.find(x => x.id === id);
  byId('dd').classList.remove('show');
  byId('q').value = state.activo.nombre;
  renderDetalle();
}

export async function crear() {
  const nombre   = byId('n-nombre').value.trim();
  const telefono = byId('n-tel').value.trim();

  if (!nombre) { toast('El nombre es requerido'); return; }

  const btn = document.querySelector('#panel-nuevo .btn');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const { data, error } = await db
    .from('clientes')
    .insert([{
      user_id:            state.user.id,
      nombre,
      telefono:           telefono || null,
      cortes_acumulados:  0,         // ✅ empieza en 0, no en 1
      premios_canjeados:  0
    }])
    .select()
    .single();

  btn.disabled = false;
  btn.textContent = 'Crear Cliente';

  if (error) { toast('Error al crear el cliente'); return; }

  state.clientes.push(data);
  state.clientes.sort((a, b) => a.nombre.localeCompare(b.nombre));

  state.activo = data;

  byId('n-nombre').value = '';
  byId('n-tel').value    = '';

  mostrarTab('clientes');
  renderDetalle();
  renderLista();

  toast(`✅ Cliente ${nombre} creado`);
}

// exponer en window para onclicks inline en HTML
window.__clientes = { seleccionar, buscar, crear };
