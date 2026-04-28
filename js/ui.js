import { state } from "./supabase.js";

// ─── helpers ───────────────────────────────────────────────────
export const byId = id => document.getElementById(id);

const TZ = 'America/Bogota';

function formatFecha(isoString) {
  const d = new Date(isoString);
  const label = d.toLocaleDateString('es-CO', {
    timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric'
  });
  const hora = d.toLocaleTimeString('es-CO', {
    timeZone: TZ, hour: '2-digit', minute: '2-digit'
  });
  return `${label} · ${hora}`;
}

let toastTimer = null;
export function toast(msg) {
  const t = byId('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

export function mostrarTab(tab) {
  ['clientes', 'nuevo', 'lista'].forEach(t => {
    byId(`panel-${t}`).style.display = t === tab ? 'block' : 'none';
    byId(`tab-${t}`).classList.toggle('active', t === tab);
  });
  byId('panel-perfil').style.display = 'none';
  if (tab === 'lista') renderLista();
}

// ─── detalle de cliente activo (tab Clientes) ───────────────────
export function renderDetalle() {
  const { activo, META } = state;
  if (!activo) return;

  byId('detalle').style.display = 'block';
  byId('d-nombre').textContent  = activo.nombre;
  byId('d-tel').textContent     = activo.telefono
    ? `📱 ${activo.telefono}`
    : 'Sin teléfono';

  const ciclo  = activo.cortes_acumulados % META;
  const pct    = (ciclo / META) * 100;
  const premio = ciclo === 0 && activo.cortes_acumulados > 0;

  byId('fill').style.width   = pct + '%';
  byId('p-text').textContent = premio
    ? '¡Premio disponible!'
    : `${ciclo} / ${META} cortes`;

  const badge = byId('d-badge');
  badge.innerHTML = premio
    ? '<span class="badge premio">🏆 ¡Premio!</span>'
    : `<span class="badge ok">${activo.cortes_acumulados} total</span>`;

  byId('btn-canjear').disabled = !premio;

  const dots = byId('dots');
  dots.innerHTML = '';
  for (let i = 0; i < META; i++) {
    const on = i < ciclo;
    dots.innerHTML += `<div class="dot ${on ? 'on' : ''}">${on ? '✂️' : ''}</div>`;
  }

  cargarHistorial(activo.id, 'historial');
}

// ─── perfil completo desde la Lista ────────────────────────────
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

  byId('p-nombre').textContent  = cliente.nombre;
  byId('p-avatar').textContent  = cliente.nombre.charAt(0).toUpperCase();
  byId('p-total-num').textContent  = cliente.cortes_acumulados;
  byId('p-premios-num').textContent = cliente.premios_canjeados || 0;
  byId('p-tel').textContent     = cliente.telefono ? `📱 ${cliente.telefono}` : 'Sin teléfono';

  byId('p-badge').innerHTML = premio
    ? '<span class="badge premio">🏆 ¡Premio disponible!</span>'
    : `<span class="badge ok">${ciclo}/${META} en ciclo actual</span>`;

  byId('p-fill').style.width  = pct + '%';
  byId('p-ptext').textContent = premio
    ? '¡Listo para canjear!'
    : `Faltan ${META - ciclo} cortes`;

  const dots = byId('p-dots');
  dots.innerHTML = '';
  for (let i = 0; i < META; i++) {
    const on = i < ciclo;
    dots.innerHTML += `<div class="dot ${on ? 'on' : ''}">${on ? '✂️' : ''}</div>`;
  }

  byId('p-btn-canjear').disabled = !premio;

  cargarHistorial(cliente.id, 'p-historial');
}

export function volverALista() {
  byId('panel-perfil').style.display = 'none';
  byId('panel-lista').style.display  = 'block';
}

// ─── historial compartido ───────────────────────────────────────
async function cargarHistorial(clienteId, elId) {
  const { db } = await import("./supabase.js");
  const { data } = await db
    .from('cortes')
    .select('fecha')
    .eq('cliente_id', clienteId)
    .order('fecha', { ascending: false })
    .limit(20);

  const hist = byId(elId);
  if (!data || data.length === 0) {
    hist.innerHTML = '<div class="t-empty">Sin cortes registrados aún</div>';
    return;
  }

  hist.innerHTML = data.map((c, i) => `
    <div class="t-item">
      <span>✂️ Corte #${data.length - i}</span>
      <span class="muted">${formatFecha(c.fecha)}</span>
    </div>
  `).join('');
}

// ─── lista de todos los clientes ───────────────────────────────
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
            : `<span class="muted">${ciclo}/${META}</span>`
          }
        </div>
      </div>
    `;
  }).join('');
}

window.__ui = { mostrarTab, abrirPerfil, volverALista };
