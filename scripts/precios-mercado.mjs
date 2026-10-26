/**
 * precios-mercado.mjs — sustituye los precios propios del texto original y de
 * las ampliaciones por los rangos orientativos del mercado (opcion A, pedida
 * por el propietario el 26-10-2026). Las cifras salen de
 * analisis/PRECIOS-REFERENCIA-COMPETENCIA.md.
 *
 * Trabaja sobre el texto de cada JSON de src/content/pages (cuerpo, bloques y
 * ampliacion a la vez, porque la frase es identica en todos). Las frases
 * originales ya no existen tras aplicarlo, asi que se puede ejecutar dos
 * veces sin cambiar nada.
 *   node scripts/precios-mercado.mjs [--seco]
 */
import fs from 'node:fs';
import path from 'node:path';

const seco = process.argv.includes('--seco');
const DIR = path.resolve('src/content/pages');
const REF = 'octubre de 2026';

// [patron, sustitucion]; los patrones son expresiones regulares (flags gu)
const REGLAS = [
  // casas: precio por m2 (bloque comun de unas 200 paginas)
  ['Podrían oscilar entre los(<strong>)? ?600 ?€ y 800 ?€ el metro cuadrado(</strong>)?', `Como referencia, en el mercado español oscilan entre los$1 600 € y 900 € el metro cuadrado$2 en la gama económica y media (${REF})`],
  // /precios/
  ['oscilar entre\\s+600 € y 800 €/m2', `oscilar entre 600 € y 900 €/m² en la gama económica y media del mercado (${REF})`],
  ['Precio: 25\\.400 € a 37\\.400 €', 'Precio de mercado: 53.450 € a 64.000 € (referencia para 45 m²)'],
  ['Precio: 40\\.200 € a 50\\.200 €', 'Precio de mercado: 58.350 € a 69.500 € (referencia para 60 m²)'],
  ['Precio: 57\\.500 € a 65\\.500 €', 'Precio de mercado: 55.000 € a 83.300 € (referencia para 70-75 m²)'],
  ['Precio: 70\\.800 € a 80\\.000 €', 'Precio de mercado: 72.000 € a 98.300 € (referencia para 90 m²)'],
  ['Precio: 88\\.600 € A 100\\.000 €', 'Precio de mercado: 105.000 € a 123.300 € (referencia para 120 m²)'],
  ['Precio; 85\\.000 €', 'Precio de mercado: desde 85.000 €'],
  ['Precio; 90\\.600 €', 'Precio de mercado: 105.000 € a 123.300 € (referencia para 120 m²)'],
  ['Precio; (?:100\\.00|110\\.400|120\\.200) €', 'Precio: según proyecto (en el mercado, de 600 € a 900 €/m² en la gama económica y media)'],
  ['entre los<strong> 1000 €</strong> y <strong>1500 €</strong>', 'entre los<strong> 850 €</strong> y <strong>1.500 €</strong> en el mercado, sin IVA ni transporte'],
  ['costar <strong>1500 €</strong> a <strong>3000 €</strong>', 'costar <strong>1.950 €</strong> a <strong>2.450 €</strong>'],
  ['que puede oscilar entre <strong>400 € o 600 €</strong> por 200km recorridos', 'que, como referencia de mercado, parte de <strong>unos 240 € en tráiler o 340 € con camión grúa</strong>, más IVA, en entregas de hasta 40 km'],
  // /precios-contenedores-maritimos/: lista propia
  ['Contenedor estándar de 6 metros Nuevo: 2\\.500€', 'Contenedor estándar de 6 metros nuevo: 1.950-2.450 €'],
  ['Contenedor estándar de 6 metros usado: 1\\.770€', 'Contenedor estándar de 6 metros usado: 850-1.500 €'],
  ['Contenedor High Cube o extra alto de 6 metros Nuevo: 2\\.600€', 'Contenedor High Cube o extra alto de 6 metros nuevo: desde 2.900 € + IVA'],
  ['Contenedor High Cube o extra alto de 6 metros usado: 1\\.850€', 'Contenedor High Cube o extra alto de 6 metros usado: según disponibilidad'],
  ['Contenedor estándar de 12 metros Nuevo: 4\\.700€', 'Contenedor estándar de 12 metros nuevo: 2.400-3.200 €'],
  ['Contenedor estándar de 12 metros usado: 2\\.400€', 'Contenedor estándar de 12 metros usado: 1.400-2.300 €'],
  ['Contenedor High Cube o extra alto de 12 metros Nuevo: 4\\.800€', 'Contenedor High Cube o extra alto de 12 metros nuevo: 2.600-4.200 €'],
  ['Contenedor High Cube o extra alto de 12 metros usado: 2\\.480€', `Contenedor High Cube o extra alto de 12 metros usado: 1.500-2.300 €</li><li>Precios orientativos del mercado español, sin IVA ni transporte (${REF})`],
  // 20 y 40 pies
  ['los contenedores de 20 pies nuevos podrían oscilar entre los 2,000 y 4,000 euros, mientras que los contenedores usados podrían estar en el rango de 1,000 a 2,500 Euros', `los contenedores de 20 pies nuevos cuestan en el mercado entre 1.950 y 2.450 €, mientras que los usados están entre 850 y 1.500 €, sin IVA ni transporte (${REF})`],
  ['Los contenedores de 40 pies nuevos podrían tener un precio en el rango de 3,000 a 6,000 Euros, mientras que los contenedores usados podrían oscilar entre 1,500 y 3,500 Euros', `Los contenedores de 40 pies nuevos cuestan en el mercado entre 2.400 y 4.200 €, mientras que los usados están entre 1.400 y 2.300 €, sin IVA ni transporte (${REF})`],
  // segunda mano
  ['Ofrecemos containers desde los 600 hasta 4000 euros', `Como referencia, en el mercado español un contenedor usado cuesta entre 850 y 2.300 €, sin IVA ni transporte (${REF}),`],
  // ampliaciones que citaban 600-800 €/m2
  ['de 600 a 800 € el metro cuadrado que damos en', 'de 600 a 900 € el metro cuadrado de la gama económica y media que recogemos en'],
  ['manejamos una horquilla de <strong>entre 600 € y 800 € el metro cuadrado</strong>', 'recogemos como referencia de mercado <strong>entre 600 € y 900 € el metro cuadrado</strong>'],
  ['\\(entre 600 y 800 euros el metro cuadrado\\)', '(entre 600 y 900 euros el metro cuadrado en la gama económica y media)'],
  ['ronda los 600 a 800 €, sin contar', 'ronda en el mercado los 600 a 900 € en la gama económica y media, sin contar'],
  // el resto de ampliaciones citan la cifra de /precios/, que ahora es 600-900
  ['600 € y 800 €', '600 € y 900 €'],
  // precisiones sobre la norma ISO (la 668 fija medidas, no certifica)
  ['esquineras certificadas según la ISO 668', 'esquineras normalizadas por la ISO 1161'],
  ['la resistencia que certifica la norma ISO 668', 'la resistencia estructural original del contenedor'],
];

// /precios/: «Precio estimado: 15.300 € a 24.000 €» sale dos veces seguidas
// (16 m2 y 30 m2), primero en el cuerpo y luego en los bloques
const DOBLE = 'Precio estimado: 15.300 € a 24.000 €';
const DOBLE_NUEVO = ['Precio de mercado: desde 17.500 € (referencia para 15 m²)', 'Precio de mercado: desde 25.500 € (referencia para 30 m²)'];

const recuento = new Map();
let paginas = 0;
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))) {
  const ruta = path.join(DIR, f);
  const antes = fs.readFileSync(ruta, 'utf8');
  let t = antes;
  for (const [patron, nuevo] of REGLAS) {
    t = t.replace(new RegExp(patron, 'gu'), (...m) => { recuento.set(patron, (recuento.get(patron) || 0) + 1); return nuevo.replace(/\$(\d)/g, (_, n) => m[n] || ''); });
  }
  let k = 0;
  t = t.split(DOBLE).reduce((acc, trozo) => acc + DOBLE_NUEVO[k++ % 2] + trozo);
  if (k) recuento.set(DOBLE, (recuento.get(DOBLE) || 0) + k);
  if (t !== antes) { paginas++; if (!seco) fs.writeFileSync(ruta, t); }
}

console.log(`${seco ? '(en seco) ' : ''}paginas con cambios: ${paginas}`);
for (const [patron] of [...REGLAS, [DOBLE]]) console.log(String(recuento.get(patron) || 0).padStart(5), ' ', patron.slice(0, 70));
