import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casascontenedores.es',
  trailingSlash: 'always',
  build: { format: 'directory' },
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
