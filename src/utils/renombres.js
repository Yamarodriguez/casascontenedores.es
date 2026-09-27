/**
 * renombres.js — encabezados reescritos a proposito en paginas concretas.
 *
 * El propietario pidio que en /planos/, /permisos/ y /casa-container-paso-a-
 * paso/ todos los h2 y h3 lleven la palabra de la pagina ("planos",
 * "permisos", "pasos"). Los textos nuevos estan en src/data/encabezados.json,
 * por pagina: { "/planos/": { "texto original": "texto nuevo" } }.
 *
 * No se tocan los JSON de las paginas: el cambio se aplica al pintar, sobre
 * todo lo que acaba en la pagina (titulos del contenido original, tarjetas de
 * modelos, las que anade comunes.js, la ampliacion SEO y las preguntas
 * frecuentes). scripts/comparar-encabezados.mjs lee el mismo fichero y da
 * estos cambios por buenos.
 */
import mapa from '../data/encabezados.json';

export const planoDe = (t) => String(t ?? '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
  .replace(/\s+/g, ' ').trim();

function renombresDe(ruta) {
  const m = mapa[ruta];
  return m ? new Map(Object.entries(m).map(([k, v]) => [planoDe(k), v])) : null;
}

/**
 * Aplica los renombres de la pagina a sus bloques (ya con todo lo anadido) y
 * a la lista de preguntas del JSON-LD. Devuelve cuantos ha cambiado.
 */
export function aplicarRenombres(ruta, bloques, faq = []) {
  const r = renombresDe(ruta);
  if (!r) return 0;
  let n = 0;
  const nuevo = (t) => r.get(planoDe(t));
  const recorrer = (lista) => {
    for (const e of lista || []) {
      if (!e) continue;
      if (e.t === 'seccion') { for (const c of e.columnas || []) recorrer(c.elementos); continue; }
      if (e.t === 'encabezado' && nuevo(e.texto)) { e.texto = nuevo(e.texto); n++; }
      if (e.t === 'faq') for (const i of e.items || []) if (nuevo(i.pregunta)) { i.pregunta = nuevo(i.pregunta); n++; }
      if (e.t === 'texto' && /faq-question/.test(e.html || '')) {
        e.html = e.html.replace(/(<(h[2-4]) class="faq-question"[^>]*>)([\s\S]*?)(<\/\2>)/gi, (m, abre, et, dentro, cierra) => {
          const x = nuevo(dentro);
          if (!x) return m;
          n++;
          return `${abre}${x}${cierra}`;
        });
      }
    }
  };
  recorrer(bloques);
  for (const i of faq) if (i && nuevo(i.pregunta)) i.pregunta = nuevo(i.pregunta);
  return n;
}
