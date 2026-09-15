/**
 * Descarga a public/ todas las imagenes /wp-content/uploads/ que referencian
 * los JSON de src/content/pages/, conservando la estructura ano/mes y SIN
 * renombrar nada (estan indexadas en Google Imagenes).
 *
 * Se ejecuta en tu PC, que si tiene salida a prefabricadascasas.es:
 *
 *     node scripts/descargar-imagenes.mjs            (descarga)
 *     node scripts/descargar-imagenes.mjs --ensayo   (solo cuenta)
 *
 * Es idempotente: lo que ya esta descargado no se vuelve a pedir, asi que
 * puedes cortarlo con Ctrl+C y relanzarlo las veces que haga falta.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = path.join(RAIZ, 'public');
const BASE = 'https://casascontenedores.es';

const ensayo = process.argv.includes('--ensayo');
const HILOS = Number(process.argv[process.argv.indexOf('--hilos') + 1]) || 12;

const FIRMAS = [
  [[0xff, 0xd8, 0xff], 'jpg'],
  [[0x89, 0x50, 0x4e, 0x47], 'png'],
  [[0x52, 0x49, 0x46, 0x46], 'webp'],
  [[0x47, 0x49, 0x46, 0x38], 'gif'],
];

function rutasReferenciadas() {
  const dir = path.join(RAIZ, 'src', 'content', 'pages');
  const rutas = new Set();
  const re = /\/wp-content\/uploads\/\d{4}\/\d{2}\/[^\s"'<>)]+?\.(?:jpg|jpeg|png|webp|gif|svg|mp4)/gi;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.json')) continue;
    const crudo = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of crudo.matchAll(re)) rutas.add(m[0]);
  }
  return [...rutas].sort();
}

function firmaOk(buf, ruta) {
  const ext = ruta.split('.').pop().toLowerCase();
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return true;
  return FIRMAS.some(([f]) => f.every((b, i) => buf[i] === b));
}

async function descargar(ruta) {
  const destino = path.join(PUBLICO, ruta.replace(/^\//, ''));
  if (fs.existsSync(destino) && fs.statSync(destino).size > 0) return 'ya';

  const url = BASE + ruta.split('/').map(encodeURIComponent).join('/').replace(/%2F/g, '/');
  for (let intento = 0; intento < 3; intento++) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (migracion casascontenedores.es a Astro)' },
        signal: AbortSignal.timeout(30000),
      });
      if (r.status === 404) return '404';
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const buf = Buffer.from(await r.arrayBuffer());
      if (!buf.length) return 'vacio';
      if (!firmaOk(buf, ruta)) return 'firma';
      fs.mkdirSync(path.dirname(destino), { recursive: true });
      fs.writeFileSync(destino, buf);
      return 'ok';
    } catch {
      await new Promise((r) => setTimeout(r, 800 * (intento + 1)));
    }
  }
  return 'error';
}

const rutas = rutasReferenciadas();
const faltan = rutas.filter((r) => !fs.existsSync(path.join(PUBLICO, r.replace(/^\//, ''))));
console.log(`rutas referenciadas: ${rutas.length}`);
console.log(`ya en public/: ${rutas.length - faltan.length} | por descargar: ${faltan.length}`);

if (ensayo) {
  faltan.slice(0, 10).forEach((r) => console.log('   ', r));
  process.exit(0);
}

const cuenta = {};
const fallos = [];
let hecho = 0;

async function trabajador(cola) {
  while (cola.length) {
    const ruta = cola.pop();
    const res = await descargar(ruta);
    cuenta[res] = (cuenta[res] || 0) + 1;
    if (!['ok', 'ya'].includes(res)) fallos.push(`${res}\t${ruta}`);
    if (++hecho % 100 === 0) console.log(`   ${hecho}/${faltan.length}`);
  }
}

const cola = [...faltan];
await Promise.all(Array.from({ length: HILOS }, () => trabajador(cola)));

console.log('\nRESULTADO:', cuenta);
if (fallos.length) {
  fs.writeFileSync(path.join(RAIZ, 'imagenes-fallidas.txt'), fallos.join('\n'));
  console.log(`fallos anotados en imagenes-fallidas.txt (${fallos.length})`);
  fallos.slice(0, 15).forEach((f) => console.log('   ', f));
} else {
  console.log('sin fallos: estan las', rutas.length);
}
