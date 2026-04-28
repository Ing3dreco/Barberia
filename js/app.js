import { db } from "./supabase.js";
async function iniciarApp(){
  document.getElementById('view-login').style.display = 'none';
  document.getElementById('view-app').style.display = 'block';

  await cargarClientes();
}

// sesión persistente
(async ()=>{
  const { data:{ session } } = await db.auth.getSession();

  if(session){
    user = session.user;
    iniciarApp();
  }
})();
