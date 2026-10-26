/**
 * servicio.js — el marcado Service (schema.org) de cada página que ofrece un
 * servicio: qué se ofrece, quién lo da (la empresa, por su @id) y dónde.
 *
 * - Páginas de servicio (las de la rejilla «Servicios» del menú, más
 *   transporte, alquiler y estudio de parcela): el servicio de la página, en
 *   toda España.
 * - Páginas de localidad: la construcción de casas con contenedores o la
 *   venta y alquiler de contenedores marítimos, en esa localidad.
 *
 * Sin precio ni oferta: Service no los exige, y no se publica ninguna cifra
 * que no esté confirmada (Product/Offer quedan para cuando haya precios
 * propios).
 */
import menus from '../data/menus.json';
import { esMaritimos } from './hero.js';

const DE_SERVICIO = new Set();
for (const menu of Object.values(menus)) {
  for (const it of menu) {
    for (const h of it.hijos || []) if (h.grupo === 'Servicios') DE_SERVICIO.add(h.url);
  }
}

const TIPO_CIUDAD = {
  casas: 'Construcción de casas con contenedores marítimos llave en mano',
  maritimos: 'Venta, alquiler y transporte de contenedores marítimos',
};

/**
 * El objeto Service de la página, o null si la página no ofrece un servicio.
 * `nombre` es el h1 (o el título) de la página; `org`, el @id de la empresa.
 */
export function servicioDe({ ruta, menu, localidad, nombre, descripcion, url, org }) {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: nombre,
    ...(descripcion ? { description: descripcion } : {}),
    url,
    provider: { '@id': org },
  };
  if (localidad) {
    return {
      ...base,
      serviceType: TIPO_CIUDAD[esMaritimos(ruta, menu) ? 'maritimos' : 'casas'],
      areaServed: {
        '@type': 'Place',
        name: localidad,
        containedInPlace: { '@type': 'Country', name: 'España' },
      },
    };
  }
  if (DE_SERVICIO.has(ruta)) {
    return { ...base, serviceType: nombre, areaServed: { '@type': 'Country', name: 'España' } };
  }
  return null;
}
