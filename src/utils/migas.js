/**
 * migas.js — de qué cuelga cada página, para las migas de pan.
 *
 * Antes todas eran «Inicio › Página». Ahora dicen dónde está cada una en la
 * web (sin cambiar ninguna URL), y su marcado BreadcrumbList también:
 *
 *   Inicio › Contenedores marítimos › Tipos › Contenedor high cube
 *   Inicio › Modelos › Casa contenedor de 60 m²
 *   Inicio › Servicios › Pintura para contenedores
 *   Inicio › Andalucía › Almería › Adra
 *
 * No hay lista escrita a mano: sale de lo que ya existe.
 * - El menú (src/data/menus.json): los tipos y lo demás del menú de
 *   contenedores marítimos cuelgan de /contenedores-maritimos/; los servicios,
 *   de /servicios/; los modelos de casa, de /modelos/.
 * - src/data/zonas.json: cada ciudad cuelga de la página de su provincia y
 *   esta de la de su comunidad, siempre de la misma familia (casas o
 *   marítimos). Las ciudades que no están en zonas.json lo dicen en su JSON
 *   (campo "provincia", src/utils/paginas.js).
 * Un nivel solo se pone si su página existe y no es la propia página.
 */
import menus from '../data/menus.json';
import zonas from '../data/zonas.json';
import { fichas } from './paginas.js';

const PAGINAS = new Map(
  Object.values(import.meta.glob('../content/pages/*.json', { eager: true }))
    .map((m) => m.default || m)
    .map((p) => [p.ruta, p]),
);
const existe = (ruta) => PAGINAS.has(ruta);
// en los niveles de zona basta el nombre del sitio («Andalucía › Almería»),
// sin repetir «Casas Contenedores» en cada uno
const NOMBRE_ZONA = new Map();
const nombre = (ruta) => NOMBRE_ZONA.get(ruta) || PAGINAS.get(ruta)?.titulo || '';

const MARITIMOS = '/contenedores-maritimos/';
const SERVICIOS = '/servicios/';
const MODELOS = '/modelos/';

// los modelos de casa: por superficie, por número de contenedores y por pies
const esModelo = (ruta) => /^\/casa-(con-(un|dos|tres|cuatro)-contenedor(es)?|contenedor-(\d+-m2|20-pies|40-pies))\/$/.test(ruta);
// los tipos de contenedor (el submenú «Tipos» trae también usos como el bar o
// la piscina, que no son un tipo de contenedor)
const esTipo = (ruta) => /^\/contenedor(es)?-/.test(ruta) && ruta !== MARITIMOS;

/** ruta -> lista de padres [ruta, ...], del más general al más cercano. */
const PADRES = new Map();
const poner = (ruta, padres) => { if (!PADRES.has(ruta)) PADRES.set(ruta, padres); };

for (const it of menus['contenedores-maritimos'] || []) {
  if (it.url === MARITIMOS || it.url === SERVICIOS) continue;
  for (const h of it.hijos || []) {
    if (it.url === '/tipos-de-contenedores/' && esTipo(h.url)) poner(h.url, [MARITIMOS, it.url]);
  }
  poner(it.url, [MARITIMOS]);
}
for (const menu of Object.values(menus)) {
  for (const it of menu) {
    for (const h of it.hijos || []) {
      if (it.url === SERVICIOS && h.grupo === 'Servicios') poner(h.url, [SERVICIOS]);
    }
  }
}
for (const ruta of PAGINAS.keys()) if (esModelo(ruta)) poner(ruta, [MODELOS]);

// --- ciudades: provincia y comunidad, de la misma familia
const familiaDe = (ruta) => (/^\/contenedor(es)?-maritimos?-/.test(ruta) ? 'maritimos' : 'casas');
const comunidadDe = {};
for (const c of Object.values(zonas.comunidades || {})) {
  for (const p of c.provincias || []) comunidadDe[p] = c;
  for (const fam of ['casas', 'maritimos']) if (c[fam]?.[0]) NOMBRE_ZONA.set(c[fam][0], c.nombre);
}
for (const p of Object.values(zonas.provincias || {})) {
  for (const fam of ['casas', 'maritimos']) if (p[fam]?.[0]) NOMBRE_ZONA.set(p[fam][0], p.nombre);
}
const provinciaDe = new Map();
for (const [clave, p] of Object.entries(zonas.provincias || {})) {
  for (const fam of ['casas', 'maritimos']) for (const r of p[fam] || []) provinciaDe.set(r, clave);
}
for (const [ruta, f] of fichas()) if (f.provincia && !provinciaDe.has(ruta)) provinciaDe.set(ruta, f.provincia);

for (const [ruta, clave] of provinciaDe) {
  const fam = familiaDe(ruta);
  const cabeza = zonas.provincias[clave]?.[fam]?.[0];
  const comunidad = comunidadDe[clave]?.[fam]?.[0];
  const padres = [comunidad, cabeza].filter((r) => r && r !== ruta && existe(r));
  if (padres.length) poner(ruta, padres);
}

/** Las migas de una página: [{ nombre, url }], de Inicio a ella misma. */
export function migasDe(ruta, titulo) {
  if (ruta === '/') return [{ nombre: 'Inicio', url: '/' }];
  const padres = (PADRES.get(ruta) || []).filter((r) => r !== ruta && existe(r));
  return [
    { nombre: 'Inicio', url: '/' },
    ...padres.map((r) => ({ nombre: nombre(r), url: r })),
    { nombre: titulo, url: ruta },
  ];
}
