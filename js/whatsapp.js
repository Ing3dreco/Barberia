import { state } from "./supabase.js";
import { toast } from "./ui.js";

const E = {
  tijera:  "✂️",
  trofeo:  "🏆",
  barbero: "💈",
  fiesta:  "🎉",
  onda:    "👋",
  corazon: "❤️",
};

export function enviar() {
  const { activo, META } = state;
  if (!activo) return;
  if (!activo.telefono) { toast('Este cliente no tiene teléfono registrado'); return; }

  const ciclo  = activo.cortes_acumulados % META;
  const premio = ciclo === 0 && activo.cortes_acumulados > 0;
  const faltan = META - ciclo;

  let mensaje;

  if (premio) {
    mensaje = [
      `${E.barbero} *Barbería*`,
      '',
      `${E.fiesta} Hola ${activo.nombre}!`,
      '',
      `Tienes un *premio disponible* ${E.trofeo}`,
      `Llevas *${activo.cortes_acumulados} cortes* con nosotros.`,
      '',
      `Ven a reclamarlo cuando quieras ${E.corazon}`,
      `Te esperamos!`,
    ].join('\n');
  } else {
    mensaje = [
      `${E.barbero} *Barbería*`,
      '',
      `Hola ${activo.nombre} ${E.onda}`,
      '',
      `Llevas *${activo.cortes_acumulados} cortes* con nosotros.`,
      `Solo te faltan *${faltan}* para ganar tu proximo premio ${E.trofeo}`,
      '',
      `Te esperamos pronto! ${E.barbero}`,
    ].join('\n');
  }

  const tel    = activo.telefono.replace(/\D/g, '');
  const numero = tel.startsWith('57') ? tel : `57${tel}`;
  const url    = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
}

window.__whatsapp = { enviar };
