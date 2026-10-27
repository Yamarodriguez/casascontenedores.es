/**
 * directorio.js — las paginas de ciudad nuevas entran en el directorio de
 * localidades.
 *
 * El directorio («Construcciones de casas con contenedores en España» en la
 * portada, y el de /contenedores-maritimos/) es una lista que se escribio a
 * mano en WordPress, repartida en varias columnas. Las paginas de ciudad que
 * se han creado despues (las que declaran "familia" y "localidad" en su JSON:
 * src/utils/paginas.js) no estaban en el menu ni en esa lista, asi que nadie
 * las enlazaba. Aqui se AÑADEN al final de la ultima columna, por orden
 * alfabetico; los enlaces originales no se tocan.
 */
import { fichas } from './paginas.js';

/** ruta del directorio -> familia que lista y rotulo de cada enlace */
const DIRECTORIOS = {
  '/': { familia: 'casas', rotulo: (l) => `Casa contenedores ${l}` },
  '/contenedores-maritimos/': { familia: 'maritimos', rotulo: (l) => `Contenedores ${l}` },
};

const esListaDeEnlaces = (e) => e?.t === 'texto' && /^<ul[^>]*>\s*<li\b[^>]*>\s*<a\b/i.test(String(e.html || '').trim());

/**
 * Busca la seccion del directorio (todas sus columnas son una lista de
 * enlaces) y añade a su ultima lista las ciudades de la familia que faltan.
 * Devuelve cuantos enlaces pone.
 */
export function completarDirectorio(bloques, ruta) {
  const d = DIRECTORIOS[ruta];
  if (!d) return 0;
  const seccion = bloques.find((s) => s?.t === 'seccion' && (s.columnas || []).length >= 2
    && s.columnas.every((c) => (c.elementos || []).some(esListaDeEnlaces)));
  if (!seccion) return 0;
  const listas = seccion.columnas.flatMap((c) => c.elementos.filter(esListaDeEnlaces));
  const enlazadas = new Set(listas.flatMap((e) => [...e.html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])));

  const nuevas = [...fichas()]
    .filter(([r, f]) => f.familia === d.familia && f.localidad && !enlazadas.has(r))
    .sort((a, b) => a[1].localidad.localeCompare(b[1].localidad, 'es'));
  if (!nuevas.length) return 0;
  const items = nuevas.map(([r, f]) => `<li><a href="${r}">${d.rotulo(f.localidad)}</a></li>`).join('');
  const ultima = listas.at(-1);
  ultima.html = ultima.html.replace(/<\/ul>\s*$/i, `${items}</ul>`);
  return nuevas.length;
}
