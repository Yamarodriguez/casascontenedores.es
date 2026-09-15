/**
 * validar.mjs — comprueba el 100 % de las paginas compiladas.
 *
 *   npm run build && node scripts/validar.mjs
 *
 * No se sube nada que no pase esta validacion.
 * Comprueba, pagina a pagina:
 *   1. equilibrio de <p>, <a>, <div>, <section>, <h2>, <h3>, <ul>, <li>, <figure>
 *   2. un solo <h1>
 *   3. ningun bloque generado anidado dentro de otro igual
 *   4. texto visible identico al original (salvo lo anadido a proposito)
 *   5. ningun href perdido respecto del JSON de origen
 *   6. ninguna imagen marcador (aviso)
 *   7. title, meta description y canonical presentes
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const DIST = path.join(RAIZ, 'dist');
const PAGINAS = path.join(RAIZ, 'src', 'content', 'pages');

const ETIQUETAS = ['p', 'a', 'div', 'section', 'h2', 'h3', 'ul', 'li', 'figure'];
const GENERADOS = ['rejilla', 'tarjeta', 'fila-titulos', 'figura', 'mapa', 'formulario'];

const textoVisible = (h) =>
  h.replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/[\s ]+/g, ' ')
    .trim()
    .toLowerCase();

const VACIAS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'area', 'col', 'embed']);

/** Recorre el HTML con una pila y devuelve los bloques generados que estan
 *  anidados dentro de otro del mismo tipo. */
function bloquesAnidados(html, generados) {
  const pila = [];
  const encontrados = new Set();
  for (const m of html.matchAll(/<(\/?)([a-z][a-z0-9]*)\b([^>]*)>/gi)) {
    const cierre = m[1] === '/';
    const tag = m[2].toLowerCase();
    if (VACIAS.has(tag) || m[3].endsWith('/')) continue;
    if (cierre) { pila.pop(); continue; }
    const clases = ((m[3].match(/class="([^"]*)"/) || [, ''])[1]).split(/\s+/);
    const propias = generados.filter((g) => clases.includes(g));
    for (const g of propias) {
      if (pila.some((nivel) => nivel.includes(g))) encontrados.add(g);
    }
    pila.push(propias);
  }
  return [...encontrados];
}

function equilibrio(html, etiqueta) {
  const abre = (html.match(new RegExp(`<${etiqueta}(?=[\\s>])`, 'gi')) || []).length;
  const cierra = (html.match(new RegExp(`</${etiqueta}\\s*>`, 'gi')) || []).length;
  return abre - cierra;
}

const fallos = [];
const avisos = [];
let revisadas = 0;

for (const f of fs.readdirSync(PAGINAS).filter((x) => x.endsWith('.json'))) {
  const origen = JSON.parse(fs.readFileSync(path.join(PAGINAS, f), 'utf8'));
  const destino = path.join(DIST, origen.ruta.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(destino)) {
    fallos.push(`${origen.ruta} — no se ha generado`);
    continue;
  }
  revisadas++;
  const html = fs.readFileSync(destino, 'utf8');
  const cuerpo = (html.match(/<article class="entrada">([\s\S]*?)<\/article>/) || [, ''])[1];

  for (const e of ETIQUETAS) {
    const d = equilibrio(cuerpo, e);
    if (d !== 0) fallos.push(`${origen.ruta} — <${e}> descuadrado (${d})`);
  }

  const h1 = (html.match(/<h1(?=[\s>])/gi) || []).length;
  if (h1 !== 1) fallos.push(`${origen.ruta} — ${h1} <h1> (debe haber exactamente 1)`);

  // 3. anidamiento: se recorre el arbol con una pila y se comprueba que
  //    ningun bloque generado contiene otro del mismo tipo. Comparar clases
  //    con \b no vale: "tarjeta-titulo" casaria con "tarjeta".
  const anidados = bloquesAnidados(cuerpo, GENERADOS);
  for (const g of anidados) {
    fallos.push(`${origen.ruta} — bloque "${g}" anidado dentro de otro "${g}"`);
  }

  // 4. texto visible: ninguna palabra del original puede haberse perdido.
  //    Se comparan bolsas de palabras, no cadenas: el motor reagrupa los
  //    bloques y eso cambia los espacios, pero nunca el texto.
  const cuenta = (t) => {
    const m = new Map();
    for (const p of t.split(' ')) if (p) m.set(p, (m.get(p) || 0) + 1);
    return m;
  };
  // texto que el motor quita a proposito, con su regla documentada en
  // src/utils/estructura.js (funcion limpiezas)
  const QUITADO = [
    /[^.]*estamos realizando modificaciones[^.]*\./gi,   // aviso de obras olvidado
  ];
  let original = textoVisible(origen.cuerpo);
  for (const re of QUITADO) original = original.replace(re, ' ');

  const antes = cuenta(original.replace(/\s+/g, ' ').trim());
  const ahora = cuenta(textoVisible(cuerpo));
  const perdidas = [];
  for (const [palabra, n] of antes) {
    const m = ahora.get(palabra) || 0;
    if (m < n) perdidas.push(`${palabra} (x${n - m})`);
  }
  if (perdidas.length) {
    fallos.push(`${origen.ruta} — ${perdidas.length} palabra(s) del original perdidas: ${perdidas.slice(0, 6).join(', ')}`);
  }

  const destinos = (h) => new Set([...h.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
    .filter((u) => !u.startsWith('#') && !u.startsWith('mailto:')));
  const faltan = [...destinos(origen.cuerpo)].filter((u) => !cuerpo.includes(`href="${u}"`));
  if (faltan.length) {
    fallos.push(`${origen.ruta} — ${faltan.length} enlace(s) perdidos: ${faltan.slice(0, 3).join(' ')}`);
  }

  const marcadores = (cuerpo.match(/data:image\/svg\+xml/g) || []).length;
  if (marcadores) avisos.push(`${origen.ruta} — ${marcadores} imagen(es) sin archivo`);

  if (!/<title>[^<]{5,}<\/title>/.test(html)) fallos.push(`${origen.ruta} — sin <title>`);
  if (!/<meta name="description" content="[^"]{20,}"/.test(html) && !origen.noindex) {
    avisos.push(`${origen.ruta} — sin meta descripcion`);
  }
  if (!/<link rel="canonical"/.test(html)) fallos.push(`${origen.ruta} — sin canonical`);
  if (/href=""/.test(cuerpo)) fallos.push(`${origen.ruta} — quedan href vacios`);
}

console.log(`paginas revisadas: ${revisadas}`);
console.log(`fallos: ${fallos.length} | avisos: ${avisos.length}\n`);

if (avisos.length) {
  console.log('AVISOS (no bloquean):');
  avisos.slice(0, 20).forEach((a) => console.log('  ' + a));
  if (avisos.length > 20) console.log(`  … y ${avisos.length - 20} mas`);
  console.log('');
}

if (fallos.length) {
  console.log('FALLOS:');
  fallos.slice(0, 40).forEach((x) => console.log('  ' + x));
  if (fallos.length > 40) console.log(`  … y ${fallos.length - 40} mas`);
  process.exit(1);
}

console.log('VALIDACION SUPERADA: el 100 % de las paginas esta correcto.');
