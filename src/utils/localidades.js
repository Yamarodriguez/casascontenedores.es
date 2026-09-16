/**
 * localidades.js — de qué localidad habla cada página.
 *
 * Sirve para que la franja de cierre pueda decir «¿Quieres una casa contenedor
 * en Lugo?» en vez de una frase genérica, que es como se busca de verdad.
 *
 * DE DÓNDE SALE EL NOMBRE
 * No se inventa ni se deduce de la palabra clave: se toma del MENÚ de
 * provincias que ya tenía WordPress (src/data/menus.json), donde cada entrada
 * es «Casas Contenedores Valencia» o «Contenedores Marítimos Álava». Se le
 * quita el prefijo del producto y lo que queda es la localidad, escrita como
 * la escribió el propietario, con sus tildes.
 *
 * Un intento anterior sacaba la localidad de la palabra clave con expresiones
 * regulares y producía cosas como «¿Quieres una casa contenedor en contenedores
 * Galicia?». Por eso ahora se usa una tabla y no una adivinanza: si una ruta no
 * está en la tabla, no hay localidad y la franja usa el texto general.
 */
import menus from '../data/menus.json';

/** Palabras del producto que van delante del nombre del sitio. */
const PRODUCTO = new Set([
  'casa', 'casas', 'contenedor', 'contenedores', 'container', 'containers',
  'maritimo', 'maritimos', 'marítimo', 'marítimos', 'vivienda', 'viviendas',
  'prefabricada', 'prefabricadas', 'modular', 'modulares', 'de', 'con', 'en',
]);

const sinTildes = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** «Casas Contenedores Valencia» -> «Valencia» ; «» si no queda nada. */
function quitarProducto(rotulo) {
  const palabras = rotulo.trim().split(/\s+/);
  let i = 0;
  while (i < palabras.length && PRODUCTO.has(sinTildes(palabras[i]))) i++;
  return palabras.slice(i).join(' ').trim();
}

/**
 * Tabla ruta -> localidad, construida una vez a partir de todos los menús.
 * Cuando una misma ruta sale en dos menús, gana el nombre que viene con
 * mayúscula inicial: «Valencia» antes que «valencia».
 */
const TABLA = (() => {
  const t = new Map();
  for (const entradas of Object.values(menus)) {
    for (const e of entradas) {
      // SOLO el submenú de Provincias. Si se recorren todos, entran también
      // «Modelos» y «Otros usos», y /piscina-contenedor/ acababa saludando
      // con «¿Quieres una casa contenedor en Piscina contenedor?».
      if (!/provincia/i.test(e.rotulo || '')) continue;
      for (const h of e.hijos || []) {
        if (!h.url || !h.rotulo) continue;
        const nombre = quitarProducto(h.rotulo);
        if (!nombre) continue;
        const previo = t.get(h.url);
        const mejor = /^[A-ZÁÉÍÓÚÑ]/.test(nombre);
        if (!previo || (mejor && !/^[A-ZÁÉÍÓÚÑ]/.test(previo))) t.set(h.url, nombre);
      }
    }
  }
  return t;
})();

/** Localidad de una ruta, o cadena vacía si esa página no es de localidad. */
export function localidadDe(ruta) {
  return TABLA.get(ruta) || '';
}
