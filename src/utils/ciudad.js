/**
 * ciudad.js — los titulos de seccion de las paginas de ciudad nombran la
 * ciudad.
 *
 * En las 207 paginas de localidad (casas y contenedores maritimos) habia unos
 * pocos h2 de seccion iguales en todas y sin la ciudad ("Modelos de casas de
 * contenedores", "Ventajas de las casas de Contenedores", "Casa contenedor:
 * Preguntas frecuentes"...). El propietario pidio que la nombren, y SOLO
 * esos: las tarjetas de modelos, las ventajas, las tarjetas de servicios y
 * las preguntas una a una se quedan como estan (meter la ciudad en sesenta
 * encabezados mas seria relleno).
 *
 * La tabla esta en src/data/ciudad-encabezados.json, por familia (casas /
 * maritimos), con {L} en el sitio de la localidad. Se aplica al pintar sobre
 * el arbol ya completo (incluidos los bloques que anade comunes.js), asi que
 * una ciudad nueva lo recibe sola. El nombre es el mismo que usa el cierre
 * ("¿Quieres una casa contenedor en Lugo?"): src/utils/localidades.js.
 */
import tabla from '../data/ciudad-encabezados.json';
import { planoDe } from './renombres.js';

const clave = (t) => planoDe(t).toLowerCase();

const MAPAS = Object.fromEntries(['casas', 'maritimos'].map((f) =>
  [f, new Map(Object.entries(tabla[f] || {}).map(([k, v]) => [clave(k), v]))]));

/** El rotulo con la localidad puesta (mayuscula inicial: algun nombre del
 *  menu de WordPress venia en minuscula). */
export const conLocalidad = (plantilla, localidad) =>
  plantilla.replace('{L}', localidad.charAt(0).toUpperCase() + localidad.slice(1));

/**
 * Renombra en su sitio los h2 de la tabla. `maritimo` elige la familia.
 * Devuelve cuantos ha cambiado; sin localidad no toca nada.
 */
export function nombrarCiudad(bloques, { localidad = '', maritimo = false } = {}) {
  if (!localidad) return 0;
  const mapa = MAPAS[maritimo ? 'maritimos' : 'casas'];
  let n = 0;
  const recorrer = (lista) => {
    for (const e of lista || []) {
      if (!e) continue;
      if (e.t === 'seccion') { for (const c of e.columnas || []) recorrer(c.elementos); continue; }
      if (e.t !== 'encabezado' || (e.etiqueta || 'h2') !== 'h2') continue;
      const nuevo = mapa.get(clave(e.texto));
      if (!nuevo) continue;
      // el original se guarda, como hace renombres.js
      e.textoOriginal ??= e.texto;
      e.texto = conLocalidad(nuevo, localidad);
      n++;
    }
  };
  recorrer(bloques);
  return n;
}
