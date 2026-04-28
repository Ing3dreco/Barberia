import { db, state } from "./supabase.js";
import { byId, toast } from "./ui.js";

export async function login() {
  const email = byId('email').value.trim();
  const pass  = byId('pass').value;
  const errEl = byId('login-error');

  errEl.textContent = '';

  if (!email || !pass) {
    errEl.textContent = 'Ingresa correo y contraseña';
    return;
  }

  const btn = byId('btn-login');
  btn.disabled = true;
  btn.textContent = 'Ingresando…';

  const { data, error } = await db.auth.signInWithPassword({ email, password: pass });

  if (error) {
    // si no existe, crear cuenta automáticamente
    const { data: reg, error: regErr } = await db.auth.signUp({ email, password: pass });

    if (regErr) {
      errEl.textContent = regErr.message || 'Error al iniciar sesión';
      btn.disabled = false;
      btn.textContent = 'Entrar';
      return;
    }

    // Supabase requiere confirmar email antes de iniciar sesión
    if (reg.user && !reg.session) {
      errEl.textContent = 'Revisa tu correo para confirmar la cuenta.';
      btn.disabled = false;
      btn.textContent = 'Entrar';
      return;
    }

    state.user = reg.user;
  } else {
    state.user = data.user;
  }

  // importar e iniciar la app
  const { iniciarApp } = await import("./app.js");
  iniciarApp();
}

export async function logout() {
  await db.auth.signOut();
  location.reload();
}

// exponer en window para onclick en HTML
window.__auth = { login, logout };
