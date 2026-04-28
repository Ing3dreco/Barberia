async function registrarCorte(){
  if(!activo) return;

  const nuevos = activo.cortes_acumulados + 1;

  await db.from('clientes')
    .update({ cortes_acumulados: nuevos })
    .eq('id', activo.id);

  await db.from('cortes').insert([{
    cliente_id: activo.id,
    user_id: user.id
  }]);

  activo.cortes_acumulados = nuevos;

  const i = clientes.findIndex(x => x.id === activo.id);
  if(i >= 0) clientes[i].cortes_acumulados = nuevos;

  renderDetalle();
  renderLista();

  toast('Corte registrado');
}

async function canjear(){
  const n = (activo.premios_canjeados || 0) + 1;

  await db.from('clientes')
    .update({ premios_canjeados: n })
    .eq('id', activo.id);

  activo.premios_canjeados = n;

  renderDetalle();
  renderLista();

  toast('Premio canjeado');
}
