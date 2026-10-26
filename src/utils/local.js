/**
 * local.js — texto propio de cada localidad debajo de sus h2.
 *
 * Las 76 paginas de ciudad que llegaron el 12/10/2026 (38 de casas y 38 de
 * contenedores maritimos) eran la misma pagina con el nombre cambiado. El
 * propietario pidio diferenciarlas AÑADIENDO informacion propia de cada
 * localidad debajo de cada h2, sin quitar ni cambiar nada (26/10/2026).
 *
 * Los parrafos estan en el campo "local" del JSON de la pagina:
 *
 *   local: {
 *     entrada: "<p>…</p>",                         // debajo de la entrada
 *     h2: [{ tras: "texto ORIGINAL del h2", html: "<p>…</p>" }, …]
 *   }
 *
 * - `entrada` va en una seccion propia justo detras de la de entrada (la del
 *   formulario "¿Te llamamos?"), para no alargar esa columna, que esta medida
 *   a la altura del formulario (intro.js).
 * - Cada `h2` se busca por su texto original (antes de que ciudad.js le ponga
 *   la localidad) y el parrafo se mete despues del texto que ya tiene ese h2
 *   en su columna; si el h2 no tiene texto en su columna, en la columna de al
 *   lado (la del texto); si no hay texto en ninguna, justo debajo del h2.
 *   Toma la alineacion, el color y la letra de ese texto vecino.
 */
import { planoDe } from './renombres.js';

const clave = (t) => planoDe(t).toLowerCase();
const RELLENO = new Set(['espaciador', 'separador']);
const ESTILO = ['alinear', 'alinearMovil', 'color', 'tipo'];

/** Copia del estilo del texto vecino (sin margenes: los pone el ritmo). */
const nuevoTexto = (html, vecino, n) => {
  const e = { t: 'texto', id: `local-${n}`, local: true, html };
  for (const k of ESTILO) if (vecino?.[k] !== undefined) e[k] = vecino[k];
  return e;
};

/** Indice tras el ultimo texto que sigue a `desde` (saltando relleno), o -1. */
function trasSuTexto(els, desde) {
  let i = desde + 1;
  while (i < els.length && RELLENO.has(els[i]?.t)) i++;
  if (els[i]?.t !== 'texto') return -1;
  while (els[i + 1]?.t === 'texto') i++;
  return i;
}

/** Localiza cada h2 de la lista con su columna y su seccion. */
function encabezados(bloques) {
  const out = [];
  const recorrer = (lista, seccion) => {
    for (const e of lista || []) {
      if (!e) continue;
      if (e.t === 'seccion') { for (const c of e.columnas || []) recorrer(c.elementos, e); continue; }
      if (e.t === 'encabezado' && (e.etiqueta || 'h2') === 'h2') out.push({ e, lista, seccion });
    }
  };
  for (const s of bloques) if (s?.t === 'seccion') recorrer([s], null);
  return out;
}

/**
 * Añade el texto local de la pagina. Devuelve cuantos parrafos ha puesto y
 * los h2 que no ha encontrado (para avisar al compilar).
 */
export function anadirLocal(bloques, local) {
  if (!local) return { puestos: 0, perdidos: [] };
  let n = 0;
  const perdidos = [];

  const lista = encabezados(bloques);
  for (const { tras, html } of local.h2 || []) {
    const h = lista.find((x) => clave(x.e.texto) === clave(tras) && !x.usado);
    if (!h) { perdidos.push(tras); continue; }
    h.usado = true;
    const i = h.lista.indexOf(h.e);
    let destino = h.lista;
    let pos = trasSuTexto(h.lista, i);
    if (pos < 0 && h.seccion) {
      // el texto del h2 esta en la columna de al lado
      const otra = (h.seccion.columnas || []).map((c) => c.elementos || [])
        .find((els) => els !== h.lista && els.some((x) => x?.t === 'texto'));
      if (otra) { destino = otra; pos = otra.map((x) => x?.t).lastIndexOf('texto'); }
    }
    if (pos < 0) {
      // sin texto: debajo del h2 (y de su raya, si la lleva)
      pos = i;
      while (destino[pos + 1]?.t === 'separador') pos++;
    }
    destino.splice(pos + 1, 0, nuevoTexto(html, destino[pos]?.t === 'texto' ? destino[pos] : null, ++n));
  }

  if (local.entrada) {
    const i = bloques.findIndex((s) => s?.t === 'seccion'
      && (s.columnas || []).some((c) => (c.elementos || []).some((e) => e.t === 'formulario')));
    bloques.splice(i + 1, 0, {
      t: 'seccion', id: 'local-entrada', libre: true,
      columnas: [{ ancho: 100, elementos: [nuevoTexto(local.entrada, null, ++n)] }],
    });
  }
  return { puestos: n, perdidos };
}
