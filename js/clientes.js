let clientes = [];

async function cargarClientes() {
  const { data } = await db
    .from('clientes')
    .select('*')
    .eq('user_id', currentUser.id);

  clientes = data;
}

function buscarCliente() {
  const input = document.getElementById('search-input').value;

  const cliente = clientes.find(c =>
    c.nombre.toLowerCase().includes(input.toLowerCase())
  );

  if (cliente) {
    clienteActivo = cliente;
    renderCliente(cliente);
  }
}
