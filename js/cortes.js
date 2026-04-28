import { db, state } from "./supabase.js";
import { toast, renderDetalle, renderLista } from "./ui.js";

export async function registrarCorte() {
  if (!state.activo) return;

  const nuevos = state.activo.cortes_acumulados + 1;

  // actualizar en BD (dos operaciones paralelas = más rápido)
  const [, corteRes] = await Promise.all([
    db.from('clientes')
      .update({ cortes_acumulados: nuevos })
      .eq('id', state.activo.id),
    db.from('cortes').insert([{
      cliente_id: state.activo.id,
      user_id:    state.user.id
    }])
  ]);

  if (corteRes.error) { toast('Error al registrar corte'); return; }

  // actualizar estado local
  state.activo.cortes_acumulados = nuevos;
  const i = state.clientes.findIndex(x => x.id === state.activo.id);
  if (i >= 0) state.clientes[i].cortes_acumulados = nuevos;

  renderDetalle();
  renderLista();

  // ¿acaba de completar el ciclo?
  if (nuevos % state.META === 0) {
    toast(`🏆 ¡${state.activo.nombre} completó ${state.META} cortes! Premio disponible`);
  } else {
    toast('✂️ Corte registrado');
  }
}

export async function canjear() {
  if (!state.activo) return;

  // verificar que hay un premio disponible
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
  toast(`🎉 Premio #${premios} canjeado para ${state.activo.nombre}`);
}

// exponer en window para onclick en HTML
window.__cortes = { registrarCorte, canjear };
