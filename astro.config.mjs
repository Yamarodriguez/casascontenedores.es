import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casascontenedores.es',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // la errata /casa-contendor-20-pies/ (120 enlaces del contenido original)
  // se redirige con un 301 real en public/_redirects
  integrations: [
    sitemap({
      lastmod: new Date(),
      // las legales y el acuse del formulario no van al sitemap
      filter: (pagina) =>
        !['/aviso-legal/', '/politica-privacidad/', '/politica-de-cookies/',
          '/personalizar-cookies/', '/gracias/']
          .some((r) => pagina.endsWith(r)),
    }),
  ],
});
