/**
 * IndexNow: avisa a Bing (y a Yandex, Seznam, Naver…) de las páginas que han
 * cambiado en cada despliegue. ChatGPT y Copilot buscan en internet a través
 * de Bing, así que cuanto antes lo sepa Bing, antes lo ven ellos.
 *
 * 1. Antes de compilar (onPreBuild) se lee el sitemap que está publicado.
 * 2. Cuando el despliegue ya está en vivo (onSuccess) se compara con el
 *    sitemap nuevo de dist/ y se mandan las páginas nuevas o con otra fecha
 *    (la fecha sale de src/data/fechas.json: solo cambia si cambió el texto).
 *
 * Solo en producción. Si algo falla, se apunta en el registro y ya: nunca
 * tumba un despliegue. La clave es la de site.json -> indexnow, y el fichero
 * public/<clave>.txt demuestra que la web es nuestra.
 */
import { readFileSync, existsSync } from 'node:fs';

const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const DOMINIO = site.dominio;
const HOST = new URL(DOMINIO).host;
const CLAVE = site.indexnow;

const enProduccion = () => process.env.CONTEXT === 'production' || process.env.INDEXNOW_PRUEBA;

// <loc>…</loc><lastmod>…</lastmod> -> { url: lastmod }
const leerSitemap = (xml) => Object.fromEntries(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => [m[1], m[2] || '']),
);

let publicado = null;

export const onPreBuild = async () => {
  if (!enProduccion() || !CLAVE) return;
  try {
    const r = await fetch(`${DOMINIO}/sitemap-0.xml`);
    if (r.ok) publicado = leerSitemap(await r.text());
  } catch (e) {
    console.log(`IndexNow: no se pudo leer el sitemap publicado (${e.message})`);
  }
};

export const onSuccess = async ({ constants }) => {
  if (!enProduccion() || !CLAVE) return;
  try {
    const fichero = `${constants?.PUBLISH_DIR || 'dist'}/sitemap-0.xml`;
    if (!existsSync(fichero)) return console.log('IndexNow: no hay sitemap nuevo');
    const nuevo = leerSitemap(readFileSync(fichero, 'utf8'));
    // sin sitemap anterior (fallo de red) se avisa de todo: no hace daño
    const cambiadas = Object.keys(nuevo).filter((u) => !publicado || publicado[u] !== nuevo[u]);
    if (!cambiadas.length) return console.log('IndexNow: ninguna página cambiada');

    const cuerpo = { host: HOST, key: CLAVE, keyLocation: `${DOMINIO}/${CLAVE}.txt`, urlList: cambiadas.slice(0, 10000) };
    if (process.env.INDEXNOW_PRUEBA) return console.log('IndexNow (prueba, no se envía):', JSON.stringify({ ...cuerpo, urlList: cambiadas.length }));

    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(cuerpo),
    });
    console.log(`IndexNow: ${cambiadas.length} páginas avisadas (respuesta ${r.status})`);
  } catch (e) {
    console.log(`IndexNow: no se pudo avisar (${e.message})`);
  }
};
