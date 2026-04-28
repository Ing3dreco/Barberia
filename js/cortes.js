async function registrarCorte() {
  if (!clienteActivo) return;

  const nuevosCortes = clienteActivo.cortes_acumulados + 1;

  // actualizar cliente
  await db.from('clientes')
    .update({ cortes_acumulados: nuevosCortes })
    .eq('id', clienteActivo.id);

  // 🔥 HISTORIAL
  await db.from('cortes').insert([{
    cliente_id: clienteActivo.id,
    user_id: currentUser.id,
    fecha: new Date().toISOString()
  }]);

  clienteActivo.cortes_acumulados = nuevosCortes;

  // WhatsApp
  enviarWhatsApp(clienteActivo, nuevosCortes);

  renderCliente(clienteActivo);
}
