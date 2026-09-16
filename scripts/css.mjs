/**
 * css.mjs — prepara las hojas de estilo originales para el sitio estatico.
 *
 *   node scripts/css.mjs            junta y limpia
 *   node scripts/css.mjs --crudo    junta sin limpiar (para comparar)
 *
 * De donde sale cada cosa:
 *   css-original/comunes/   hojas del tema, de Elementor y del personalizador
 *   css-original/paginas/   una por pagina, escrita por el propio Elementor
 * Las baja scripts/descargar-css.mjs del sitio en vivo.
 *
 * Que hace:
 *   1. Junta las comunes en public/css/comunes.css, en el mismo orden en que
 *      las cargaba la web (el orden importa: gana la ultima).
 *   2. Copia cada hoja de pagina a public/css/post-ID.css.
 *   3. Quita las reglas que ninguna pagina usa. La web original cargaba ~900 KB
 *      de CSS de plugins de los que se usaba una minima parte; aqui se queda
 *      solo lo que aparece de verdad en el HTML compilado.
 *
 * La limpieza necesita dist/ compilado: se ejecuta DESPUES de `npm run build`.
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const ORIGEN = path.join(RAIZ, 'css-original');
const DESTINO = path.join(RAIZ, 'public', 'css');
const DIST = path.join(RAIZ, 'dist');
const crudo = process.argv.includes('--crudo');

if (!fs.existsSync(ORIGEN)) {
  console.error('falta css-original/ — ejecuta antes scripts/descargar-css.mjs');
  process.exit(1);
}

/* ------------------------------------------------- 1. recoger lo que se usa */

/** Clases, ids y etiquetas que aparecen en el HTML compilado. */
function vocabulario() {
  const clases = new Set();
  const ids = new Set();
  const etiquetas = new Set();
  const recorrer = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { recorrer(p); continue; }
      if (!e.name.endsWith('.html')) continue;
      const html = fs.readFileSync(p, 'utf8');
      for (const m of html.matchAll(/class="([^"]*)"/g)) {
        for (const c of m[1].split(/\s+/)) if (c) clases.add(c);
      }
      for (const m of html.matchAll(/\sid="([^"]*)"/g)) ids.add(m[1]);
      for (const m of html.matchAll(/<([a-z][a-z0-9]*)[\s>]/g)) etiquetas.add(m[1]);
    }
  };
  if (fs.existsSync(DIST)) recorrer(DIST);
  return { clases, ids, etiquetas };
}

/* -------------------------------------------------- 2. trocear y filtrar CSS */

/** Parte una hoja en reglas de primer nivel, respetando @media y @supports. */
function trocear(css) {
  const trozos = [];
  let i = 0;
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  while (i < css.length) {
    const llave = css.indexOf('{', i);
    if (llave === -1) break;
    const cabeza = css.slice(i, llave).trim();
    let prof = 1;
    let j = llave + 1;
    while (j < css.length && prof > 0) {
      if (css[j] === '{') prof++;
      else if (css[j] === '}') prof--;
      j++;
    }
    trozos.push({ cabeza, cuerpo: css.slice(llave + 1, j - 1), fin: j });
    i = j;
  }
  return trozos;
}

const SIEMPRE = /^@(font-face|import|charset|keyframes|-webkit-keyframes|page|counter-style|property|layer)/i;

/** ¿Este selector puede llegar a aplicar en alguna de las páginas? */
function seUsa(selector, voc) {
  // se mira cada parte por separado; basta con que una valga
  return selector.split(',').some((parte) => {
    const clases = [...parte.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    const ids = [...parte.matchAll(/#(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]);
    if (clases.some((c) => !voc.clases.has(c))) return false;
    if (ids.some((x) => !voc.ids.has(x))) return false;
    if (!clases.length && !ids.length) {
      // selector solo de etiquetas: vale si alguna aparece
      const tags = [...parte.matchAll(/(^|[\s>+~(])([a-z][a-z0-9]*)/g)].map((m) => m[2]);
      if (tags.length && !tags.some((t) => voc.etiquetas.has(t))) return false;
    }
    return true;
  });
}

function limpiar(css, voc) {
  const salida = [];
  for (const { cabeza, cuerpo } of trocear(css)) {
    if (!cabeza) continue;
    if (SIEMPRE.test(cabeza)) { salida.push(`${cabeza}{${cuerpo}}`); continue; }
    if (cabeza.startsWith('@')) {
      const dentro = limpiar(cuerpo, voc);
      if (dentro.trim()) salida.push(`${cabeza}{${dentro}}`);
      continue;
    }
    if (seUsa(cabeza, voc)) salida.push(`${cabeza}{${cuerpo}}`);
  }
  return salida.join('\n');
}

/* ------------------------------------------------------------- 3. construir */

fs.rmSync(DESTINO, { recursive: true, force: true });
fs.mkdirSync(DESTINO, { recursive: true });

const voc = crudo ? null : vocabulario();
if (voc) {
  console.log(`vocabulario del sitio: ${voc.clases.size} clases, ${voc.ids.size} ids, ${voc.etiquetas.size} etiquetas`);
} else {
  console.log('modo crudo: no se limpia nada');
}

let antes = 0, despues = 0;

const dirComunes = path.join(ORIGEN, 'comunes');
const comunes = fs.existsSync(dirComunes) ? fs.readdirSync(dirComunes).sort() : [];
const juntas = comunes.map((f) => {
  const css = fs.readFileSync(path.join(dirComunes, f), 'utf8');
  antes += css.length;
  const limpio = voc ? limpiar(css, voc) : css;
  return `/* ${f} */\n${limpio}`;
}).join('\n');
fs.writeFileSync(path.join(DESTINO, 'comunes.css'), juntas);
despues += juntas.length;
console.log(`comunes.css  ${comunes.length} hojas  ${Math.round(juntas.length / 1024)} KB`);

const dirPaginas = path.join(ORIGEN, 'paginas');
let n = 0;
if (fs.existsSync(dirPaginas)) {
  for (const f of fs.readdirSync(dirPaginas)) {
    if (!f.endsWith('.css')) continue;
    const css = fs.readFileSync(path.join(dirPaginas, f), 'utf8');
    antes += css.length;
    const limpio = voc ? limpiar(css, voc) : css;
    fs.writeFileSync(path.join(DESTINO, f), limpio);
    despues += limpio.length;
    n++;
  }
}
console.log(`hojas de pagina: ${n}`);
console.log(`\ntotal: ${Math.round(antes / 1024)} KB -> ${Math.round(despues / 1024)} KB` +
  (antes ? ` (${Math.round((1 - despues / antes) * 100)} % menos)` : ''));
