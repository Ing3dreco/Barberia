async function login(email, password) {
  const { data, error } = await db.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error(error);
    return;
  }

  currentUser = data.user;
}
