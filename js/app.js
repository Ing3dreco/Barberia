// ===== PUNTO DE ENTRADA =====
// Este archivo orquesta todos los módulos y arranca la app.
 
import { db, state } from "./supabase.js";
 
// importar todos los módulos para que registren sus handlers en window.*
import "./auth.js";
import "./ui.js";
import "./clientes.js";
import "./cortes.js";
import "./whatsapp.js";
 
import { cargarClientes } from "./clientes.js";
import { byId, mostrarTab } from "./ui.js";
 
// ─── función principal — se llama después de autenticar ─────────
export async function iniciarApp() {
  byId('view-login').style.display = 'none';
  byId('view-app').style.display   = 'block';
 
  mostrarTab('clientes');
  await cargarClientes();
}
 
// ─── sesión persistente — si ya hay sesión activa, entrar directo ─
(async () => {
  const { data: { session } } = await db.auth.getSession();
 
  if (session) {
    state.user = session.user;
    iniciarApp();
  }
})();
