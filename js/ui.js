import { state } from "./supabase.js";

// ─── helpers ───────────────────────────────────────────────────
export const byId = id => document.getElementById(id);

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
  if (tab === 'lista') renderLista();
}

// ─── detalle de cliente activo ──────────────────────────────────
export function renderDetalle() {
  const { activo, META } = state;
  if (!activo) return;

  byId('detalle').style.display = 'block';
  byId('d-nombre').textContent = activo.nombre;
  byId('d-tel').textContent    = activo.telefono
    ? `📱 ${activo.telefono}`
    : 'Sin teléfono';

  const ciclo = activo.cortes_acumulados % META;
  const pct   = (ciclo / META) * 100;
  const premio = ciclo === 0 && activo.cortes_acumulados > 0;

  // barra de progreso
  byId('fill').style.width = pct + '%';
  byId('p-text').textContent = premio
    ? '¡Premio disponible!'
    : `${ciclo} / ${META} cortes`;

  // badge estado
  const badge = byId('d-badge');
  if (premio) {
    badge.innerHTML = '<span class="badge premio">🏆 ¡Premio!</span>';
  } else {
    badge.innerHTML = `<span class="badge ok">${activo.cortes_acumulados} total</span>`;
  }

  // botón canjear — solo activo si hay premio
  byId('btn-canjear').disabled = !premio;

  // dots
  const dots = byId('dots');
  dots.innerHTML = '';
  for (let i = 0; i < META; i++) {
    const on = i < ciclo;
    dots.innerHTML += `<div class="dot ${on ? 'on' : ''}">${on ? '✂️' : ''}</div>`;
  }

  // historial
  cargarHistorial(activo.id);
}

async function cargarHistorial(clienteId) {
  const { db } = await import("./supabase.js");
  const { data } = await db
    .from('cortes')
    .select('created_at')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
    .limit(15);

  const hist = byId('historial');
  if (!data || data.length === 0) {
    hist.innerHTML = '<div class="t-empty">Sin cortes registrados aún</div>';
    return;
  }

  hist.innerHTML = data.map((c, i) => {
    const fecha = new Date(c.created_at);
    const label = fecha.toLocaleDateString('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
    const hora = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="t-item">
        <span>✂️ Corte #${data.length - i}</span>
        <span class="muted">${label} · ${hora}</span>
      </div>
    `;
  }).join('');
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
      <div class="row" onclick="window.__clientes.seleccionar('${c.id}')">
        <div>${c.nombre}</div>
        <div class="muted">${premio ? '🏆 Premio' : `${ciclo}/${META}`}</div>
      </div>
    `;
  }).join('');
}

// exponer en window para el tab de lista (onclick en HTML)
window.__ui = { mostrarTab };
