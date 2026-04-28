async function login(){
  const email = document.getElementById('email').value;
  const pass = document.getElementById('pass').value;

  let { data, error } = await db.auth.signInWithPassword({ email, password: pass });

  if(error){
    const r = await db.auth.signUp({ email, password: pass });
    if(r.error){ toast('Error al crear cuenta'); return; }
    toast('Cuenta creada, inicia sesión');
    return;
  }

  user = data.user;
  iniciarApp();
}

async function logout(){
  await db.auth.signOut();
  location.reload();
}
