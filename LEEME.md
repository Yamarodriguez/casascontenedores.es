# casascontenedores.es — migración a Astro

Migración de WordPress + OceanWP + Elementor a un sitio estático en Astro.
**263 páginas**, URL por URL, sin perder ninguna dirección indexada.

## Qué hay aquí

```
src/content/pages/*.json    las 263 páginas, una por fichero, extraídas del XML
src/data/site.json          datos del sitio: correo, WhatsApp, AdSense, GA4, pie
src/data/menus.json         los dos menús, tal cual estaban en WordPress
src/layouts/Base.astro      head, JSON-LD, analítica, cabecera, héroe, pie
src/pages/[...slug].astro   la ruta dinámica que pinta las 263
src/components/             Header, Footer, Migas, Formulario, WhatsApp
src/styles/global.css       el sistema de estilos, medido sobre la web real
src/utils/estructura.js     el motor que reconstruye la maquetación de Elementor
src/utils/imagenes.js       webp cuando existe, marcador cuando falta
extraer.py                  XML -> JSON (NO ejecutar salvo reexportar el XML)
scripts/                    descargas, favicons, webp, validación, capturas
```

## Puesta en marcha

```bash
npm install
npm run webp          # copias .webp de las imágenes (opcional, pero recomendado)
npm run build         # compila a dist/
npm run validar       # comprueba las 263 páginas
```

## El diseño

Copia del diseño actual. Los valores no están inventados: salen de medir el
CSS del sitio en vivo (el personalizador de OceanWP y los CSS por página de
Elementor).

| | valor |
|---|---|
| Caja | 1.280 px centrada, fondo exterior `#e9e9e9` |
| Texto | 14 px / 1.8, `#565656` |
| Enlace hover | `#047fc2` |
| Menú | Tahoma 14 px sobre `#f9f9f9`, hover `#13aff0`, submenú con borde `#13aff0` |
| Verde de botones | `#2EB340`, hover `#4F4444` |
| Tarjetas | fondo `#E7E7E7`, banda de título `#A5A5A5`, Roboto Condensed 22 px |
| Pie | widgets `#222`, barra inferior `#919191` |
| Tipografías | Roboto y Roboto Condensed, alojadas en `public/fonts` |
| Punto de corte del menú móvil | 959 px |

### Tres fallos del original que se corrigieron a propósito

1. La banda de título tenía `padding:0` y texto blanco sobre `#f5f5f5`: el H1 y
   las migas eran invisibles. Ahora se leen.
2. El buscador de la cabecera era blanco sobre blanco. Se ha quitado: un sitio
   estático no tiene buscador propio.
3. La portada llevaba un `<style>` suelto dentro del `<body>` que cambiaba la
   tipografía y metía 60 px de relleno a toda la página. No se reproduce.

## Las reglas que no se rompen

1. Las rutas `/wp-content/uploads/` **no se renombran nunca**: están indexadas
   en Google Imágenes.
2. **Las 263 URL se conservan tal cual.** Ninguna página cambia de dirección.
3. **Un solo `<h1>` por página.** Lo pone `Base.astro`; los cuerpos no lo
   llevan. 192 de las 263 páginas no tenían ninguno en la web vieja: en ellas
   el primer encabezado asciende a H1 sin cambiar su texto ni su sitio. Las 71
   que sí lo tenían conservan el suyo.
4. **El contenido original no se modifica**: se añade alrededor o se
   reconstruye su maquetación. Las correcciones puntuales van en el motor con
   su regla documentada, nunca editando los JSON a mano.
5. Tras cada cambio: `npm run build`, `npm run validar` y
   `node scripts/comparar-encabezados.mjs`. **No se sube nada que no pase las
   tres.**
6. **No ejecutes `extraer.py`** salvo que reexportes el XML: sobrescribe
   `src/content/pages/` entero.

## Estado

| | |
|---|---|
| Páginas generadas | 265 (263 del XML + 404 + gracias) |
| Validación | 263/263, 0 fallos, 0 avisos |
| Encabezados idénticos a la web viva | 260/263 |
| Un solo H1 por página | sí |
| `href` vacíos | 0 |
| Imágenes sin archivo | 0 |
| Tiempo de compilación | ~3 s |

Las 3 páginas que no cuadran son las legales: WordPress las exportó vacías.
Se rellenan con `node scripts/descargar-legales.mjs`.

## Lo que falta

1. **`src/data/site.json`**: rellenar `formulario.accessKey` (web3forms) para
   que el formulario envíe de verdad. Mientras esté vacío se muestra el correo
   y el WhatsApp.
2. **Páginas legales**: `node scripts/descargar-legales.mjs`.
3. **Netlify**: `netlify.toml` ya manda la configuración. El bloque
   `X-Robots-Tag = "noindex, nofollow"` **se borra el día que el dominio
   apunte a Netlify**, no antes.
