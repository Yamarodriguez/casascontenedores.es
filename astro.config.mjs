import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://casascontenedores.es',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // el contenido original enlaza a /casa-contendor-20-pies/ (errata) desde
  // 120 paginas; el contenido no se toca, asi que la ruta con errata lleva a
  // la buena
  redirects: { '/casa-contendor-20-pies/': '/casa-contenedor-20-pies/' },
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
