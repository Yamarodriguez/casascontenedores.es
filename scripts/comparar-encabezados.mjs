/**
 * comparar-encabezados.mjs — compara encabezado a encabezado la web nueva
 * con la web en vivo, pagina por pagina.
 *
 *   npm run build && node scripts/comparar-encabezados.mjs
 *
 * Usa estructura-viva.json (lo genera scripts/descargar-estructura.mjs en el
 * PC del propietario, que si tiene salida a casascontenedores.es).
 *
 * Que se compara: la SECUENCIA DE TEXTOS de los encabezados, en orden.
 * El nivel puede cambiar en un solo caso permitido y documentado: en las 192
 * paginas que hoy no tienen ningun <h1>, el primer encabezado asciende de h2
 * (o h3) a h1. Cualquier otra diferencia se reporta.
 *
 * Lo que la web nueva anade a proposito (formulario, pie, bloques generados)
 * no cuenta como diferencia: solo se exige que NO FALTE nada del original.
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const DIST = path.join(RAIZ, 'dist');
const VIVO = path.join(RAIZ, 'estructura-viva.json');

if (!fs.existsSync(VIVO)) {
  console.error('falta estructura-viva.json — ejecuta antes scripts/descargar-estructura.mjs');
  process.exit(1);
}

const normalizar = (t) =>
  t.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/gi, ' ')
    // comillas y guiones tipograficos: el HTML vivo usa los curvos y el
    // export los rectos. No es una diferencia de estructura.
    .replace(/[\u2018\u2019\u201a\u201b\u2032]/g, "'")
    .replace(/[\u201c\u201d\u201e\u201f\u2033]/g, '"')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/[\s ]+/g, ' ')
    .trim()
    .toLowerCase();

function encabezadosDe(html) {
  // el H1 va en la banda de titulo, fuera de <main>; el resto dentro
  const salida = [];
  const h1 = html.match(/<h1[^>]*class="titulo"[^>]*>([\s\S]*?)<\/h1>/);
  if (h1) salida.push({ nivel: 'h1', texto: normalizar(h1[1]) });
  const cuerpo = (html.match(/<main id="main"[^>]*>([\s\S]*?)<\/main>/) || [, ''])[1];
  for (const m of cuerpo.matchAll(/<(h[123])\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const t = normalizar(m[2]);
    if (t) salida.push({ nivel: m[1].toLowerCase(), texto: t });
  }
  return salida;
}

const vivo = JSON.parse(fs.readFileSync(VIVO, 'utf8'));
const informe = [];
let iguales = 0, conFaltas = 0, revisadas = 0;

for (const [ruta, datos] of Object.entries(vivo)) {
  if (datos.error) continue;
  const destino = path.join(DIST, ruta.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(destino)) {
    informe.push(`${ruta} — no existe en la web nueva`);
    continue;
  }
  revisadas++;

  // La banda de titulo del tema va DENTRO de <main>, asi que su H1 ya viene
  // en `encabezados`. Solo se antepone el de `h1` cuando no esta repetido.
  const enMain = (datos.encabezados || [])
    .map((e) => ({ nivel: e.nivel, texto: normalizar(e.texto) }))
    .filter((e) => e.texto);
  const sueltos = (datos.h1 || [])
    .map((t) => ({ nivel: 'h1', texto: normalizar(t) }))
    .filter((e) => e.texto && !enMain.some((x) => x.texto === e.texto));
  const antes = [...sueltos, ...enMain];

  const ahora = encabezadosDe(fs.readFileSync(destino, 'utf8'));
  const textosAhora = ahora.map((e) => e.texto);

  // 1. ¿falta algun encabezado del original?
  const faltan = antes.filter((e) => !textosAhora.includes(e.texto));

  // 2. ¿se conserva el ORDEN relativo de los que estan?
  //    Se recorre con un puntero, no con indexOf: hay titulos repetidos en la
  //    misma pagina ("Contenedores marítimos" sale en la rejilla y en el pie
  //    de la seccion) y buscar siempre la primera aparicion daba falsos
  //    desordenes.
  const presentes = antes.filter((e) => textosAhora.includes(e.texto));
  let puntero = 0, desordenados = 0;
  for (const e of presentes) {
    const i = textosAhora.indexOf(e.texto, puntero);
    if (i === -1) desordenados++;
    else puntero = i + 1;
  }

  // 3. ¿cambia el nivel de alguno? Se compara por POSICION, no por texto:
  //    hay titulos repetidos y buscarlos por nombre daba falsos cambios.
  //    Solo se permite el ascenso del primer encabezado a h1.
  const cambios = [];
  if (!faltan.length && antes.length === ahora.length) {
    for (let i = 0; i < antes.length; i++) {
      if (antes[i].texto !== ahora[i].texto) continue;
      if (antes[i].nivel === ahora[i].nivel) continue;
      if (i === 0 && ahora[i].nivel === 'h1') continue;
      cambios.push({ ...antes[i], nuevo: ahora[i].nivel });
    }
  }

  if (faltan.length) {
    conFaltas++;
    informe.push(`${ruta} — FALTAN ${faltan.length}: «${faltan[0].texto.slice(0, 60)}»`);
  } else if (desordenados) {
    informe.push(`${ruta} — ${desordenados} encabezado(s) fuera de orden`);
  } else if (cambios.length) {
    informe.push(`${ruta} — ${cambios.length} cambio(s) de nivel: «${cambios[0].texto.slice(0, 50)}» ${cambios[0].nivel} -> ${cambios[0].nuevo}`);
  } else {
    iguales++;
  }
}

console.log(`paginas comparadas: ${revisadas}`);
console.log(`estructura identica: ${iguales}`);
console.log(`con encabezados que faltan: ${conFaltas}`);
console.log(`otras diferencias: ${informe.length - conFaltas}\n`);

if (informe.length) {
  informe.slice(0, 30).forEach((l) => console.log('  ' + l));
  if (informe.length > 30) console.log(`  … y ${informe.length - 30} mas`);
  process.exitCode = 1;
} else {
  console.log('Las 263 paginas tienen los mismos encabezados, en el mismo orden, que la web en vivo.');
}
