function enviarWhatsApp(cliente, cortes) {

  if (!cliente.telefono) return;

  const meta = 10;

  const faltan = meta - (cortes % meta);

  const mensaje = `✂️ BarberLeal

Hola ${cliente.nombre},

Llevas ${cortes} cortes acumulados.

Te faltan ${faltan} para tu corte GRATIS 🏆

Te esperamos.`;

  const url = `https://wa.me/57${cliente.telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
}
