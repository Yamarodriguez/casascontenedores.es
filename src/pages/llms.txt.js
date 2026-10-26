/**
 * /llms.txt — resumen de la web para los robots de inteligencia artificial
 * (formato de llmstxt.org): qué es la web y cuáles son sus páginas, con una
 * línea de cada una.
 *
 * Se genera solo en cada compilación a partir de los menús de WordPress
 * (src/data/menus.json) y de los JSON de las páginas, así que una página
 * nueva aparece sin tocar este fichero. No lleva ningún dato que no esté ya
 * en la web.
 */
import site from '../data/site.json';
import menus from '../data/menus.json';
import modelosM2 from '../data/modelos-m2.json';

const paginas = Object.values(import.meta.glob('../content/pages/*.json', { eager: true }))
  .map((m) => m.default || m)
  .filter((p) => p.ruta && !p.noindex);
const porRuta = Object.fromEntries(paginas.map((p) => [p.ruta, p]));

// las descripciones heredadas de WordPress traen ✅ y comas sueltas
const limpiar = (t = '') => t
  .replace(/[✅✔⭐\u{1F300}-\u{1FAFF}]/gu, '')
  .replace(/\s+,/g, ',')
  .replace(/,\s*$/, '')
  .replace(/\s+/g, ' ')
  .trim();

const usadas = new Set();
function linea(ruta, { conDescripcion = true } = {}) {
  const p = porRuta[ruta];
  if (!p || usadas.has(ruta)) return null;
  usadas.add(ruta);
  const desc = conDescripcion ? limpiar(p.descripcion) : '';
  return `- [${limpiar(p.titulo)}](${site.dominio}${ruta})${desc ? `: ${desc}` : ''}`;
}
const bloque = (titulo, rutas, opciones) => {
  const lineas = rutas.map((r) => linea(r, opciones)).filter(Boolean);
  return lineas.length ? `## ${titulo}\n\n${lineas.join('\n')}\n` : '';
};

const hijos = (menu, url) => (menus[menu].find((i) => i.url === url)?.hijos || []).map((h) => h.url);
const provincias = (menu) => menus[menu].filter((i) => i.url === '#').flatMap((i) => (i.hijos || []).map((h) => h.url));
const SERVICIOS = ['/servicios/', ...hijos('menu-principal', '/servicios/')];
const MARITIMOS = menus['contenedores-maritimos']
  .filter((i) => i.url !== '#' && i.url !== '/servicios/')
  .flatMap((i) => [i.url, ...(i.url === '/tipos-de-contenedores/' ? (i.hijos || []).map((h) => h.url) : [])]);
const fueraDeCasas = new Set([...SERVICIOS, ...MARITIMOS, '/contenedores-maritimos/']);

const CASAS = [
  '/',
  ...menus['menu-principal']
    .filter((i) => i.url !== '#' && i.url !== '/servicios/')
    .flatMap((i) => [i.url, ...(i.url === '/modelos/' ? [...(i.hijos || []).map((h) => h.url), ...Object.values(modelosM2).map((m) => m.url)] : [])]),
  ...menus['menu-2'].filter((i) => i.url !== '#').map((i) => i.url),
].filter((r) => !fueraDeCasas.has(r) || r === '/');

export function GET() {
  const partes = [
    `# ${site.nombre}`,
    `> ${site.descripcion} Web en español para quien quiere construir una casa con contenedores marítimos, o comprar, alquilar o transformar un contenedor, en cualquier provincia de España.`,
    [
      `- Empresa: ${site.nombre}, con sede en Valencia (España). Trabaja en toda España.`,
      `- Contacto: ${site.email} · WhatsApp +${site.whatsapp}`,
      `- Presupuesto: ${site.dominio}/presupuesto-casas-contenedores/`,
      `- Mapa completo de la web: ${site.dominio}/sitemap-index.xml`,
    ].join('\n'),
    bloque('Casas contenedores: precios, modelos, permisos y planos', CASAS),
    bloque('Contenedores marítimos: venta, alquiler, tipos y medidas', ['/contenedores-maritimos/', ...MARITIMOS]),
    bloque('Servicios y guías', SERVICIOS),
    // las de provincia son muchas y se parecen: van en «Optional» (la sección
    // que el formato reserva para lo que se puede saltar), solo con su título.
    // Detrás, cualquier página que no esté en los menús, para que no falte ninguna.
    bloque('Optional', [
      ...provincias('menu-principal'),
      ...provincias('contenedores-maritimos'),
      ...paginas.map((p) => p.ruta).sort(),
    ], { conDescripcion: false }),
  ];
  const texto = partes.filter(Boolean).join('\n\n').replace(/\n{3,}/g, '\n\n');
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
