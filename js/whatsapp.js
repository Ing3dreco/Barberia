function enviarWhatsApp(){
  if(!activo?.telefono) return toast('Sin teléfono');

  const ciclo = activo.cortes_acumulados % META;
  const faltan = ciclo === 0 ? 0 : META - ciclo;

  const mensaje = `✂️ BarberLeal

Hola ${activo.nombre},

Llevas ${activo.cortes_acumulados} cortes.
Te faltan ${faltan} para tu premio 🏆

Te esperamos.`;

  const url = `https://wa.me/57${activo.telefono}?text=${encodeURIComponent(mensaje)}`;

  window.open(url, '_blank');
}
