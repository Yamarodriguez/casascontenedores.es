import { aWebp, existe } from './imagenes.js';

/* La foto del héroe es SIEMPRE una FOTO LIMPIA elegida a mano, nunca la de
 * la página.
 *
 * Por qué: la imagen principal de las 256 páginas del sitio es la MISMA
 * plantilla de banner de WordPress, con el texto ya incrustado en el propio
 * archivo ("CASAS CON CONTENEDORES EN MADRID", "PROYECTOS, DISEÑOS Y
 * CONSTRUCCIONES CON CONTENEDORES"...): cambia el nombre de la localidad,
 * no el diseño. Se comprobó una a una y las 256 lo llevan. Puesta de fondo,
 * ese texto se cruza con el titular del héroe y se lee fatal. */
const FOTO_CASAS = '/wp-content/uploads/2022/02/RENDER-3A-1-2048x1152.jpg';
const FOTO_MARITIMOS = '/wp-content/uploads/2021/09/contenedores-maritimos.png';

export const esMaritimos = (ruta) => /^\/contenedor(es)?-maritimo/.test(ruta || '') || ruta === '/comprar-contenedor-sin-estafas/';

/** Paginas de servicios para contenedores: su propio antetitulo y entradilla. */
const SERVICIOS = new Set([
  '/servicios/', '/pintura-contenedores/', '/aislamiento-contenedores/', '/electricidad-contenedores/',
  '/seguridad-contenedores/', '/reparacion-contenedores/', '/transformacion-contenedores/',
  '/traslado-contenedores/', '/tasacion-contenedores/',
]);
export const esServicio = (ruta) => SERVICIOS.has(ruta);

/** Ruta de la foto del héroe para una página (o '' si no está en public/). */
export function fotoHero(ruta) {
  const elegida = (esMaritimos(ruta) || esServicio(ruta)) && existe(FOTO_MARITIMOS) ? FOTO_MARITIMOS : FOTO_CASAS;
  return existe(elegida) ? aWebp(elegida) : '';
}
