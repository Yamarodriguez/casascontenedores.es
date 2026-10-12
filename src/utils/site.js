/**
 * site.js — los datos del negocio que usan varios componentes, montados en un
 * solo sitio a partir de src/data/site.json. Si cambia el telefono, el texto
 * de WhatsApp, el logo o la pagina de presupuesto, se cambia en site.json y
 * llega a toda la web.
 */
import site from '../data/site.json';

/** Enlace a WhatsApp con el mensaje de saludo de site.json. */
export const WHATSAPP = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappTexto || '')}`;

/** Ruta de la pagina de presupuesto (destino de los botones "Pedir presupuesto"). */
export const PRESUPUESTO = site.presupuesto;

/** Ruta del logo (cabecera y pie). */
export const LOGO = site.logo;
