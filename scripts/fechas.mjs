/**
 * fechas.mjs — la fecha en que cambió DE VERDAD cada página.
 *
 * Antes el sitemap ponía a las 283 páginas la fecha del último despliegue,
 * hubieran cambiado o no, y los buscadores y los robots de IA dejan de fiarse
 * de una fecha así. Ahora cada página tiene su fecha en src/data/fechas.json,
 * y de ahí la sacan el sitemap (astro.config.mjs) y el marcado de la página
 * (dateModified, en Base.astro).
 *
 * CÓMO DECIDE
 * Lee la web ya compilada (dist/) y saca la «huella» de cada página: título,
 * descripción y el texto y los enlaces de <main>. Si la huella no cambia, la
 * fecha tampoco. Si cambia, la fecha pasa a ser hoy. Lo de fuera de <main>
 * (cabecera, pie, franja de cierre) no cuenta: es igual en todas las páginas.
 *
 * Una página que todavía no está en fechas.json toma la fecha del último
 * commit de su JSON (src/content/pages/<slug>.json), o la de hoy si es nueva.
 *
 * USO (después de compilar; `npm run todo` ya lo hace):
 *   npm run build && npm run fechas
 * y se sube fechas.json con el commit. Netlify NO lo recalcula: usa el
 * fichero tal cual está en el repositorio, así las fechas no se mueven solas
 * en cada despliegue.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const DIST = 'dist';
const PAGINAS = 'src/content/pages';
const SALIDA = 'src/data/fechas.json';

if (!existsSync(DIST)) {
  console.error('No hay dist/: compila primero (npm run build).');
  process.exit(1);
}

const hoy = (() => {
  const d = new Date();
  const dos = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
})();

// ruta -> fichero JSON del contenido, para la fecha inicial desde git
const jsonDeRuta = {};
for (const f of readdirSync(PAGINAS)) {
  if (!f.endsWith('.json')) continue;
  const { ruta } = JSON.parse(readFileSync(join(PAGINAS, f), 'utf8'));
  if (ruta) jsonDeRuta[ruta] = join(PAGINAS, f);
}

function fechaGit(fichero) {
  if (!fichero) return '';
  try {
    return execFileSync('git', ['log', '-1', '--format=%ad', '--date=short', '--', fichero], { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function* htmls(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmls(p);
    else if (e.name === 'index.html') yield p;
  }
}

function huella(html) {
  const titulo = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
  const descripcion = html.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  let main = html.match(/<main[\s\S]*?<\/main>/)?.[0] || '';
  main = main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ');
  const enlaces = [...main.matchAll(/href="([^"]*)"/g)].map((m) => m[1]).join(' ');
  const texto = main.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return createHash('sha1').update([titulo, descripcion, texto, enlaces].join('\n')).digest('hex');
}

const antes = existsSync(SALIDA) ? JSON.parse(readFileSync(SALIDA, 'utf8')) : {};
const despues = {};
let nuevas = 0;
let cambiadas = 0;

for (const fichero of htmls(DIST)) {
  const carpeta = relative(DIST, fichero).split(sep).slice(0, -1).join('/');
  const ruta = carpeta ? `/${carpeta}/` : '/';
  const h = huella(readFileSync(fichero, 'utf8'));
  const previa = antes[ruta];
  if (!previa) {
    despues[ruta] = { fecha: fechaGit(jsonDeRuta[ruta]) || hoy, huella: h };
    nuevas++;
  } else if (previa.huella !== h) {
    despues[ruta] = { fecha: hoy, huella: h };
    cambiadas++;
  } else {
    despues[ruta] = previa;
  }
}

const ordenado = Object.fromEntries(Object.keys(despues).sort().map((k) => [k, despues[k]]));
writeFileSync(SALIDA, JSON.stringify(ordenado, null, 1) + '\n');
const quitadas = Object.keys(antes).filter((r) => !despues[r]).length;
console.log(`fechas.json: ${Object.keys(ordenado).length} páginas · ${cambiadas} cambiadas hoy · ${nuevas} nuevas · ${quitadas} quitadas`);
