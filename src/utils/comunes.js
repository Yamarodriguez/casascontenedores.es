/**
 * comunes.js — los bloques que la PORTADA tiene y las paginas de localidad
 * no tenian: la rejilla de "Modelos de casas de contenedores" (con los siete
 * modelos por superficie) y las preguntas frecuentes.
 *
 * No se copian 197 veces en los JSON: se leen de la portada en tiempo de
 * compilacion y se anaden a cada pagina de localidad. Asi hay una sola
 * version de la rejilla y de las preguntas, la de la portada.
 *
 * Reglas que se respetan:
 *  - el contenido original de cada pagina NO se toca: solo se ANADE;
 *  - si la pagina ya trae la rejilla, se le completan los modelos que le
 *    falten (casi todas tenian 30, 90 y 120 m2 y ningun otro), sin repetir
 *    los que ya estaban;
 *  - si la pagina ya trae su acordeon de preguntas, las preguntas nuevas
 *    (las locales de la ampliacion) se meten DENTRO de ese acordeon, para
 *    que no haya dos h2 de "Preguntas frecuentes" en la misma pagina.
 */
import portada from '../content/pages/casas-contenedores.json';

const textoDe = (e) => String(e?.texto ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const clonar = (x) => JSON.parse(JSON.stringify(x));

/** Todos los elementos de una lista de bloques, en orden. */
function* elementos(bloques) {
  for (const b of bloques || []) {
    if (b?.t === 'seccion') {
      for (const c of b.columnas || []) yield* elementos(c.elementos);
    } else if (b) yield b;
  }
}

const esEncabezado = (e, re) => e.t === 'encabezado' && re.test(textoDe(e));
const superficieDe = (e) => {
  if (e.t !== 'encabezado') return null;
  const m = textoDe(e).match(/(\d{2,3})\s*m\s*[²2]\b/i);
  return m ? m[1] : null;
};

/* ------------------------------------------------------------- la portada */

const iModelos = portada.bloques.findIndex((s) => [...elementos([s])].some((e) => esEncabezado(e, /^modelos de casas de contenedores/i)));
const i3D = portada.bloques.findIndex((s, i) => i > iModelos && [...elementos([s])].some((e) => esEncabezado(e, /diseñar tu casa contenedor en 3d/i)));
const iFaq = portada.bloques.findIndex((s) => [...elementos([s])].some((e) => esEncabezado(e, /preguntas frecuentes/i)));

/** La rejilla entera de la portada: cabecera + todas las filas de tarjetas. */
const REJILLA = iModelos >= 0 && i3D > iModelos ? portada.bloques.slice(iModelos, i3D) : [];

/** El bloque de preguntas frecuentes de la portada. */
const FAQ = iFaq >= 0 ? portada.bloques[iFaq] : null;

/** Rotulos de superficie de la portada ("Contenedores casas 30 m2"...), con
 *  su texto original, para reutilizarlos en las paginas que los pierdan. */
const ETIQUETAS_M2 = [];
for (const s of REJILLA) {
  for (const c of s.columnas || []) {
    const els = (c.elementos || []).filter((e) => e.t !== 'espaciador' && e.t !== 'separador');
    if (els.length !== 1) continue;
    const m2 = superficieDe(els[0]);
    if (m2) ETIQUETAS_M2.push({ m2, elemento: els[0] });
  }
}

/* --------------------------------------------------------- lo que ya tiene */

export const tieneRejilla = (bloques) => [...elementos(bloques)].some((e) => esEncabezado(e, /^modelos de casas de contenedores/i));

/** Superficies que la pagina ya enseña ("30", "90", "120"). */
export function superficies(bloques) {
  const vistas = new Set();
  for (const e of elementos(bloques)) { const m2 = superficieDe(e); if (m2) vistas.add(m2); }
  return vistas;
}

/** El elemento de texto que lleva el acordeon de preguntas, si lo hay. */
function bloqueFaq(bloques) {
  for (const e of elementos(bloques)) {
    if (e.t === 'texto' && /class="faq-item"/i.test(e.html || '')) return e;
  }
  return null;
}

/** 35 paginas de localidad traen sus preguntas en otro formato: un h2
 *  "Casa contenedor preguntas frecuentes" seguido de parrafos con la pregunta
 *  en negrita. Se localiza ese h2 (fuera de la ampliacion) y la lista de
 *  elementos donde esta, para meter las preguntas nuevas debajo. */
function encabezadoFaq(bloques) {
  for (const s of bloques || []) {
    if (s?.t !== 'seccion' || s.ampliacion) continue;
    for (const c of s.columnas || []) {
      const lista = c.elementos || [];
      const i = lista.findIndex((e) => esEncabezado(e, /preguntas frecuentes/i));
      if (i >= 0) return { lista, i };
      const dentro = encabezadoFaq(lista);
      if (dentro) return dentro;
    }
  }
  return null;
}

export const tieneFaq = (bloques) => Boolean(bloqueFaq(bloques) || encabezadoFaq(bloques));

/* ------------------------------------------------------- lo que se anade */

/** Una fila de tarjetas con los modelos por superficie que falten. */
function filasM2(faltan) {
  const filas = [];
  for (let i = 0; i < faltan.length; i += 4) filas.push(faltan.slice(i, i + 4));
  // una fila de un solo modelo no se pinta como tarjeta: se reparte
  if (filas.length > 1 && filas[filas.length - 1].length === 1) {
    filas[filas.length - 1].unshift(filas[filas.length - 2].pop());
  }
  return filas.map((fila, n) => ({
    t: 'seccion',
    id: `modelos-m2-${n}`,
    columnas: fila.map(({ elemento }, i) => ({
      id: `modelos-m2-${n}-${i}`,
      ancho: 100 / fila.length,
      elementos: [clonar(elemento)],
    })),
  }));
}

/* Tarjetas de tipo de casa ("Casa de un contenedor", "Casas con 2
   Contenedores", "Casa contenedor 40 Pies"...). Una pagina que las tiene
   tiene rejilla de modelos, lleve o no la cabecera de la portada (en
   /precios/ se llama "Modelos casas de contenedores precios", en /planos/
   "Diseños y Modelos de casas de contenedores"...). */
const TIPO = /^casas?\s+(de|con)\s+(un|1|dos|2|tres|3|cuatro|4)\s+contenedor|^casa\s+contenedor\s+[24]0\s+pies|^(single|[1-4])\s+container\s+house|^container\s+house\s+[24]0\s+pies/i;

/* Paginas de ciudad que no estan en el menu de provincias (de ahi sale la
   localidad, ver localidades.js) pero son de localidad igual: reciben la
   rejilla y las preguntas como las demas. */
const CIUDADES_FUERA_DEL_MENU = new Set([
  '/contenedores-barakaldo/', '/contenedores-cornella-de-llobregat/', '/contenedores-las-rozas-de-madrid/',
  '/contenedores-mijas/', '/contenedores-rivas-vaciamadrid/', '/contenedores-san-cugat-del-valles/',
  '/contenedores-san-fernando/', '/contenedores-san-sebastian-de-los-reyes/',
]);
export const esCiudad = (ruta, localidad) => Boolean(localidad) || CIUDADES_FUERA_DEL_MENU.has(ruta);
const esFilaTipos = (s) => [...elementos([s])].some((e) => e.t === 'encabezado' && TIPO.test(textoDe(e)));

/* Una fila de tarjetas de superficie: todas sus columnas son un solo rotulo
   de un modelo que existe. Los rotulos de precio de /precios/ ("Casa
   contendor de 16 m2 precios") no cuentan: 16, 48, 64... no son modelos. */
function filaM2(s, modelosM2) {
  if (s?.t !== 'seccion') return null;
  const vistas = [];
  for (const c of s.columnas || []) {
    const els = (c.elementos || []).filter((e) => e.t !== 'espaciador' && e.t !== 'separador');
    if (els.length !== 1) return null;
    const m2 = superficieDe(els[0]);
    if (!m2 || !modelosM2[m2]) return null;
    vistas.push(m2);
  }
  return vistas.length ? vistas : null;
}

/**
 * Completa la rejilla de modelos con los de la portada:
 *  - si la pagina ya tiene rejilla (tarjetas de tipo), solo los modelos por
 *    superficie que le falten: detras de su fila de superficies si la tiene,
 *    o justo delante de la primera fila de tipos (como en la portada);
 *  - si no tiene rejilla y `completa` es true (paginas de localidad), la
 *    rejilla entera al final.
 * Devuelve cuantos modelos ha anadido.
 */
export function anadirModelos(bloques, modelosM2 = {}, { completa = false } = {}) {
  const disponibles = ETIQUETAS_M2.filter(({ m2 }) => modelosM2[m2]);
  if (!disponibles.length) return 0;

  const hayRejilla = tieneRejilla(bloques) || bloques.some(esFilaTipos);
  if (!hayRejilla) {
    if (!completa) return 0;
    for (const s of REJILLA) bloques.push(clonar(s));
    return disponibles.length;
  }

  const vistas = new Set();
  let trasM2 = -1;
  bloques.forEach((s, i) => { const f = filaM2(s, modelosM2); if (f) { f.forEach((m) => vistas.add(m)); trasM2 = i; } });
  let faltan = disponibles.filter(({ m2 }) => !vistas.has(m2));
  if (!faltan.length) return 0;

  // si la pagina ya tiene su fila de superficies, los que faltan copian su
  // redaccion ("Casas Contenedores 30 m2" -> "Casas Contenedores 15 m2";
  // "Container house 30 m2" -> "Container house 15 m2" en la version inglesa)
  if (trasM2 >= 0) {
    const muestra = [...elementos([bloques[trasM2]])].find((e) => superficieDe(e));
    faltan = faltan.map(({ m2, elemento }) => ({
      m2,
      elemento: { ...clonar(muestra), id: `m2-${m2}`, url: undefined, texto: String(muestra.texto).replace(/\d{2,3}(?=\s*m\s*[²2])/i, m2) },
    }));
  }

  let corte = trasM2 >= 0 ? trasM2 + 1 : bloques.findIndex(esFilaTipos);
  if (corte < 0) {
    const cabecera = bloques.findIndex((s) => [...elementos([s])].some((e) => esEncabezado(e, /^modelos de casas de contenedores/i)));
    if (cabecera < 0) return 0;
    corte = cabecera + 1;
  }
  bloques.splice(corte, 0, ...filasM2(faltan));
  return faltan.length;
}

/**
 * Preguntas frecuentes. Si la pagina ya tiene su acordeon, las preguntas
 * nuevas se anaden DENTRO (un solo h2 por pagina); si no lo tiene, se le pone
 * el de la portada con las preguntas nuevas al principio.
 * `nuevas` son las de la ampliacion: [{ pregunta, respuesta }].
 * Devuelve true si la pagina se queda con un acordeon propio (es decir, si la
 * ampliacion NO debe pintar su propia seccion de preguntas).
 */
export function anadirFaq(bloques, nuevas = [], { conPortada = false } = {}) {
  const enHtml = (items) => items.map(({ pregunta, respuesta }) =>
    `<div class="faq-item"><h3 class="faq-question">${String(pregunta).trim()}</h3>` +
    `<div class="faq-answer">${/^\s*</.test(respuesta) ? respuesta : `<p>${String(respuesta).trim()}</p>`}</div></div>`).join('');

  const propio = bloqueFaq(bloques);
  if (propio) {
    if (nuevas.length) propio.html = enHtml(nuevas) + propio.html;
    return true;
  }
  // preguntas en parrafos bajo su propio h2: las nuevas van justo detras del
  // primer texto que sigue a ese h2, bajo el mismo encabezado
  const h2 = encabezadoFaq(bloques);
  if (h2) {
    if (nuevas.length) {
      const { lista, i } = h2;
      let j = i + 1;
      while (j < lista.length && lista[j].t !== 'texto' && lista[j].t !== 'encabezado') j++;
      const tras = j < lista.length && lista[j].t === 'texto' ? j + 1 : i + 1;
      lista.splice(tras, 0, { t: 'texto', id: 'faq-nuevas', html: enHtml(nuevas) });
    }
    return true;
  }
  if (!conPortada || !FAQ) return false;

  const seccion = clonar(FAQ);
  if (nuevas.length) {
    const texto = [...elementos([seccion])].find((e) => e.t === 'texto' && /class="faq-item"/i.test(e.html || ''));
    if (texto) texto.html = enHtml(nuevas) + texto.html;
  }
  bloques.push(seccion);
  return true;
}
