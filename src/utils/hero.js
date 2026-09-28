import { aWebp, existe } from './imagenes.js';
import servicios from '../data/servicios.json';
import fotos from '../data/imagenes.json';

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

/* Paginas de contenedores maritimos: las que empiezan por /contenedor(es)-
 * maritimo y todas las que llevan el menu de contenedores (tipos, venta,
 * precios, medidas, alquiler, transporte, contenedores-<ciudad>...), que
 * antes salian con el heroe y el cierre de casas. */
export const esMaritimos = (ruta, menu = '') =>
  /^\/contenedor(es)?-maritimo/.test(ruta || '') || ruta === '/comprar-contenedor-sin-estafas/' || menu === 'contenedores-maritimos';

/** Paginas de servicios para contenedores: su propio antetitulo y entradilla. */
const SERVICIOS = new Set([
  '/servicios/', '/pintura-contenedores/', '/aislamiento-contenedores/', '/electricidad-contenedores/',
  '/seguridad-contenedores/', '/reparacion-contenedores/', '/transformacion-contenedores/',
  '/traslado-contenedores/', '/tasacion-contenedores/',
]);
export const esServicio = (ruta) => SERVICIOS.has(ruta);

/* Las paginas de servicio (las 11 de la rejilla de servicios) llevan de fondo
 * la foto de su tarjeta (src/data/servicios.json, fotos sin texto elegidas una
 * a una), salvo las que son un producto sobre fondo blanco: esas, bajo el
 * velo oscuro del heroe, quedan grises, y se quedan con la de siempre. */
const PROPIAS = Object.fromEntries(servicios.tarjetas
  .filter((t) => fotos[t.foto] && !fotos[t.foto].blanco)
  .map((t) => [t.ruta, t]));

/* La foto de casas (el mismo render) en WebP a varios anchos: el navegador
 * baja la que necesita su pantalla (en movil, 40-150 KB en vez de los 320 KB
 * del JPG de 2048 px, que marcaba el LCP en unos 9 s). */
const FOTO_CASAS_LIGERA = '/wp-content/uploads/2022/02/RENDER-3A-1-1024x576.webp';
const VARIANTES_CASAS = [
  ['/wp-content/uploads/2022/02/RENDER-3A-1-768x432.webp', 768],
  [FOTO_CASAS_LIGERA, 1024],
  ['/wp-content/uploads/2022/02/RENDER-3A-1-1536x864.webp', 1536],
  [FOTO_CASAS, 2048],
];
/** El heroe ocupa todo el ancho de la caja de la web (1280 px como mucho). */
export const TAMANOS_HERO = '(max-width: 1280px) 100vw, 1280px';

/** Ruta de la foto del héroe para una página (o '' si no está en public/). */
export function fotoHero(ruta, menu = '') {
  const propia = PROPIAS[ruta];
  if (propia && existe(propia.foto)) return aWebp(propia.foto);
  const elegida = (esMaritimos(ruta, menu) || esServicio(ruta)) && existe(FOTO_MARITIMOS) ? FOTO_MARITIMOS : FOTO_CASAS;
  if (elegida === FOTO_CASAS && existe(FOTO_CASAS_LIGERA)) return FOTO_CASAS_LIGERA;
  return existe(elegida) ? aWebp(elegida) : '';
}

/** srcset de la foto del heroe cuando es la de casas ('' en las demas). */
export function srcsetHero(ruta, menu = '') {
  if (fotoHero(ruta, menu) !== FOTO_CASAS_LIGERA) return '';
  return VARIANTES_CASAS.filter(([u]) => existe(u)).map(([u, w]) => `${u} ${w}w`).join(', ');
}

/** alt y encuadre de la foto propia de una pagina de servicio (o null). */
export function detalleHero(ruta) {
  const propia = PROPIAS[ruta];
  if (!propia || !existe(propia.foto)) return null;
  return {
    alt: propia.alt,
    estilo: [propia.posicion && `object-position:${propia.posicion}`, propia.bordeBlanco && 'transform:scale(1.04)'].filter(Boolean).join(';') || undefined,
  };
}
