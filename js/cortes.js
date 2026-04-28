import { db, state } from "./supabase.js";
import { toast, renderDetalle, renderLista, abrirPerfil } from "./ui.js";

export async function registrarCorte() {
  if (!state.activo) return;

  const nuevos = state.activo.cortes_acumulados + 1;

  const [, corteRes] = await Promise.all([
    db.from('clientes').update({ cortes_acumulados: nuevos }).eq('id', state.activo.id),
    db.from('cortes').insert([{ cliente_id: state.activo.id, user_id: state.user.id }])
  ]);

  if (corteRes.error) { toast('Error al registrar corte'); return; }

  state.activo.cortes_acumulados = nuevos;
  const i = state.clientes.findIndex(x => x.id === state.activo.id);
  if (i >= 0) state.clientes[i].cortes_acumulados = nuevos;

  renderDetalle();
  renderLista();

  if (nuevos % state.META === 0) {
    toast(`¡${state.activo.nombre} completó ${state.META} cortes! Premio disponible`);
  } else {
    toast('Corte registrado');
  }
}

// Versión para el panel de perfil — refresca la vista de perfil después
export async function registrarCorteYRefrescar() {
  await registrarCorte();
  if (state.activo) abrirPerfil(state.activo.id);
}

export async function canjear() {
  if (!state.activo) return;

  const ciclo = state.activo.cortes_acumulados % state.META;
  if (ciclo !== 0 || state.activo.cortes_acumulados === 0) {
    toast('No hay premio disponible aún');
    return;
  }

  const premios = (state.activo.premios_canjeados || 0) + 1;
  const { error } = await db
    .from('clientes')
    .update({ premios_canjeados: premios })
    .eq('id', state.activo.id);

  if (error) { toast('Error al canjear'); return; }

  state.activo.premios_canjeados = premios;
  const i = state.clientes.findIndex(x => x.id === state.activo.id);
  if (i >= 0) state.clientes[i].premios_canjeados = premios;

  renderDetalle();
  renderLista();
  if (state.activo) abrirPerfil(state.activo.id);
  toast(`Premio #${premios} canjeado para ${state.activo.nombre}`);
}

window.__cortes = { registrarCorte, registrarCorteYRefrescar, canjear };
