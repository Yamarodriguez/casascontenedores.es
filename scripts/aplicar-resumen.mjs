/**
 * aplicar-resumen.mjs — mete el recuadro «En resumen» (campo "resumen") en
 * las paginas clave. Solo AÑADE ese campo al final del JSON; el resto no se
 * toca ni se reformatea.
 *
 *   node scripts/aplicar-resumen.mjs <carpeta> [--seco]
 *
 * Cada fichero: { slug, respuesta, datos: [..], enlace: { texto, destino },
 * fuentes: [..] }. Antes de escribir comprueba que cada cifra de la
 * respuesta y de los datos ya esta en la pagina, que cada fuente es una frase
 * literal de la pagina y que el enlace va a una ruta que existe; si algo
 * falla, esa pagina no se toca.
 */
import fs from 'node:fs';
import path from 'node:path';

const [, , carpeta, ...flags] = process.argv;
const SECO = flags.includes('--seco');
if (!carpeta) { console.error('uso: node scripts/aplicar-resumen.mjs <carpeta> [--seco]'); process.exit(1); }

const PAGINAS = path.resolve('src/content/pages');
const rutas = new Set(fs.readdirSync(PAGINAS).map((f) => JSON.parse(fs.readFileSync(path.join(PAGINAS, f), 'utf8')).ruta));
const plano = (t) => String(t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '').replace(/&#0?39;/g, "'")
  .replace(/[«»“”"]/g, '').replace(/\s+/g, ' ').replace(/ ([,.;:)])/g, '$1').trim().toLowerCase();
const soloStrong = (t) => String(t).replace(/<(?!\/?strong>)[^>]+>/g, '').trim();

let bien = 0, mal = 0;
for (const f of fs.readdirSync(carpeta).filter((x) => x.endsWith('.json')).sort()) {
  const r = JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8'));
  const fichero = path.join(PAGINAS, `${r.slug}.json`);
  if (!fs.existsSync(fichero)) { console.error(`${f}: no existe la pagina ${r.slug}`); mal++; continue; }
  const texto = fs.readFileSync(fichero, 'utf8');
  const pagina = JSON.parse(texto);
  // todo el texto de la pagina: cada cadena por separado (sin las comillas ni
  // los escapes de JSON.stringify), y las celdas de tabla separadas
  const cadenas = [];
  const recoger = (v) => {
    if (typeof v === 'string') cadenas.push(v.replace(/<\/t[dh]>/gi, ' | '));
    else if (Array.isArray(v)) v.forEach(recoger);
    else if (v && typeof v === 'object') Object.values(v).forEach(recoger);
  };
  recoger([pagina.tituloSeo, pagina.descripcion, pagina.bloques, pagina.ampliacion, pagina.local]);
  const todo = plano(cadenas.join(' \n '));
  const problemas = [];
  // cada cifra del resumen tiene que estar ya en la pagina
  const nuevo = [r.respuesta, ...(r.datos || [])].map(plano).join(' ');
  for (const n of new Set(nuevo.match(/\d[\d.,]*/g) || [])) {
    if (!todo.includes(n.replace(/[.,]$/, ''))) problemas.push(`cifra que no está en la página: ${n}`);
  }
  // una fuente puede ser una fila de tabla («celda | celda»), una lista
  // («a / b») o un rotulo en negrita con su texto («Duracion: se fija...»):
  // se comprueba cada trozo
  for (const q of r.fuentes || []) {
    const trozos = plano(q).split(/\s*[|/]\s*|:\s+/).map((t) => t.trim()).filter((t) => t.length >= 4 && t !== '—');
    const falta = trozos.filter((t) => !todo.includes(t.slice(0, 60)));
    if (falta.length) problemas.push(`fuente no literal: «${falta[0].slice(0, 70)}»`);
  }
  const destino = r.enlace?.destino || '';
  if (destino && !destino.startsWith('#') && !rutas.has(destino)) problemas.push(`enlace a ruta inexistente: ${destino}`);
  if (problemas.length) { console.log(`${pagina.ruta}: NO se aplica\n  - ${problemas.join('\n  - ')}`); mal++; continue; }

  const resumen = {
    respuesta: soloStrong(r.respuesta),
    datos: (r.datos || []).map(soloStrong),
    ...(destino ? { enlace: { texto: r.enlace.texto, destino } } : {}),
  };
  console.log(`${pagina.ruta}: ok (${resumen.datos.length} datos)`);
  bien++;
  if (SECO) continue;
  // al final del fichero, con su salto de linea y sin reformatear el resto
  const nl = texto.includes('\r\n') ? '\r\n' : '\n';
  let base = texto;
  const corte = base.lastIndexOf(`,${nl} "resumen": `);
  if (corte >= 0) base = base.slice(0, corte) + `${nl}}`;
  const bloque = JSON.stringify(resumen, null, 1).replace(/\n/g, `${nl} `);
  const final = base.replace(/\s*}\s*$/, `,${nl} "resumen": ${bloque}${nl}}`) + (texto.endsWith(nl) ? nl : '');
  JSON.parse(final);
  fs.writeFileSync(fichero, final);
}
console.log(`${SECO ? '[en seco] ' : ''}aplicadas: ${bien} · rechazadas: ${mal}`);
