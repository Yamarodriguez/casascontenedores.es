# Prompt para migrar una web de WordPress a Astro (versión 4)

Copia todo lo que hay debajo de la línea y pégalo en una sesión nueva,
rellenando lo que está entre corchetes.

Sale de la migración de **renders.studio** (145 páginas, OceanWP + Elementor).
Todo lo que hay aquí costó al menos una ronda de ensayo y error.

**Lo nuevo de esta versión** son la sección **C2** (por qué una referencia mal
montada da aprobados falsos y arregla lo que no está roto) y la sección **H**
(la Fase 2 de diseño, que en renders.studio hubo que deshacer entera). Si solo
vas a leer dos cosas, lee esas.

---

Quiero migrar la web **[DOMINIO]** (WordPress, tema **[TEMA]**, maquetada con
**[Elementor / Divi / Gutenberg]**, hoy en vivo en `https://[DOMINIO]`) a un
sitio estático en **Astro** desplegado en **[Netlify / Cloudflare Pages]**,
conservando todas las URL y el posicionamiento.

Soy el propietario, no soy técnico: explícame las cosas en castellano llano,
hazlo tú, y súbelo a Git cuando esté verificado.

## Lo que te doy de entrada

- **Export de WordPress (XML)**: en `[RUTA]\worpress\`. Si hay varios, usa el
  más grande y dime qué contiene cada uno antes de empezar.
- **Mi carpeta de trabajo**: `[RUTA DE LA CARPETA]` (conectada a esta sesión).
- **Los scripts de la migración anterior**: en `[RUTA]\scripts\`. **Empieza por
  ahí.** El motor de render, el comparador, los descargadores y la comprobación
  de contraste ya están escritos y verificados; adáptalos, no los reescribas.
  Esto es lo que más tiempo y gasto ahorra.
- **Repositorio y despliegue**: `[URL DE GITHUB]`, rama `[main]`, proyecto de
  Netlify `[NOMBRE]`.
- **Cuentas** (para la Fase 3): AdSense `[…]`, Analytics `[…]`, Search Console
  `[…]`, WhatsApp `[…]`, correo `[…]`.
- **Datos del titular para las legales**: `[nombre o razón social, NIF, dirección]`.

---

# A. CÓMO TRABAJAMOS (lee esto primero)

## A1. Quién ejecuta qué

**Tú (Claude) puedes leer y escribir ficheros en mi carpeta, pero NO puedes
ejecutar comandos en mi ordenador.** Ni `node`, ni `npm`, ni `git`, ni `curl`.
Tampoco tienes salida a internet hacia mi dominio.

Por tanto:

- **Todo lo que haya que ejecutar, lo ejecuto yo.**
- **Todo lo que haya que ejecutar, me lo das como un fichero `.cmd` de doble
  clic**, no como comandos sueltos para pegar. Pegar comandos falla: se cuelan
  caracteres, se pega en PowerShell en vez del símbolo del sistema, se ejecuta
  a medias.
- Analizar, escribir código, comparar y decidir: eso lo haces tú.

**Y esto vale también para Git.** Tú no puedes hacer `commit` ni `push`. Un
cambio tuyo en un fichero **no está deshecho ni publicado hasta que yo ejecuto
el commit**. Cuando me digas "ya está arreglado", añade siempre la línea:
*"falta que lo subas tú"*, con el comando.

> **Error real:** deshice un rediseño quitando dos líneas de un fichero y te
> dije que ya estaba. Netlify siguió enseñando el rediseño una hora más, porque
> el cambio nunca llegó a Git.

## A2. Cómo tiene que ser cada `.cmd`

1. Empieza comprobando **sus propios requisitos** (que existe `node`, que
   existe `curl`, que la dependencia clave está instalada) y se para con un
   mensaje claro si falta algo.
2. Ejecuta los pasos **de uno en uno**, anunciando cuál va (`[3/5] Descargando
   hojas de estilo...`).
3. Ante el primer error, **se para y dice qué paso falló por su nombre**:
   `SE HA PARADO AQUI: generar los iconos`.
4. Termina con `pause`, para que la ventana no se cierre y yo pueda leerlo.
5. Deja un registro en `descargas\log-XX.txt` para que tú lo leas luego.

> **Error real:** encadenaste seis scripts en un `npm run datos`. Falló el
> cuarto porque faltaba un `npm install`, los dos últimos no se ejecutaron, y
> nadie se enteró. Dos días después el despliegue reventó por los ficheros que
> no se habían generado.

## A3. `npm install` va SIEMPRE primero

Cada vez que añadas una dependencia al `package.json`, el siguiente `.cmd` que
me des tiene que empezar con `npm install` **y comprobar que la dependencia
está de verdad**, mirando que exista un fichero concreto suyo. No des por hecho
que la instalé.

## A4. Antes de decir nada, mira mi carpeta

Si te digo "sigue igual", "no funciona" o "se ve mal", **lo PRIMERO que haces es
listar mi carpeta**: qué ficheros hay, de qué fecha y de qué tamaño. Y si el
problema es de Git o de Netlify, **mira `.git`**: `logs/HEAD` te dice los
commits y `refs/remotes/origin/main` si se llegó a subir. No supongas que los
comandos se ejecutaron. No me pidas que te pegue errores antes de haber
mirado tú.

## A5. No me pidas capturas: hazlas tú

No puedes abrir mi web, pero **sí puedes traerte mis ficheros y montarla en tu
entorno**. Con eso levantas las dos webs —la vieja y la nueva— en tu servidor
local, las abres con Playwright y me mandas las comparativas lado a lado.

Para traerte una página entera necesitas, y en este orden:

1. el HTML real de esa página
2. **todas** las hojas que salen en su `<head>`
3. las imágenes que salen en su HTML (`src` y `srcset`)
4. **las imágenes que salen dentro del CSS**, en `url(...)` — ver C2
5. las tipografías

Son unos 120 ficheros para una página. Con eso la web se ve de verdad.

**Dos límites que te van a morder:**

- No puedes traerte más de 50 ficheros por vez.
- **No puedes traerte un fichero que esté a más de 7 carpetas de profundidad.**
  Justo ahí viven las animaciones de Elementor y el Font Awesome del tema.
  Cuéntalo antes y dime qué no vas a poder traerte, para que yo lo copie a mano
  a un sitio menos hondo si hace falta.

## A6. Gastar menos

- **Descarga TODAS las páginas al principio, no una muestra.** Con una muestra
  de 13 hicimos tres rondas de "ahora me falta una página con este menú".
- **No me pidas que te pegue registros largos**: escríbelos en un fichero.
- **No listes carpetas enormes** sin filtro.
- Cuando algo falle, **reprodúcelo en tu entorno** antes de proponerme nada.

## A7. Qué sube a Git y qué no

- **`datos/` SÍ sube.** Netlify lo necesita para construir. Si falta un solo
  fichero, el despliegue falla con `ENOENT ... exit code 2`.
- **`public/` SÍ sube** (imágenes, hojas, JavaScript, tipografías). Son unos
  250 MB; avísame antes.
- **`referencia/` NO sube** (la copia de la web real, solo sirve para comparar).
- `dist/`, `node_modules/` y los registros, tampoco.

Antes de cada subida, pasa las comprobaciones. Si alguna falla, **no se sube
nada**.

---

# B. LAS REGLAS DEL CÓDIGO

## B1. Copiar, no reconstruir

1. **La maquetación sale de `_elementor_data`**, nunca de `content:encoded`.
2. **El CSS no se escribe: se copia.** La web carga 317 hojas. Si te pillas
   midiendo un margen a ojo desde una captura, para y dime qué hoja falta.
3. **Lo que genera un plugin no se calcula: se captura del HTML real.** En
   renders.studio eran cinco cosas, y cada una costó una ronda:
   - la galería de fotos
   - el formulario de Contact Form 7 (lleva dentro el número de la página, así
     que **va uno por página**)
   - el mapa de Google
   - la rejilla de Content Views (`[pt_view]`) **y la hoja de estilo suelta que
     deja detrás**
   - **las páginas legales, que están VACÍAS en el export** porque las escribe
     Complianz al vuelo
4. **Las fotos recortadas "a medida" de Elementor** se guardan en
   `uploads/elementor/thumbs/` con un nombre imposible de calcular. Se capturan.

## B2. El marcado de Elementor

- Una página puede mezclar **los dos sistemas**: `section`+`column` (clásico) y
  `container` (flexbox nuevo). En renders.studio **las 141 páginas llevaban los
  dos**.
- **Elementor escribe las clases en el orden en que están GUARDADOS los
  ajustes**, no en un orden fijo.
- `elementor-section-height-default` **sale dos veces**, salvo cuando la sección
  tiene altura mínima: entonces la segunda la sustituye
  `elementor-section-items-{posición}`.
- El orden se invierte según el caso: `e-con-full e-flex` a ancho completo,
  `e-flex e-con-boxed` en caja.
- La sección con velo lleva dentro un **`<div class="elementor-background-overlay"></div>` vacío**.
- `_inline_size` viene unas veces como `{size: 67.28}` y otras como `67.28`.
- "Ancho completo" es una **clase**, no CSS.
- `data-settings` solo lleva unas pocas claves (`background_background`,
  `_animation`, `_animation_delay`, `shape_divider_*`), **en el orden guardado**.
- **El contenedor nuevo (`.e-con`) pinta su fondo en un `::before`**, no en el
  propio elemento. Si miras solo `background-color`, una sección oscura te
  parecerá transparente.

## B3. Los iconos: DOS versiones de Font Awesome

- **Los iconos de los widgets no son una tipografía**: Elementor mete el SVG
  dentro del HTML.
- Esos trazados son de **Font Awesome 5.15.4**, aunque el tema cargue la
  **6.7.2** como tipografía para sus flechas de menú.
- Si usas la del tema, los miles de iconos salen con **otro dibujo** y ninguna
  comprobación lo detecta: cargan bien, pero están mal.

En `package.json`: `@fortawesome/fontawesome-free@6.7.2` y un alias `fa5` →
`@fortawesome/fontawesome-free@5.15.4`.

## B4. Las imágenes

- La variante por defecto de Elementor es **`large`**, no el original.
- El `srcset` va: **la variante que se usa**, luego las demás en el orden
  guardado, y **el original al final**. Solo las de la misma proporción.
- **Las dos primeras imágenes de cada página NO llevan `loading="lazy"`.**
- **Una foto repetida que ya salió sin `lazy` tampoco lo lleva la segunda vez.**
- La clase de animación al pasar el ratón va en la propia `<img>`, delante.
- Las rutas y los nombres no se tocan: están indexadas en Google Imágenes.

## B5. Lo que WordPress cambia al publicar

- Comillas rectas → `«así»` y `'así'` (*wptexturize*).
- Quita el punto y coma final de los `style="..."` escritos a mano.
- Añade `decoding="async"` a las imágenes del texto que no lo llevan.
- Los enlaces sin protocolo salen en `https`.
- Los `http://` internos salen en `https://` (plugin de SSL).

## B6. La cabecera no es una

En OceanWP cada página elige su menú con `ocean_header_custom_menu`. En
renders.studio eran **cinco cabeceras distintas** y 82 páginas usaban una que
no estaba en la muestra inicial.

El extractor del armazón tiene que **avisar** si le falta la referencia de
algún menú, con el número de páginas afectadas.

## B7. Las hojas de estilo

- Saca la lista del `<head>` de **varias** páginas, una de cada tipo.
- **`post-{ID}.css` va EN MEDIO**, no al final: detrás quedan seis hojas más.
- **`post-{ID}.css` no existe hasta que alguien visita esa página.** Elementor
  lo genera al vuelo. Las descargas de esas páginas traen un error de 196 bytes.
  Solución: visitar las páginas que faltan y volver a descargar.
- Las tipografías y los iconos: **mira npm antes de montar un descargador**. La
  versión exacta la pone el comentario de cabecera del CSS.
- **No adelgaces el CSS** hasta que la web esté idéntica.

---

# C. LA REFERENCIA Y EL COMPARADOR

## C1. El comparador de marcado

No escribas el motor y luego mires capturas. **Escribe el comparador primero** y
deja que él te diga qué corregir.

1. Para cada página, recorre los elementos con `data-id` del HTML real y los
   compara con lo que genera el motor: etiqueta, **lista de clases en orden**,
   atributos `data-*`, y el contenido de cada widget.
2. **Agrupa las diferencias por tipo** y dice cuál falta y cuál sobra.
3. Escribe el detalle en `informes/comparacion-marcado.md`.
4. Devuelve código de salida distinto de cero si hay diferencias.

En renders.studio: **1801 → 77 → 24 → 1 → 0** para el armazón, y
**162 → 140 → 30 → 18 → 7 → 0** para el contenido.

**Trampas:**

- Pasa **los dos lados por el mismo lector de HTML** antes de comparar.
- **Salta los elementos que cuelgan de otro widget**: hay páginas con marcado de
  Elementor pegado a mano dentro de un bloque de texto.
- **Normaliza lo que cambia en cada visita**: el identificador aleatorio de
  Content Views y la marca `data-rsssl`.

## C2. La referencia tiene que cargar TODO — y esto es serio

Esta es la sección que más cara ha salido.

**Las hojas descargadas conservan las direcciones absolutas al dominio viejo.**
Dentro de `post-{ID}.css` las fotos de fondo vienen así:

```
background-image: url("https://[DOMINIO]/wp-content/uploads/2025/05/foto.jpg");
```

Tú no tienes salida hacia ese dominio. En tu servidor local esa foto **no
carga**, y la sección sale de color liso.

Lo primero que hay que hacer, siempre:

1. **Recorrer todas las hojas descargadas y reescribir las direcciones
   absolutas al dominio viejo como relativas.** Un script, no a mano.
2. **Descargar lo que piden las hojas por dentro** (`url(...)`): son pocas fotos
   pero salen en cientos de páginas.
3. **Comprobar los 404 del navegador en la referencia antes de medir nada.**
   Si la referencia no carga sus fondos ni sus tipografías, la comparación dirá
   "0 diferencias" porque los dos lados están igual de rotos.

> **Error real, y el peor de toda la migración:** la foto de fondo de la
> portada no cargaba en mi entorno. La comprobación de texto invisible dedujo
> que el fondo era gris claro, vio el titular blanco encima, y "lo arregló"
> poniéndolo en **negro**. En la web de verdad ese titular va encima de un
> render precioso. Quedó ilegible, y el propietario lo vio antes que yo.

**La regla que sale de ahí, y no se negocia:**

> **Si una imagen de fondo no carga, NO SE SABE qué hay debajo del texto.
> En ese caso no se arregla nada: se apunta como fichero que falta y se avisa.**
> Dar por hecho que "no hay imagen, luego es blanco" es inventar.

---

# D. LOS FALLOS DEL ORIGINAL

Si la web en vivo tiene un fallo visible, **enséñamelo y pregúntame**. No lo
copies en silencio ni lo arregles en silencio. En renders.studio salieron:

1. Tres imágenes de fondo que dan 404 en el servidor, usadas en ~140 páginas.
2. Un botón con el enlace guardado como `#https://...`.
3. Dos páginas con dos H1 y cuatro páginas legales sin ninguno.
4. Enlaces naranja sobre fondo naranja claro, y un «Leer Más» magenta sobre
   azul: no se leen **en la web actual**. Eso no lo arregla la migración.

Y antes de quitar algo que "no se ve", comprueba que nada dependa de su
**espacio**: en una migración anterior, quitar una franja invisible hizo que la
foto principal tapara el menú, porque la sección de debajo tenía un margen
superior negativo que contaba con ella.

---

# E. ORDEN DE TRABAJO

## Fase 0 — Reconocimiento (sin escribir código)

Dime, y espera a que lo confirme:

- qué constructor usa y de qué campo sale la maquetación
- cuántas páginas hay y **de cuántos tipos de diseño** (no de cuántas URL)
- **cuántas cabeceras distintas** hay y qué ajuste las decide
- la lista de hojas de estilo **con su orden**
- las tipografías y los paquetes de iconos **con su versión**, y cuáles están en npm
- qué widgets usa y cuántas veces cada uno
- qué partes las genera un plugin y hay que capturar
- qué dice Search Console: **qué páginas traen el tráfico de verdad**

## Fase 1 — Copia fiel

En este orden, y cada paso en su `.cmd`:

1. Extraer el XML a datos.
2. **Descargar el HTML de TODAS las páginas.**
3. Descargar las imágenes.
4. Descargar las hojas, incluida la propia de cada página, y recuperar las que
   no existían aún.
5. **Reescribir las direcciones absolutas dentro de las hojas** (C2).
6. Descargar el JavaScript, las tipografías y **lo que piden las hojas por
   dentro**.
7. **Montar la referencia y comprobar que no tiene ni un 404.**
8. Extraer el armazón y el envoltorio del contenido.
9. Capturar lo que genera cada plugin.
10. Escribir el comparador.
11. Escribir el motor y **llevarlo a 0 diferencias**.
12. Las cuatro comprobaciones hasta 0 fallos.
13. Capturas comparadas, escritorio y móvil, de una página de cada tipo.

> **El JavaScript no es opcional.** Los bloques con `elementor-invisible` están
> ocultos hasta que el script de Elementor lanza su animación. Sin él, media web
> no se ve.

**Cierre de fase 1: yo te digo que está bien.** Hasta entonces, no pasas a la 2.

---

# F. LAS CUATRO COMPROBACIONES

Ninguna se puede saltar, y **cada fallo que yo te señale a ojo entra en el
validador como fallo bloqueante ese mismo día**.

1. **Encabezados.** La secuencia de H1/H2/H3 de cada página contra la real, en
   orden. Objetivo: 100 % idénticas. Cada excepción, documentada.
2. **Geometría.** Con Playwright, en la web real y en la nueva: posición, ancho,
   alto, tamaño de letra, grosor, color, tipografía y alineación de cada texto,
   enlace e imagen. A **1400 px y a 390 px**. Objetivo: 0–1 por página.
3. **Texto que no se lee.** Ver abajo: tiene su propia letra pequeña.
4. **Ficheros que no cargan.** Abre cada tipo de página, recórrela entera para
   que carguen las imágenes perezosas, y lista las respuestas 400/404 separando
   fotos, tipografías y otros. Tiene que quedar en cero.

## La comprobación 3, con detalle

Es la que más falsos positivos da si se hace mal. En renders.studio dio **98
fallos** la primera vez y **11 reales** cuando estuvo bien hecha.

Para saber el fondo que hay debajo de un texto hay que **apilar todas las capas
y componerlas**, no quedarse en el primer `background-color`:

- el fondo del propio elemento y de cada padre
- **el `::before` de los contenedores `.e-con`**, que es donde Elementor pinta
- **el `<div class="elementor-background-overlay">`, que es HERMANO del
  contenido, no padre.** Sin contarlo, una tarjeta con foto y velo negro parece
  "blanco sobre blanco". Esto solo dio 87 fallos falsos.

Y hay **dos casos con dos arreglos distintos**:

- **Fondo plano.** Se cambia el color del texto, oscureciendo o aclarando **el
  mismo tono**. Un rótulo dorado sigue dorado, solo más oscuro.
- **Fondo de foto con letra clara.** **No se toca el texto nunca.** Se refuerza
  el velo que ya existe con un degradado suave. Poner el texto oscuro encima de
  un render lo destroza.
- **Fondo desconocido porque la imagen no carga.** No se toca nada. Ver C2.

Dos detalles más:

- Mide la página **con la hoja generada desactivada**, o estarás midiendo la
  página ya corregida y siempre te dará cero.
- **No generes reglas sin el identificador del constructor.** Una regla suelta
  sobre `span.text-wrap` me dejó el menú entero en blanco sobre blanco.

Más el validador de siempre: equilibrio de etiquetas, un solo H1, ningún bloque
generado dentro de otro, texto visible idéntico, ningún enlace perdido, y que
exista el fichero de cada imagen referenciada, **también las del CSS**.

**Un solo comando (`npm run todo`)** que genere, compile, valide y compare. No
se sube nada si no termina en `fallos: 0`.

---

# G. ANTES DE DESPLEGAR

- `netlify.toml` con **`X-Robots-Tag: noindex`** en toda la web de pruebas desde
  el primer día. Se quita el día de la mudanza.
- `trailingSlash: 'always'` y `build.format: 'directory'` en `astro.config.mjs`.
- Las direcciones absolutas del cuerpo pasan a relativas, **pero el enlace
  canónico y las etiquetas de redes sociales se quedan absolutos**.
- Comprueba que `datos/` está completo en el repositorio **antes** de empujar.

---

# H. LA FASE 2 (mejoras y diseño)

En renders.studio la Fase 2 hubo que deshacerla entera. Estas son las reglas
para que no vuelva a pasar.

## H1. El diseño no es una comprobación: es un gusto

Las cuatro comprobaciones dicen si la web está **bien copiada**. No dicen si
está **bonita**. Eso lo digo yo y solo yo.

Por tanto: **no apliques un rediseño y me lo enseñes después.** Enséñame
**dos o tres opciones en imagen** —la misma página, tratada de tres maneras— y
espera a que elija. Cuesta cinco minutos y ahorra tres rondas.

## H2. Una página, no ciento cuarenta y cinco

El rediseño se prueba en **una sola página** hasta que yo diga que sí. Después
se extiende al resto. Nunca al revés.

## H3. Todo detrás de un interruptor

El rediseño entero va en **una hoja propia que se carga la última**, enganchada
con **una línea** que se puede quitar. Nada de tocar el motor ni el HTML.

Esto funcionó: deshacerlo fue quitar dos líneas. Mantenlo.

Y recuerda A1: **quitar las líneas no es deshacerlo.** Hasta que yo no hago
`commit` y `push`, Netlify sigue enseñando lo anterior. Dímelo siempre.

## H4. Lo que aprendimos de diseño, por si sirve

- **Sobre una foto, la letra fina desaparece.** Ahí manda el peso, no la
  elegancia. Titulares de grosor 600 y una sombra suave, o un velo en
  degradado; nunca letra de 300.
- **La foto es el producto.** En una web de renders, oscurecer la foto para que
  se lea el texto es tirar el argumento de venta. Primero el velo mínimo que
  haga falta, y el texto que se defienda con su peso y su sombra.
- **Ojo con las tipografías y los iconos.** Si cambias `font-family` con
  `!important` sin excluir `<i>` y las clases `fa-`, `eicon-` e `icon-`, todos
  los iconos se convierten en cuadrados vacíos.
- **En Elementor casi todo el color y la tipografía están en variables** dentro
  de `post-{ID del kit}.css` (`--e-global-typography-*`, `--e-global-color-*`).
  Redefinirlas con `body.elementor-kit-{ID}` cambia media web sin `!important`.
  Lo que no vaya por variables sí necesitará `!important`, porque el CSS de
  cada página declara la tipografía elemento a elemento.
- **Barras negras y cristales esmerilados: no.** Una cabecera clara con un
  filete de pelo no llama la atención, que es lo que tiene que hacer.

## H5. Y si al final no gusta

No discutas: quita el interruptor, dime el comando para subirlo, y guarda la
hoja en la carpeta por si algún día se retoma. Lo que sí vale la pena conservar
son **los fallos reales que la comprobación encontró en la web actual**: esos
no son del rediseño y siguen ahí.

---

Empieza por la Fase 0. No escribas código todavía.
