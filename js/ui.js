import { state } from "./supabase.js";

export const byId = id => document.getElementById(id);

// ─── Zona horaria Colombia ──────────────────────────────────────
// Supabase a veces devuelve fechas sin el sufijo 'Z', lo que hace
// que el navegador las interprete como hora local en vez de UTC.
// Forzamos el sufijo Z para garantizar la conversión correcta.
function parseFecha(str) {
  if (!str) return new Date();
  // si ya tiene zona horaria (+00, Z, etc.) no tocar
  return /Z|[+-]\d{2}:?\d{2}$/.test(str)
    ? new Date(str)
    : new Date(str + 'Z');
}

function formatFecha(str) {
  const d = parseFecha(str);
  const label = d.toLocaleDateString('es-CO', {
    timeZone: 'America/Bogota', day: '2-digit', month: 'short', year: 'numeric'
  });
  const hora = d.toLocaleTimeString('es-CO', {
    timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit'
  });
  return `${label} · ${hora}`;
}

// ─── Toast ──────────────────────────────────────────────────────
let toastTimer = null;
export function toast(msg) {
  const t = byId('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── Tabs ───────────────────────────────────────────────────────
export function mostrarTab(tab) {
  ['clientes', 'nuevo', 'lista'].forEach(t => {
    byId(`panel-${t}`).style.display = t === tab ? 'block' : 'none';
    byId(`tab-${t}`).classList.toggle('active', t === tab);
  });
  byId('panel-perfil').style.display = 'none';
  if (tab === 'lista') renderLista();
}

// ─── Detalle (tab Clientes) ─────────────────────────────────────
export function renderDetalle() {
  const { activo, META } = state;
  if (!activo) return;

  byId('detalle').style.display = 'block';
  byId('d-nombre').textContent  = activo.nombre;
  byId('d-tel').textContent     = activo.telefono ? `📱 ${activo.telefono}` : 'Sin teléfono';

  const ciclo  = activo.cortes_acumulados % META;
  const pct    = (ciclo / META) * 100;
  const premio = ciclo === 0 && activo.cortes_acumulados > 0;

  byId('fill').style.width   = pct + '%';
  byId('p-text').textContent = premio ? '¡Premio disponible!' : `${ciclo} / ${META} cortes`;

  byId('d-badge').innerHTML = premio
    ? '<span class="badge premio">🏆 ¡Premio!</span>'
    : `<span class="badge ok">${activo.cortes_acumulados} total</span>`;

  byId('btn-canjear').disabled = !premio;

  const dots = byId('dots');
  dots.innerHTML = '';
  for (let i = 0; i < META; i++) {
    const on = i < ciclo;
    dots.innerHTML += `<div class="dot ${on ? 'on' : ''}">${on ? '&#9986;' : ''}</div>`;
  }

  cargarHistorial(activo.id, 'historial', false);
}

// ─── Perfil completo (tab Lista) ────────────────────────────────
export function abrirPerfil(id) {
  const cliente = state.clientes.find(x => x.id === id);
  if (!cliente) return;

  state.activo = cliente;
  const { META } = state;
  const ciclo  = cliente.cortes_acumulados % META;
  const pct    = (ciclo / META) * 100;
  const premio = ciclo === 0 && cliente.cortes_acumulados > 0;

  byId('panel-lista').style.display  = 'none';
  byId('panel-perfil').style.display = 'block';

  byId('p-avatar').textContent       = cliente.nombre.charAt(0).toUpperCase();
  byId('p-nombre').textContent       = cliente.nombre;
  byId('p-tel').textContent          = cliente.telefono ? `📱 ${cliente.telefono}` : 'Sin teléfono';
  byId('p-total-num').textContent    = cliente.cortes_acumulados;
  byId('p-premios-num').textContent  = cliente.premios_canjeados || 0;

  byId('p-badge').innerHTML = premio
    ? '<span class="badge premio">🏆 ¡Premio disponible!</span>'
    : `<span class="badge ok">${ciclo}/${META} en ciclo actual</span>`;

  byId('p-fill').style.width  = pct + '%';
  byId('p-ptext').textContent = premio ? '¡Listo para canjear!' : `Faltan ${META - ciclo} cortes`;

  const dots = byId('p-dots');
  dots.innerHTML = '';
  for (let i = 0; i < META; i++) {
    const on = i < ciclo;
    dots.innerHTML += `<div class="dot ${on ? 'on' : ''}">${on ? '&#9986;' : ''}</div>`;
  }

  byId('p-btn-canjear').disabled = !premio;

  // precarga campos de edición
  byId('edit-nombre').value   = cliente.nombre;
  byId('edit-telefono').value = cliente.telefono || '';

  cargarHistorial(cliente.id, 'p-historial', true);
}

export function volverALista() {
  byId('panel-perfil').style.display = 'none';
  byId('panel-lista').style.display  = 'block';
}

// ─── Historial con opción de eliminar cortes ────────────────────
async function cargarHistorial(clienteId, elId, conEliminar) {
  const { db } = await import("./supabase.js");
  const { data } = await db
    .from('cortes')
    .select('id, fecha')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(20);

  const hist = byId(elId);
  if (!data || data.length === 0) {
    hist.innerHTML = '<div class="t-empty">Sin cortes registrados aún</div>';
    return;
  }

  hist.innerHTML = data.map((c, i) => `
    <div class="t-item" id="corte-row-${c.id}">
      <span>&#9986; Corte #${data.length - i}</span>
      <div class="t-right">
        <span class="muted">${formatFecha(c.fecha)}</span>
        ${conEliminar
          ? `<button class="btn-delete" onclick="window.__ui.confirmarEliminarCorte('${c.id}')" title="Eliminar corte">&#10005;</button>`
          : ''}
      </div>
    </div>
  `).join('');
}

// ─── Eliminar corte con confirmación ───────────────────────────
export function confirmarEliminarCorte(corteId) {
  byId('confirm-msg').textContent  = '¿Eliminar este corte del historial?';
  byId('confirm-sub').textContent  = 'Esta acción no se puede deshacer.';
  byId('confirm-ok').onclick       = () => eliminarCorte(corteId);
  byId('modal-confirm').style.display = 'flex';
}

async function eliminarCorte(corteId) {
  cerrarModal();
  const { db } = await import("./supabase.js");

  const { error } = await db.from('cortes').delete().eq('id', corteId);
  if (error) { toast('Error al eliminar el corte'); return; }

  // descontar del contador local
  const nuevos = Math.max(0, state.activo.cortes_acumulados - 1);
  await db.from('clientes').update({ cortes_acumulados: nuevos }).eq('id', state.activo.id);

  state.activo.cortes_acumulados = nuevos;
  const i = state.clientes.findIndex(x => x.id === state.activo.id);
  if (i >= 0) state.clientes[i].cortes_acumulados = nuevos;

  toast('Corte eliminado');
  abrirPerfil(state.activo.id);
}

// ─── Editar cliente ─────────────────────────────────────────────
export function toggleEdicion(abrir) {
  byId('perfil-view').style.display = abrir ? 'none' : 'block';
  byId('perfil-edit').style.display = abrir ? 'block' : 'none';
}

export async function guardarEdicion() {
  const nombre   = byId('edit-nombre').value.trim();
  const telefono = byId('edit-telefono').value.trim();

  if (!nombre) { toast('El nombre es requerido'); return; }

  const btn = byId('btn-guardar-edit');
  btn.disabled = true;
  btn.textContent = 'Guardando…';

  const { db } = await import("./supabase.js");
  const { error } = await db
    .from('clientes')
    .update({ nombre, telefono: telefono || null })
    .eq('id', state.activo.id);

  btn.disabled = false;
  btn.textContent = 'Guardar cambios';

  if (error) { toast('Error al guardar'); return; }

  state.activo.nombre   = nombre;
  state.activo.telefono = telefono || null;
  const i = state.clientes.findIndex(x => x.id === state.activo.id);
  if (i >= 0) {
    state.clientes[i].nombre   = nombre;
    state.clientes[i].telefono = telefono || null;
  }

  toggleEdicion(false);
  abrirPerfil(state.activo.id);
  toast('Cliente actualizado');
}

// ─── Eliminar cliente ───────────────────────────────────────────
export function confirmarEliminarCliente() {
  byId('confirm-msg').textContent  = `¿Eliminar a ${state.activo.nombre}?`;
  byId('confirm-sub').textContent  = 'Se borrarán todos sus cortes. Esta acción no se puede deshacer.';
  byId('confirm-ok').onclick       = eliminarCliente;
  byId('modal-confirm').style.display = 'flex';
}

async function eliminarCliente() {
  cerrarModal();
  const { db } = await import("./supabase.js");

  // Supabase borrará los cortes automáticamente si tienes ON DELETE CASCADE
  // Si no, primero borramos los cortes manualmente:
  await db.from('cortes').delete().eq('cliente_id', state.activo.id);
  const { error } = await db.from('clientes').delete().eq('id', state.activo.id);

  if (error) { toast('Error al eliminar cliente'); return; }

  state.clientes = state.clientes.filter(x => x.id !== state.activo.id);
  state.activo   = null;

  toast('Cliente eliminado');
  volverALista();
  renderLista();
}

// ─── Modal de confirmación ──────────────────────────────────────
export function cerrarModal() {
  byId('modal-confirm').style.display = 'none';
}

// ─── Lista ──────────────────────────────────────────────────────
export function renderLista() {
  const { clientes, META } = state;
  const l = byId('lista');

  if (!clientes.length) {
    l.innerHTML = '<div class="row-empty">No hay clientes registrados</div>';
    return;
  }

  l.innerHTML = clientes.map(c => {
    const ciclo  = c.cortes_acumulados % META;
    const premio = ciclo === 0 && c.cortes_acumulados > 0;
    return `
      <div class="row" onclick="window.__ui.abrirPerfil('${c.id}')">
        <div class="row-info">
          <div class="row-nombre">${c.nombre}</div>
          <div class="muted">${c.telefono || 'Sin teléfono'}</div>
        </div>
        <div class="row-right">
          ${premio
            ? '<span class="badge premio">🏆 Premio</span>'
            : `<span class="muted">${ciclo}/${META}</span>`}
        </div>
      </div>
    `;
  }).join('');
}

window.__ui = {
  mostrarTab, abrirPerfil, volverALista,
  confirmarEliminarCorte, confirmarEliminarCliente,
  toggleEdicion, guardarEdicion, cerrarModal
};
