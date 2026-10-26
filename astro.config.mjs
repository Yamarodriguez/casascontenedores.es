import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, existsSync } from 'node:fs';

// fecha en que cambio de verdad cada pagina (scripts/fechas.mjs). Antes iba
// la del despliegue en todas, y los robots dejan de fiarse de esa fecha.
const fechas = existsSync('src/data/fechas.json')
  ? JSON.parse(readFileSync('src/data/fechas.json', 'utf8'))
  : {};

export default defineConfig({
  site: 'https://casascontenedores.es',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // la errata /casa-contendor-20-pies/ (120 enlaces del contenido original)
  // se redirige con un 301 real en public/_redirects
  integrations: [
    sitemap({
      // sin fecha conocida, sin lastmod: mejor ninguna que una falsa
      serialize: (item) => {
        const fecha = fechas[new URL(item.url).pathname]?.fecha;
        if (fecha) item.lastmod = fecha;
        return item;
      },
      // las legales y el acuse del formulario no van al sitemap
      filter: (pagina) =>
        !['/aviso-legal/', '/politica-privacidad/', '/politica-de-cookies/',
          '/personalizar-cookies/', '/gracias/']
          .some((r) => pagina.endsWith(r)),
    }),
  ],
});
