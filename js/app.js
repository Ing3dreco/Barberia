import { db, state } from "./supabase.js";

import "./auth.js";
import "./ui.js";
import "./clientes.js";
import "./cortes.js";
import "./whatsapp.js";

import { cargarClientes } from "./clientes.js";
import { byId, mostrarTab, abrirPerfil, renderDetalle } from "./ui.js";

// exponer state en window para acceso desde onclicks inline
window.__state = state;

export async function iniciarApp() {
  byId('view-login').style.display = 'none';
  byId('view-app').style.display   = 'block';
  mostrarTab('clientes');
  await cargarClientes();
}

// actualizar perfil después de registrar corte desde el panel perfil
window.__refreshPerfil = () => {
  if (state.activo) abrirPerfil(state.activo.id);
};

(async () => {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    state.user = session.user;
    iniciarApp();
  }
})();
