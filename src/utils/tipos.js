/**
 * Orden de la rejilla de tipos de contenedor maritimo ("Contenedor 20 Pies",
 * "Contenedor High cube", "Contenedor Refrigerados"...), que sale en 104
 * paginas en dos filas. En WordPress iba mezclado (20, 40, flat rack, open
 * top, high cube | almacenamiento, [ventilados,] refrigerado, open side, dry
 * van); el
 * propietario pidio ordenarlo: primero los estandar y luego los especiales
 * (src/data/orden-tipos.json).
 *
 * Solo se reparte el CONTENIDO de cada celda (titulo, enlace, foto y su alt)
 * en el nuevo orden; cada celda conserva su maquetacion (ancho, fondo,
 * espaciadores, estilo), asi las dos filas siguen iguales. No se quita ni se
 * añade nada: mismos titulos, mismos enlaces, mismas fotos.
 */
import datos from '../data/orden-tipos.json';

const PATRONES = datos.tipos.map((t) => new RegExp(t.patron));
const plano = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Posicion de un titulo en el orden de tipos (-1 si no es un tipo). */
export const rangoTipo = (texto) => PATRONES.findIndex((p) => p.test(plano(texto)));

const CAMPOS_TITULO = ['texto', 'url'];
const CAMPOS_FOTO = ['src', 'alt', 'url', 'srcset', 'titulo'];
const tomar = (e, campos) => Object.fromEntries(campos.filter((c) => c in e).map((c) => [c, e[c]]));
const poner = (e, campos, valores) => { for (const c of campos) delete e[c]; Object.assign(e, valores); };

// una celda de la rejilla: una columna con un solo h3 de tipo y una sola foto
function celda(col) {
  const els = col.elementos || [];
  const titulos = els.filter((e) => e.t === 'encabezado' && e.etiqueta === 'h3' && rangoTipo(e.texto) >= 0);
  const fotos = els.filter((e) => e.t === 'imagen');
  if (titulos.length !== 1 || fotos.length !== 1) return null;
  if (els.some((e) => e.t !== 'espaciador' && e !== titulos[0] && e !== fotos[0])) return null;
  return { titulo: titulos[0], foto: fotos[0] };
}

const soloEspacio = (s) => (s.columnas || []).every((c) => (c.elementos || []).every((e) => e.t === 'espaciador'));

/** Reordena en su sitio las rejillas de tipos de una lista de bloques. */
export function ordenarTipos(bloques) {
  // grupos: filas seguidas (separadas como mucho por secciones de espacio)
  // con 3 o mas celdas de tipo
  const grupos = [];
  let actual = null;
  for (const s of bloques || []) {
    if (s?.t !== 'seccion') { actual = null; continue; }
    const celdas = (s.columnas || []).map(celda).filter(Boolean);
    if (celdas.length >= 3 && celdas.length === (s.columnas || []).length) {
      if (!actual) grupos.push((actual = []));
      actual.push(...celdas);
    } else if (!(actual && soloEspacio(s))) {
      actual = null;
    }
  }
  for (const g of grupos) {
    const contenido = g.map((c) => ({ titulo: tomar(c.titulo, CAMPOS_TITULO), foto: tomar(c.foto, CAMPOS_FOTO), rango: rangoTipo(c.titulo.texto) }));
    const ordenado = contenido.map((x, i) => ({ ...x, i })).sort((a, b) => a.rango - b.rango || a.i - b.i);
    g.forEach((c, i) => { poner(c.titulo, CAMPOS_TITULO, ordenado[i].titulo); poner(c.foto, CAMPOS_FOTO, ordenado[i].foto); });
  }
  return grupos.length;
}
