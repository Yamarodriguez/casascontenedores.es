/**
 * Parrafos de cierre de la entrada en las paginas de ciudad: el texto de al
 * lado del formulario "¿Te llamamos?" suele quedarse corto y deja un hueco;
 * el propietario pidio rellenarlo, como en la portada, para que los dos
 * acaben a la misma altura. Se AÑADEN debajo del texto original (que no se
 * toca), cuantos hagan falta en cada pagina (src/data/intro-ciudades.json).
 */
import datos from '../data/intro-ciudades.json';
import datosLibres from '../data/intro-libres.json';

const PRODUCTO = /^(casas?|contenedor(es)?|container(s)?|mar[ií]timos?|con|de|en)\s+/i;
const escapar = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));

/** «Contenedores Barakaldo» -> «Barakaldo» (para las que no estan en el menu). */
function nombreDeTitulo(titulo) {
  let t = String(titulo || '').trim();
  while (PRODUCTO.test(t)) t = t.replace(PRODUCTO, '');
  return t;
}

/** La seccion de entrada (texto + formulario) y su columna de texto. */
function columnaDeEntrada(bloques) {
  const seccion = bloques.slice(0, 4).find((s) => s?.t === 'seccion' && (s.columnas || []).length === 2
    && s.columnas.some((c) => (c.elementos || []).some((e) => e.t === 'formulario')));
  return seccion && seccion.columnas.find((c) => !(c.elementos || []).some((e) => e.t === 'formulario'));
}

/**
 * Paginas nuevas (guias, servicios, modelos por m2: las de seccion "libre"):
 * su entrada es corta y deja un hueco junto al formulario. En vez de añadir
 * texto, se suben a la columna de la entrada las primeras secciones del
 * cuerpo (encabezado + su texto), las justas para llegar a la altura del
 * formulario (src/data/intro-libres.json). Mismo contenido, mismo orden.
 */
export function subirAlIntro(bloques, ruta) {
  const libre = bloques.find((s) => s?.t === 'seccion' && s.libre);
  const col = columnaDeEntrada(bloques);
  if (!libre || !col) return 0;
  const els = libre.columnas?.[0]?.elementos || [];
  const grupos = [];
  for (const e of els) {
    if (e.t === 'encabezado' || !grupos.length) grupos.push([]);
    grupos[grupos.length - 1].push(e);
  }
  // siempre se deja al menos un grupo en el cuerpo
  const n = Math.min(grupos.length - 1, datosLibres.medir ? grupos.length - 1 : Number(datosLibres.grupos[ruta] || 0));
  if (n <= 0) return 0;
  const mover = grupos.slice(0, n).flat();
  libre.columnas[0].elementos = els.filter((e) => !mover.includes(e));
  col.elementos.push(...mover);
  // texto corrido: que los detectores no lo tomen por una lista de ventajas
  col.sinPatrones = true;
  return n;
}

/**
 * Añade los parrafos a la columna de texto de la seccion de entrada (la que
 * comparte fila con el formulario). Devuelve cuantos ha añadido.
 */
export function anadirIntro(bloques, { ruta, localidad, titulo, maritimo }) {
  const plantillas = maritimo ? datos.maritimos : datos.casas;
  const n = Math.min(plantillas.length, datos.medir ? plantillas.length : Number(datos.parrafos[ruta] || 0));
  if (!n) return 0;
  const lugar = localidad || nombreDeTitulo(titulo);
  if (!lugar) return 0;
  const seccion = bloques.slice(0, 4).find((s) => s?.t === 'seccion' && (s.columnas || []).length === 2
    && s.columnas.some((c) => (c.elementos || []).some((e) => e.t === 'formulario')));
  if (!seccion) return 0;
  const col = seccion.columnas.find((c) => !(c.elementos || []).some((e) => e.t === 'formulario'));
  const textos = (col?.elementos || []).filter((e) => e.t === 'texto');
  if (!textos.length) return 0;
  const ultimo = textos[textos.length - 1];
  const { html, id, t, ...estilo } = ultimo;
  const parrafos = plantillas.slice(0, n)
    .map((p, i) => `<p data-intro="${i + 1}">${p.replaceAll('{L}', escapar(lugar))}</p>`).join('');
  col.elementos.splice(col.elementos.indexOf(ultimo) + 1, 0, { t: 'texto', id: 'intro-ciudad', ...estilo, html: parrafos });
  return n;
}
