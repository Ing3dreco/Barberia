import { state } from "./supabase.js";
import { toast } from "./ui.js";

export function enviar() {
  const { activo, META } = state;

  if (!activo) return;
  if (!activo.telefono) { toast('Este cliente no tiene teléfono registrado'); return; }

  const ciclo  = activo.cortes_acumulados % META;
  const premio = ciclo === 0 && activo.cortes_acumulados > 0;
  const faltan = META - ciclo;

  let mensaje;

  if (premio) {
    mensaje = `✂️ *BarberLeal*

¡Hola ${activo.nombre}! 🎉

Tienes un *premio disponible* 🏆
Llevas ${activo.cortes_acumulados} cortes con nosotros.

¡Ven a reclamarlo cuando quieras!
Te esperamos 💈`;
  } else {
    mensaje = `✂️ *BarberLeal*

Hola ${activo.nombre},

Llevas *${activo.cortes_acumulados} cortes* con nosotros.
Te faltan solo *${faltan}* para ganar tu próximo premio 🏆

¡Te esperamos pronto! 💈`;
  }

  // número colombiano: asegurarse de que empiece con 57
  const tel = activo.telefono.replace(/\D/g, ''); // quitar caracteres no numéricos
  const numero = tel.startsWith('57') ? tel : `57${tel}`;

  const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

// exponer en window para onclick en HTML
window.__whatsapp = { enviar };
