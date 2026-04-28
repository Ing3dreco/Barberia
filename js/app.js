async function init() {

  const { data } = await db.auth.getSession();

  if (data.session) {
    currentUser = data.session.user;
    await cargarClientes();
  }
}

init();
