/**
 * paginas.js — lo que cada pagina dice de si misma en su JSON.
 *
 * Tres campos OPCIONALES que mandan sobre cualquier deduccion por la ruta o
 * por el menu (asi una pagina nueva no obliga a tocar listas en el codigo):
 *
 *   "familia":   "casas" | "maritimos" | "servicio"
 *                heroe, cierre y rejilla de servicios de esa familia.
 *   "localidad": "Bilbao"
 *                la pagina es de ciudad: el heroe y el cierre la nombran y
 *                recibe la intro, la rejilla de modelos y las preguntas.
 *   "provincia": "vizcaya"
 *                clave de src/data/zonas.json: entra en los enlaces "otras
 *                zonas de ..." de su provincia sin regenerar zonas.json.
 *
 * Las paginas que no los llevan siguen como siempre (menu de WordPress,
 * listas de hero.js y comunes.js, zonas.json).
 */
const FAMILIAS = new Set(['casas', 'maritimos', 'servicio']);

const FICHAS = new Map(
  Object.values(import.meta.glob('../content/pages/*.json', { eager: true }))
    .map((m) => m.default || m)
    .map((p) => [p.ruta, {
      familia: FAMILIAS.has(p.familia) ? p.familia : '',
      localidad: typeof p.localidad === 'string' ? p.localidad.trim() : '',
      provincia: typeof p.provincia === 'string' ? p.provincia.trim() : '',
    }]),
);

const VACIA = { familia: '', localidad: '', provincia: '' };

/** Campos propios de la pagina de esa ruta (vacios si no los declara). */
export const fichaDe = (ruta) => FICHAS.get(ruta) || VACIA;

/** Todas las rutas con sus campos, para quien necesite recorrerlas. */
export const fichas = () => FICHAS;
