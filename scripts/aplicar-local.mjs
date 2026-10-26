/**
 * aplicar-local.mjs — mete en el campo "local" de cada pagina de ciudad los
 * parrafos propios de la localidad (src/utils/local.js los pinta debajo de
 * cada h2). Solo AÑADE ese campo: el resto del JSON no se toca.
 *
 *   node scripts/aplicar-local.mjs <carpeta-de-textos> [--seco]
 *
 * Cada fichero de la carpeta es un objeto
 *   { slug, pagina: "casas" | "maritimos", entrada, h2: { clave: html } }
 * y la clave dice a que h2 va, por su posicion en la pagina (las 76 paginas
 * de ciudad sin ampliacion tienen los mismos h2 en el mismo orden).
 */
import fs from 'node:fs';
import path from 'node:path';

const [, , carpeta, ...flags] = process.argv;
const SECO = flags.includes('--seco');
if (!carpeta) { console.error('uso: node scripts/aplicar-local.mjs <carpeta> [--seco]'); process.exit(1); }

const PAGINAS = path.resolve('src/content/pages');
// clave -> posicion del h2 en la pagina (la 0 es el de la entrada)
const ORDEN = {
  casas: ['', 'modelos', 'precios', 'permisos', 'planos', 'casaHecha', 'ventajas', 'pasos',
    'tiempo', 'fotos', 'interior', 'presupuesto', 'otrosServicios', 'dondeEstamos'],
  maritimos: ['', 'segundaMano', 'medidas', 'precios', 'venta', 'transporte', 'alquiler',
    'presupuesto', 'dondeEstamos', 'otrosServicios'],
};
const rutas = new Set(fs.readdirSync(PAGINAS).map((f) => JSON.parse(fs.readFileSync(path.join(PAGINAS, f), 'utf8')).ruta));

/** Solo p, strong, em y enlaces internos a rutas que existen. */
function sanear(html, avisos) {
  let h = String(html || '').trim();
  h = h.replace(/<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (m, url, texto) => {
    if (url.startsWith('/') && rutas.has(url)) return `<a href="${url}">${texto}</a>`;
    avisos.push(`enlace quitado: ${url}`);
    return texto;
  });
  h = h.replace(/<(?!\/?(p|strong|em|a)\b)[^>]+>/gi, (m) => { avisos.push(`etiqueta quitada: ${m}`); return ''; });
  if (!h.startsWith('<p>')) h = `<p>${h}</p>`;
  return h;
}

function h2De(bloques) {
  const out = [];
  const recorrer = (lista) => {
    for (const e of lista || []) {
      if (!e) continue;
      if (e.t === 'seccion') { for (const c of e.columnas || []) recorrer(c.elementos); continue; }
      if (e.t === 'encabezado' && (e.etiqueta || 'h2') === 'h2') out.push(e.texto);
    }
  };
  recorrer(bloques);
  return out;
}

let hechas = 0;
for (const f of fs.readdirSync(carpeta).filter((x) => x.endsWith('.json')).sort()) {
  const t = JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8'));
  const fichero = path.join(PAGINAS, `${t.pagina === 'maritimos' ? 'contenedores-maritimos-' : ''}${t.slug}.json`);
  if (!fs.existsSync(fichero)) { console.error(`${f}: no existe ${fichero}`); continue; }
  const pagina = JSON.parse(fs.readFileSync(fichero, 'utf8'));
  if (pagina.ampliacion) { console.error(`${f}: ${pagina.ruta} ya tiene ampliacion, se salta`); continue; }
  const h2 = h2De(pagina.bloques);
  const orden = ORDEN[t.pagina];
  const avisos = [];
  const local = { entrada: sanear(t.entrada, avisos), h2: [] };
  for (const [clave, html] of Object.entries(t.h2 || {})) {
    const i = orden.indexOf(clave);
    if (i < 1 || !h2[i]) { avisos.push(`clave sin h2: ${clave}`); continue; }
    local.h2.push({ tras: h2[i], html: sanear(html, avisos) });
  }
  // en el orden de la pagina
  local.h2.sort((a, b) => h2.indexOf(a.tras) - h2.indexOf(b.tras));
  const faltan = orden.slice(1).filter((c) => !(c in (t.h2 || {})));
  if (faltan.length) avisos.push(`faltan: ${faltan.join(', ')}`);
  console.log(`${pagina.ruta}: ${local.h2.length} h2${avisos.length ? ' · ' + avisos.join(' · ') : ''}`);
  if (!SECO) {
    // se escribe a mano al final del fichero para no reformatear el resto
    // (los JSON salen de Python: "0.0", sangria de 1, CRLF). Si ya tenia
    // "local" (va siempre el ultimo), se sustituye.
    let texto = fs.readFileSync(fichero, 'utf8');
    const corte = texto.lastIndexOf(',\r\n "local": ');
    if (corte >= 0) texto = texto.slice(0, corte) + '\r\n}\r\n';
    const bloque = JSON.stringify(local, null, 1).replace(/\n/g, '\r\n ');
    texto = texto.replace(/\r?\n}\s*$/, `,\r\n "local": ${bloque}\r\n}\r\n`);
    JSON.parse(texto);
    fs.writeFileSync(fichero, texto);
  }
  hechas++;
}
console.log(`${SECO ? '[en seco] ' : ''}paginas: ${hechas}`);
