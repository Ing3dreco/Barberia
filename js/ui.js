function renderCliente(cliente) {
  const div = document.getElementById('cliente');

  div.innerHTML = `
    <h2>${cliente.nombre}</h2>
    <p>Cortes: ${cliente.cortes_acumulados}</p>
  `;
}
