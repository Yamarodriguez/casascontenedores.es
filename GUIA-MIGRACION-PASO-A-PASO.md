# Guía paso a paso para la próxima migración de WordPress a Astro

Esta guía reúne lo que aprendimos al migrar casascontenedores.es, del 15 al 28 de
septiembre de 2026. Viene de cuatro sitios: tu documento de instrucciones,
`ANALISIS-MIGRACION.md`, `PROMPT-NUEVA-MIGRACION.md` y los 46 commits del
proyecto.

Sirve para dos cosas:

1. **Evitar errores.** Cada regla de aquí nos costó horas o días.
2. **Gastar menos.** Claude lee un solo documento, ya sabe qué hacer y en qué
   orden, y no hay que explicárselo todo otra vez.

Cómo está organizada:

| Parte | Para quién | Qué tiene |
|---|---|---|
| 1. Antes de empezar | Para ti | Lo que tienes que tener preparado |
| 2. Cómo pedir las cosas | Para ti | Hábitos que ahorran tokens y rondas |
| 3. El paso a paso | Para Claude y para ti | Las 9 fases, en orden, con su lista de comprobación |
| 4. Errores que ya nos pasaron | Para Claude | Qué pasó, por qué y cómo evitarlo |
| 5. Plantilla de `CLAUDE.md` | Para Claude | La ficha del proyecto que se lee sola en cada sesión |
| 6. El mensaje para empezar | Para ti | Lo que pegas en la primera sesión |

---

# PARTE 1 — Antes de empezar (lo que tienes que tener tú)

Reúne esto **antes de abrir la primera sesión**. Cada dato que falta a mitad de
trabajo es una ronda perdida.

## Ficheros

- [ ] **El export XML de WordPress**: Herramientas → Exportar → Todo el contenido.
- [ ] **Una captura o copia de la zona DNS completa** del dominio, tal como
      está hoy. Tiene que salir todo: MX, SPF, DKIM (`_domainkey`), SRV,
      `autoconfig`, `autodiscover` y los TXT de verificación. **Es lo más
      importante de esta lista.** En casascontenedores.es, por no tenerla a mano
      el día del cambio, el correo dejó de funcionar (ver el error 1 de la
      parte 4).
- [ ] **Una carpeta nueva** en el Escritorio para el proyecto, con esta guía,
      `ANALISIS-MIGRACION.md` y la carpeta `scripts/` de este proyecto copiadas
      dentro. Así Claude reutiliza las herramientas que ya funcionan y no las
      escribe de cero (ver el paso 0.3).

## Accesos (que funcionen, no solo que existan)

- [ ] Panel del registrador del dominio (en nuestro caso OVH): zona DNS.
- [ ] Panel del hosting viejo. **No se cancela hasta un mes después del cambio.**
- [ ] GitHub, Netlify, Search Console, Google Analytics y AdSense.
- [ ] Web3Forms o el servicio de formularios que vayas a usar. Su clave tiene
      que ir **a un correo que funcione**.

## Datos que solo sabes tú

Claude no puede inventarlos. Si no los tiene, o se para a preguntarte o escribe
algo genérico que luego hay que rehacer.

- [ ] Precios reales: por m², por modelo o por servicio, con o sin IVA.
- [ ] Plazos reales: fabricación, permisos y montaje.
- [ ] Qué servicios das de verdad y en qué zonas.
- [ ] Teléfono, WhatsApp, correo y horario.
- [ ] Datos legales del titular: nombre o razón social, NIF y dirección.
- [ ] Identificadores: AdSense `ca-pub-…`, Analytics `G-…` y el código de
      verificación de Search Console.
- [ ] Testimonios u obras reales que se puedan publicar (si los hay).

## Decisiones que conviene dar desde el principio

- [ ] **¿Quién sube a Git?** Si quieres que lo haga Claude, dilo en el primer
      mensaje: *"cuando todo pase la verificación, súbelo a main"*. Si no lo
      dices, te lo preguntará cada vez.
- [ ] **¿Dónde se queda el DNS?** Recomendado: **en el registrador** (OVH),
      cambiando solo los registros de la web. Así el correo ni se toca. Pasar
      los servidores DNS a Netlify obliga a copiar a mano todos los registros
      del correo.
- [ ] **¿Web encajonada o a todo lo ancho?** Si la vieja se veía en una caja
      centrada al alejar el zoom, dilo antes del rediseño, no después.

---

# PARTE 2 — Cómo pedir las cosas para gastar menos

1. **Una sesión por fase.** Cuando una fase se cierra, empieza una
   conversación nueva. Las conversaciones muy largas se resumen solas, pierden
   detalle y cada mensaje cuesta más. La continuidad la da `CLAUDE.md`
   (parte 5), que Claude actualiza al cerrar cada fase.
2. **No pegues documentos largos: di dónde están.** *"Lee
   GUIA-MIGRACION-PASO-A-PASO.md"* cuesta mucho menos que pegarla entera, y
   además no se repite en cada mensaje.
3. **Primero el análisis y luego los cambios.** *"Analízalo y no toques nada"*,
   y después, con la lista delante, *"haz el 1, el 3 y el 5"*. Es lo que mejor
   nos funcionó: no se rehace nada.
4. **Contesta las decisiones todas juntas.** Cuando Claude te dé una lista de
   preguntas, responde en un solo mensaje: *"1 sí, 2 no, 3 sí pero sin
   enlaces"*.
5. **Cuando algo se ve mal: página, captura y qué está mal.** Por ejemplo:
   *"/servicios/, la foto tapa el título"*. Una captura sin la dirección obliga
   a buscar.
6. **Los trabajos grandes con workflow; los pequeños, sin él.** Una auditoría
   de toda la web o reescribir 250 páginas sí lo merece. Cambiar un título no:
   dilo con *"sin workflow"*.
7. **Los cambios masivos, primero en seco.** Antes de corregir algo en cientos
   de páginas, pide el recuento: *"dime cuántos cambiarías y enséñame 5
   ejemplos"*. Así salió lo de "deseass" (error 6) antes de que llegara a
   publicarse.
8. **Si dices "sigue igual", Claude mira primero la carpeta**, no te pide que le
   pegues errores.

---

# PARTE 3 — El paso a paso

Son 9 fases, en este orden. **No se pasa a la siguiente sin cerrar la
anterior.** Al cerrar cada fase:

1. pasa `npm run todo`;
2. se hace commit;
3. se actualiza `CLAUDE.md`;
4. y, si así lo has pedido, se sube a `main`.

Este es el calendario real de casascontenedores.es, para que sepas cuánto lleva
cada parte:

| Días | Qué se hizo |
|---|---|
| 15–16 sep | Extracción, copia fiel, hojas de estilo, letras e iconos, rediseño |
| 26–27 sep | Menú nuevo, páginas nuevas, ampliaciones SEO de 173 páginas, formulario |
| 28 sep | Guías y servicios, cambio de DNS, galería, auditoría, correcciones y velocidad |

---

## FASE 0 — Reconocimiento (sin escribir código)

**0.1 Leer y preguntar.** Claude lee esta guía y `ANALISIS-MIGRACION.md`, y
crea `CLAUDE.md` con la plantilla de la parte 5.

**0.2 Hacer inventario y enseñártelo.** Antes de seguir, te dice:

- qué constructor usa la web (Elementor, Divi, Gutenberg…) y **de qué campo del
  XML saldrá la maquetación**. En Elementor es `_elementor_data`, **nunca**
  `content:encoded`;
- cuántas páginas hay, de qué tipos, y cuántas son plantilla de ciudad;
- qué hojas de estilo carga cada tipo de página y en qué orden;
- qué tipografías e iconos usa, en qué versión, y si están en npm;
- **qué contenido viene de plugins y no está en el XML**:
  - galerías (Modula, NextGEN);
  - formularios (Contact Form 7);
  - sliders y shortcodes en general.

  Hay que buscar en el XML todo lo que vaya entre corchetes, del tipo `[algo
  id=…]`. En casascontenedores.es se perdieron así las 58 fotos de la página
  Fotos.

**0.3 Montar el kit.** Se reutilizan los scripts de esta migración. Solo hay que
cambiar el dominio y el número de páginas que llevan dentro.

| Script | Para qué |
|---|---|
| `arbol.py` | XML → un JSON por página con el árbol de Elementor |
| `menus.py` | Menús de WordPress → `menus.json` |
| `descargar-imagenes.mjs` | Fotos del contenido **y** del CSS |
| `descargar-css.mjs`, `css.mjs` | Hojas reales, en su orden |
| `descargar-estructura.mjs` | Encabezados de la web en vivo, para comparar |
| `descargar-muestra.mjs` | HTML completo de una página de cada tipo |
| `descargar-legales.mjs`, `legales.mjs` | Páginas legales, que el XML trae vacías |
| `fuentes-locales.mjs` | Letras desde npm, **con `unicode-range`** |
| `webp.mjs`, `analizar-imagenes.mjs` | Copias webp y medidas de cada foto |
| `validar.mjs` | El validador |
| `comparar-encabezados.mjs` | Encabezado a encabezado contra la web en vivo |
| `comparar-visual.mjs`, `capturas.mjs` | Medidas y capturas, antes y después |
| `erratas.mjs`, `corregir-erratas.mjs` | Correcciones de texto desde un fichero de datos |
| `nueva-pagina.mjs` | Páginas nuevas con la misma estructura |
| `favicons.mjs`, `zonas.mjs` | Favicons y a qué provincia pertenece cada ciudad |

Los motores (`src/utils/render.js`, `intro.js`, `tipos.js`, `hero.js` e
`imagenes.js`) y los componentes también se pueden reutilizar como base.

**Cierre de la fase 0:** tú confirmas el inventario.

---

## FASE 1 — Bajar todo de la web vieja

**Todo lo que haya que bajar se baja ahora, mientras la web vieja sigue en el
dominio.** En cuanto cambie el DNS, esas direcciones dejan de responder.

- [ ] XML → JSON con el árbol de maquetación.
- [ ] Fotos del contenido **y** de los `url(...)` del CSS. Se conservan las
      rutas `/wp-content/uploads/…` y los nombres, porque están en Google
      Imágenes. Se usa la variante de tamaño que usaba el constructor
      (Elementor usa `large`).
- [ ] Fotos de plugins: galerías y sliders. **Pide permiso al propietario
      antes de descargar**, diciéndole cuántas son y cuánto ocupan.
- [ ] Hojas de estilo reales, conservando el orden del `<head>`.
- [ ] Encabezados de todas las páginas, para `comparar`.
- [ ] HTML completo de una página de cada tipo, para la referencia local.
- [ ] Textos legales.
- [ ] Lista de los ID de WordPress (`?p=123`, `?page_id=45`) con la página a
      la que corresponde cada uno, para las redirecciones de la fase 7.

**Cierre:** el validador da 0 fotos sin archivo, también las del CSS.

---

## FASE 2 — Copia fiel

Objetivo: que la web nueva sea **igual** que la vieja. Nada de mejoras todavía.

- [ ] Pintar el árbol con el marcado exacto del constructor: mismas clases,
      divs del velo y `elementor-kit-N` en el `<body>`.
- [ ] Hojas originales en su orden. La de la página va **en medio** de las
      comunes, no al final.
- [ ] Letras e iconos desde npm, **ya con `unicode-range`**. Así no se bajan
      alfabetos que la web no usa. Aquí lo hicimos al final y ahorró 113 KB por
      página.
- [ ] Un solo H1 por página. Si la página vieja no tenía ninguno, el primer
      encabezado sube a H1 sin cambiar su texto.
- [ ] La conversión de comillas de WordPress (`"así"` → `«así»`), solo en el
      texto visible.
- [ ] Montar la web vieja en local y **comprobar que carga todo, con 0
      errores 404**, antes de comparar nada contra ella.
- [ ] Las comprobaciones automáticas, en `npm run todo`:
  - encabezados: el mismo número de páginas idénticas que en vivo (aquí,
    263/263);
  - geometría a 1400 y 390 px;
  - texto invisible;
  - errores 404;
  - el validador: palabras perdidas, enlaces, fotos y un solo H1.
- [ ] **Fallos del original** (texto invisible, avisos de "en obras",
      "próximamente", botones que apuntan a `#`, títulos con otra ciudad): se
      apuntan y **se enseñan al propietario**. No se copian ni se arreglan en
      silencio. En casascontenedores.es salieron estos:
  - 24 botones a `#`;
  - Cuenca con el título de Córdoba;
  - La Rioja con el de Lleida;
  - "Se habilitará próximamente" en casas prefabricadas;
  - "estamos mejorando la web" en pérgolas.

**Cierre:** capturas comparadas de una página de cada tipo, en escritorio y
móvil, y tu visto bueno.

---

## FASE 3 — Rediseño

- [ ] Una paleta que traduzca los colores del constructor a los de la marca
      (`paleta.js`). El color del texto se decide **contra el fondo ya
      traducido**.
- [ ] Una hoja de diseño propia (`diseno.css`) que **no fuerce** colores, tamaños
      ni colores de enlace globales. Se escribe en px: con el tema, `1rem` son
      10 px.
- [ ] La caja: si la web era encajonada, `#wrap` con ancho máximo (aquí,
      1280 px), centrado y con fondo exterior.
- [ ] Cabecera, menú (que no se monte sobre el logo si es largo), foto
      principal, franja de cierre y pie.
- [ ] La foto principal: no estirar las que son pequeñas, ni usar las que
      llevan el rótulo incrustado o una marca de agua ajena. Se eligen
      mirándolas.
- [ ] Desde ya, la foto principal en varios tamaños webp (`srcset`), con
      `preload` y `imagesrcset`. Aquí lo hicimos al final: la de las páginas de
      casas pesaba tanto que tardaba unos 9 s en móvil.
- [ ] Cada cambio se mide antes y después contra la referencia. Si el cambio
      dice "sin tocar el diseño", tiene que salir **0 diferencias** de posición
      y tamaño.

**Cierre:** capturas y tu visto bueno.

---

## FASE 4 — Contenido nuevo y SEO

**La regla:** lo nuevo se añade alrededor del contenido original, sale de
**ficheros de datos** y el motor lo pinta al compilar. Los 263 JSON no se
editan a mano.

| Fichero de datos | Qué hace |
|---|---|
| `ampliacion` en el JSON de cada página | Secciones SEO y FAQ añadidas al final, con su JSON-LD |
| `encabezados.json` | Títulos que cambian a propósito, por página. `comparar` los acepta |
| `orden-tipos.json` | El orden de los tipos de contenedor en menús y rejillas |
| `intro-ciudades.json`, `intro-libres.json` | Párrafos de entrada para que el texto llegue a la altura del formulario |
| `servicios.json` | La rejilla de servicios con foto, en todas las páginas |
| `erratas.json` | Correcciones de texto: palabras, frases y palabras protegidas |
| `modelos-m2.json`, `zonas.json` | Modelos por superficie y ciudades por provincia |

Lista de comprobación:

- [ ] **Una sola FAQ por página**, con su `FAQPage` en JSON-LD.
- [ ] Los H2 y H3 nuevos nombran el tema de la página.
- [ ] Los textos nuevos **no llevan precios, plazos, normativa ni testimonios
      inventados**: salen de la parte 1 o se pregunta.
- [ ] **Comprobación de hechos de todo texto escrito por IA** antes de
      publicarlo. Aquí 6 textos decían que sin cédula "no puedes empadronarte"
      (es falso), y otro proponía cimentar mientras se tramitaba la licencia
      (sería obra sin licencia).
- [ ] Páginas nuevas (guías y servicios) con `nueva-pagina.mjs`, para que
      todas tengan la misma estructura.
- [ ] Al añadir páginas nuevas, se enlazan desde el menú, desde la rejilla de
      servicios y desde el texto de las páginas relacionadas. Ninguna se queda
      huérfana.
- [ ] Enlaces externos a otras webs tuyas: se pregunta si deben ir a una página
      propia. Aquí, 355 enlaces a prefabricadascasas.es pasaron a
      `/casas-prefabricadas/`.
- [ ] Botones con texto que diga adónde llevan ("Ver precios", "Ver medidas"),
      no "Haz clic aquí". Dos variantes por destino, para no repetir la misma
      frase en cientos de páginas.

**Cambios en el texto original** (erratas, tuteo y usted, frases que se
contradicen): **solo con permiso del propietario**. Se hacen así:

1. una regla en `erratas.json`;
2. un script que se puede ejecutar dos veces sin estropear nada;
3. una pasada en seco con el recuento;
4. un commit propio que diga "(pedido por el propietario)".

`comparar` aplica las mismas correcciones a los encabezados de la web viva,
así que sigue dando 263/263.

**Cierre:** `npm run todo` pasa y tú revisas una muestra.

---

## FASE 5 — Formularios y contacto

- [ ] El formulario se envía **sin salir de la página** (envío AJAX) y enseña
      "Mensaje enviado" o el error ahí mismo. Si no, Web3Forms te lleva a su
      página en inglés.
- [ ] El aviso del formulario incluye **de qué página viene** cada mensaje.
- [ ] Un evento de conversión en Analytics cuando se envía.
- [ ] El botón de WhatsApp lleva un mensaje distinto según la familia de
      páginas (casas o contenedores).
- [ ] La prueba de envío real la hace el propietario, o Claude con su permiso
      expreso en ese momento.

---

## FASE 6 — Velocidad (sin tocar el diseño)

- [ ] Fuera las tipografías que no se usan, y `unicode-range` en las demás.
- [ ] `width` y `height` en cada foto, sacados de las medidas reales, para que
      la página no salte al cargar. Aquí: 7.776 fotos con 0 diferencias de
      maquetación.
- [ ] La foto principal en webp y en varios tamaños.
- [ ] **Medir sobre la web compilada (`npm run build` + `preview`), no sobre
      `npm run dev`.** El modo de desarrollo añade sus propias descargas y
      engaña: aquí parecía que la foto principal se bajaba dos veces.
- [ ] Antes y después con Playwright: 0 diferencias de posición y tamaño.

---

## FASE 7 — Mudanza al dominio (el día del cambio)

Se hace **en este orden y el mismo día**:

1. [ ] **Comprobar que la fase 1 está completa**: nada pendiente de bajar de la
       web vieja.
2. [ ] **Tener delante la zona DNS completa** (parte 1).
3. [ ] **En Netlify:**
   - añadir el dominio;
   - que la orden de compilación genere todo lo que no está en Git (aquí:
     `npm run css && npm run build`, porque `public/css/` no se sube).
4. [ ] **En el registrador**, dejando el DNS allí (recomendado):
   - registro **A** de `@` → `75.2.60.5` (el de Netlify; compruébalo en su
     panel);
   - **`www`**: A a la misma IP, o CNAME a `tu-sitio.netlify.app`;
   - **borrar los AAAA (IPv6)** del hosting viejo, o quien navegue por IPv6
     seguirá viendo WordPress;
   - **no** poner un CNAME en el dominio raíz: OVH le añade el dominio detrás
     y no funciona;
   - si al guardar vuelve a salir la IP vieja, el dominio sigue enlazado al
     hosting en **Multisitio** (OVH): hay que quitarlo de ahí primero;
   - **no tocar MX, SPF, DKIM, SRV ni TXT.**
5. [ ] **Si en vez de eso pasas los servidores DNS a Netlify:** antes de
       cambiarlos, copia en Netlify **todos** los registros del correo (MX,
       SPF, DKIM, SRV, `autoconfig`, `autodiscover`) y los TXT de
       verificación.
6. [ ] **Comprobar** preguntando directamente a los servidores DNS del dominio
       (no al ordenador, que guarda la respuesta vieja). Con TTL corto, el
       cambio se ve en minutos. Si no, es que no está guardado. Para verlo en
       tu ordenador: ventana de incógnito o `ipconfig /flushdns`.
7. [ ] **Netlify → HTTPS → Verify DNS configuration**, para que genere el
       certificado.
8. [ ] **Ese mismo día**, en `netlify.toml`:
   - quitar el `X-Robots-Tag: noindex`;
   - activar la redirección de `*.netlify.app` al dominio.

   Ni antes ni después.
9. [ ] **Correo:** envíate un correo de prueba y haz un envío desde el
       formulario.
10. [ ] **Redirecciones (`_redirects`):**
    - las URL de WordPress que desaparecen (sitemaps de Yoast, feeds,
      `wp-admin`, categorías…);
    - **cada `?p=ID` a su página**, no todas a la portada;
    - las páginas renombradas, con un 301 de verdad.
11. [ ] **Caché:** las fotos se guardan un año en el navegador, pero solo las
        que existen. Un 404 no se debe guardar un año.
12. [ ] **Cookies:** el aviso de consentimiento (el CMP certificado de AdSense)
        conectado a Analytics y AdSense **antes** de que pongan cookies. La
        AEPD lo exige.
13. [ ] **Search Console:**
    - enviar `sitemap-index.xml`;
    - comprobar que todas las URL del sitemap dan 200 (aquí, 283);
    - pedir la indexación de las páginas nuevas y de las que más han cambiado.
14. [ ] **El hosting viejo no se cancela hasta pasado un mes.**

---

## FASE 8 — Auditoría después de publicar

Una sola auditoría, con workflow, que **solo lee y no toca nada**. Te entrega
una lista y tú dices qué se hace. Esto es lo que salió aquí, para buscarlo desde
el principio:

- [ ] Títulos o descripciones con otra ciudad (plantillas copiadas).
- [ ] Erratas repetidas: "contendor" salía 771 veces.
- [ ] Voseo y "usted" mezclados con el tuteo.
- [ ] Botones a `#` y enlaces vacíos.
- [ ] Enlaces "Haz clic aquí": había 1.337.
- [ ] Enlaces internos que pasan por una redirección (aquí, 465): hay que
      ponerles la dirección final.
- [ ] Páginas huérfanas o con pocos enlaces entrantes.
- [ ] **Precios y plazos que se contradicen entre páginas** (se arreglan con
      los datos reales del propietario).
- [ ] Textos de "próximamente" o "en obras" olvidados.
- [ ] Páginas de un tipo con la FAQ de otro (FAQ de casas en páginas de
      contenedores).
- [ ] Migas de pan con jerarquía y datos estructurados completos.

---

# PARTE 4 — Errores que ya nos pasaron (para que no se repitan)

## Al cambiar el dominio

| # | Qué pasó | Por qué | Cómo evitarlo |
|---|---|---|---|
| 1 | El correo dejó de funcionar | Se pasaron los servidores DNS a Netlify y los MX, SPF y DKIM se quedaron en OVH | Dejar el DNS en el registrador, o copiar antes todos los registros del correo (fase 7, paso 5) |
| 2 | "Cambié los DNS y sigo viendo la página vieja" | Los cambios no estaban guardados en OVH, quedaban los AAAA y había un CNAME en el dominio raíz | Fase 7, pasos 4 y 6: preguntar a los servidores DNS, no esperar |
| 3 | A la página Fotos le faltaban sus 58 fotos | Las mostraba un plugin (Modula) y el XML no las trae | Buscar los shortcodes en la fase 0 y bajarlo todo en la fase 1, antes del cambio de DNS |
| 4 | El formulario llevaba a una página en inglés | El campo de redirección de Web3Forms | Envío AJAX con el aviso en la misma página (fase 5) |

## Al cambiar textos

| # | Qué pasó | Por qué | Cómo evitarlo |
|---|---|---|---|
| 5 | Textos nuevos con datos falsos (empadronamiento, cimentación) | Texto escrito por IA sin comprobar | Comprobación de hechos antes de publicar (fase 4) |
| 6 | Apareció "deseass" 206 veces | La regla "si así lo desea" se aplicó también sobre "desea**s**" ya corregido | Reglas que no se pueden aplicar dos veces (`desea(?!s)`), pasada en seco y recuento antes de escribir |
| 7 | "Disculpa" salía con mayúscula a mitad de frase | La sustitución no respetaba mayúsculas y minúsculas | Las correcciones conservan la mayúscula o minúscula del original |
| 8 | `comparar` falló tras corregir el tuteo | La corrección cambió un título que `encabezados.json` usaba como clave | Las correcciones van en `erratas.json`, que corrige también las claves y la web viva al comparar |

## Al montar la web

| # | Qué pasó | Por qué | Cómo evitarlo |
|---|---|---|---|
| 9 | Unos párrafos subidos a la entrada se pintaban como tarjetas | El motor reconoció ese patrón como el bloque de "ventajas" | Marcar la columna para que no se le apliquen patrones (`sinPatrones`) y comprobar con capturas |
| 10 | Se perdió la FAQ de /preguntas-frecuentes/ | La página tenía FAQ pero ninguna sección añadida, y el motor no contemplaba ese caso | Probar los casos vacíos: solo FAQ, sin FAQ, sin secciones |
| 11 | El navegador de pruebas mostraba el CSS viejo | El servidor de desarrollo guardaba el CSS de los componentes | Reiniciar el servidor de desarrollo tras cambiar el CSS de un componente |
| 12 | Parecía que la foto principal se bajaba dos veces | La barra de herramientas del modo de desarrollo | Medir sobre la web compilada, o en la web en vivo |

## Al trabajar con Claude

| # | Qué pasó | Por qué | Cómo evitarlo |
|---|---|---|---|
| 13 | Un agente de un workflow cambió ficheros por su cuenta | Su encargo no lo prohibía | Todo encargo a un agente dice "PROHIBIDO escribir ficheros": devuelve un JSON y los cambios los aplica la sesión principal |
| 14 | Expresiones regulares rotas (`\b` desaparecía) | En Windows, la consola se come las barras invertidas en `node -e` y en los heredocs | Todo código con barras invertidas se escribe en un fichero con las herramientas de edición |
| 15 | Rondas perdidas con ZIPs que no llegaban | Los ZIP acababan en otra carpeta | Escribir los ficheros directamente en la carpeta del proyecto |
| 16 | Comparaciones que daban "0 diferencias" estando mal | La referencia local no cargaba las tipografías | 0 errores 404 en la referencia antes de fiarse de ella |
| 17 | El limpiador de CSS dejó letra blanca sobre blanco | Tiraba reglas cuya clase solo estaba dentro de `:not()` | No limpiar el CSS; si se hace, que no mire dentro de `:not()`, `:is()`, `:where()` ni `:has()` |

## Las reglas que salen de todo esto

1. **Copiar, no reconstruir.** La maquetación sale del árbol del constructor y
   el CSS se copia. El CSS propio solo lleva lo que no existe en el original.
2. **El contenido original no se toca** salvo que el propietario lo pida, y
   entonces con regla, script, pasada en seco y commit propio.
3. **Lo nuevo se añade al final o alrededor**, desde ficheros de datos.
4. **No se inventa ningún dato.** Lo que no está en la web se le pregunta al
   propietario.
5. **Las URL y las rutas de las fotos no cambian nunca.**
6. **Nada se da por bueno sin `npm run todo`**: build, validar y comparar.
7. **Cada fallo que el propietario ve a ojo se añade al validador** ese mismo
   día.
8. **Antes y después, medido.** "No cambia el diseño" se demuestra con 0
   diferencias, no a ojo.
9. **Los fallos del original se enseñan y se decide.** No se copian ni se
   arreglan en silencio.
10. **Antes de quitar algo "que no se ve"**, comprobar que nada dependa de su
    espacio (aquí, un margen de −84 px).

---

# PARTE 5 — Plantilla de `CLAUDE.md`

Claude Code lee solo el fichero `CLAUDE.md` de la raíz del proyecto al empezar
cada sesión. Es lo que más tokens ahorra: no hay que volver a explicar nada.
Claude lo crea en la fase 0 y lo actualiza al cerrar cada fase.

```markdown
# [DOMINIO] — migración de WordPress a Astro

## Quién manda y cómo se habla
El propietario es [NOMBRE]. No es técnico: castellano de España, tuteo, sin
jerga. El trabajo lo haces tú: editas, compilas, verificas y le cuentas qué
ha cambiado. Git: [tú subes a main cuando todo pasa / solo commit, él sube].

## Reglas
- Lee GUIA-MIGRACION-PASO-A-PASO.md (parte 3 y parte 4) antes de cada fase.
- El contenido original no se toca sin permiso. Lo nuevo va al final o
  alrededor, desde ficheros de datos (src/data/).
- No se inventan precios, plazos, normativa ni testimonios: se preguntan.
- Nada se da por bueno sin `npm run todo` (build + validar + comparar
  [N]/[N]).
- Windows: código con barras invertidas siempre en ficheros, nunca con
  `node -e` ni heredocs.
- Agentes de workflow: PROHIBIDO escribir ficheros; devuelven JSON.

## Datos del sitio
AdSense [ca-pub-…] · GA4 [G-…] · WhatsApp [nº] · correo [@] ·
formulario [servicio + clave] · DNS en [registrador / Netlify].

## Estado (se actualiza al cerrar cada fase)
- Fase actual: [n] — [qué falta para cerrarla]
- Hecho: [fase y fecha, una línea cada una]
- Pendiente del propietario: [decisiones y datos que faltan]
- Ficheros de datos en uso: [lista]
```

---

# PARTE 6 — El mensaje para empezar la próxima migración

Antes de pegarlo:

1. Crea la carpeta del proyecto.
2. Copia dentro esta guía, `ANALISIS-MIGRACION.md`, la carpeta `scripts/` de
   este proyecto y el XML.
3. Abre la sesión en esa carpeta.
4. Rellena lo que va entre corchetes.

```
Quiero migrar [DOMINIO] (WordPress con [Elementor / Divi / otro], en vivo en
https://[DOMINIO]) a Astro en Netlify, conservando todas las URL y el
posicionamiento. Soy el propietario y no soy técnico: háblame en castellano
llano y hazlo tú.

En esta carpeta tienes:
- GUIA-MIGRACION-PASO-A-PASO.md: el método. Léela entera antes de nada.
- ANALISIS-MIGRACION.md: por qué es así el método.
- scripts/: las herramientas de la migración anterior. Reutilízalas,
  adaptando el dominio.
- [nombre].xml: el export de WordPress.

Datos: AdSense [ca-pub-…], Analytics [G-…], WhatsApp [nº], correo [@],
titular [nombre, NIF, dirección]. Precios y plazos reales: [pegar aquí o
"te los paso en la fase 4"].

Decisiones: [súbelo tú a main cuando todo pase / yo hago el push].
El DNS se queda en [OVH / el registrador]. La web [encajonada a 1280 px /
a todo lo ancho].

Empieza por la FASE 0: crea CLAUDE.md con la plantilla de la parte 5 y
enséñame el inventario. No escribas código hasta que te lo confirme.
```
