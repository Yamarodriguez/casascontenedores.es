/**
 * render.js — Pinta el arbol de maquetacion (`bloques`) de cada pagina.
 *
 * QUE CAMBIO Y POR QUE
 * Hasta ahora este modulo escribia EL MISMO marcado que Elementor, para que
 * las 26 hojas de estilo originales encajaran encima. Eso daba una copia
 * fiel... y por eso la web seguia viendose exactamente igual que la vieja por
 * mucho que se le pusiera una capa de estilo encima: el aspecto lo mandaban
 * esas hojas, no nosotros.
 *
 * Ahora pinta marcado PROPIO y limpio, y el aspecto lo pone src/styles/
 * diseno.css. Del arbol se sacan los datos que antes vivian en el CSS de
 * Elementor —fondos, velos, colores de texto, alineacion, relleno— y se
 * escriben en el elemento como variables CSS. Asi las franjas oscuras siguen
 * siendo oscuras y el texto blanco sigue siendo blanco, sin cargar 900 KB de
 * hojas ajenas.
 *
 * LO QUE NO CAMBIA, Y ES LA REGLA DE ORO
 * El CONTENIDO no se toca. Cada encabezado conserva su nivel (h1/h2/h3) y su
 * texto exacto, cada parrafo su HTML, cada enlace su destino, y todo en el
 * mismo orden. Lo que cambia es la caja en la que va, nunca lo que dice.
 *
 * Anadir un tipo de bloque nuevo = anadir una funcion a PINTORES.
 */

const escapar = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ETIQUETAS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span']);

/* Los titulos de Elementor pueden traer HTML por dentro (<strong>, <br>, un
   enlace). Se deja pasar solo un puñado de etiquetas de linea; el resto se
   escapa. */
const LINEA = /^<\/?(?:strong|b|em|i|u|br|span|small|sup|sub|a)(?:\s[^<>]*)?\/?>$/i;

function textoConLinea(t) {
  return String(t ?? '')
    .split(/(<[^<>]+>)/)
    .map((trozo) => (trozo.startsWith('<') && trozo.endsWith('>')
      ? (LINEA.test(trozo) ? trozo : escapar(trozo))
      : escapar(trozo)))
    .join('');
}

/* ------------------------------------------------------- estilo desde datos */

/** Junta pares "prop:valor" saltandose los vacios. Devuelve ' style="..."'. */
function estilo(pares) {
  const txt = pares.filter(Boolean).join(';');
  return txt ? ` style="${escapar(txt)}"` : '';
}

/**
 * Fondo de una seccion o columna, sacado del arbol.
 *
 * El "velo" es la capa de color que Elementor pone POR ENCIMA de la foto para
 * que el texto blanco se lea. Aqui se pinta con un pseudoelemento desde el
 * CSS, y lo unico que viaja en el HTML son las dos variables que necesita.
 */
function fondoDe(b) {
  const f = b.fondo;
  if (!f) return { pares: [], clases: [] };
  const pares = [];
  const clases = [];
  if (f.color) pares.push(`--bl-color:${f.color}`);
  if (f.imagen) {
    pares.push(`--bl-foto:url('${f.imagen}')`);
    clases.push('con-foto');
    if (f.posicion) pares.push(`--bl-pos:${f.posicion}`);
    if (f.tamano) pares.push(`--bl-tam:${f.tamano}`);
    if (f.repetir) pares.push(`--bl-rep:${f.repetir}`);
    if (f.fijado === 'fixed') clases.push('foto-fija');
  }
  if (f.velo) {
    pares.push(`--bl-velo:${f.velo}`);
    pares.push(`--bl-velo-op:${f.veloOpacidad ?? 0.5}`);
    clases.push('con-velo');
    // Red de seguridad: si el bloque lleva velo pero no color propio, se le
    // pone el color del velo DEBAJO de la foto. Asi, si la foto no carga (o
    // tarda), la franja sigue siendo oscura y el texto blanco se lee igual.
    // Sin esto, una foto que falla deja letra blanca sobre blanco.
    if (!f.color) pares.push(`--bl-color:${f.velo}`);
  }
  if (f.color || f.imagen || f.velo) clases.push('con-fondo');
  return { pares, clases };
}

/* ------------------------------------------------------------- los pintores
   Cada uno devuelve SOLO lo que va dentro del bloque.
   `clases` son clases adicionales para el <div> que lo envuelve. */

const PINTORES = {
  encabezado(b) {
    const etiqueta = ETIQUETAS.has(b.etiqueta) ? b.etiqueta : 'h2';
    const dentro = b.url
      ? `<a href="${escapar(b.url)}">${textoConLinea(b.texto)}</a>`
      : textoConLinea(b.texto);
    // El color del titular viene del arbol: en las franjas oscuras es blanco.
    const s = estilo([b.color ? `color:${b.color}` : '']);
    return { html: `<${etiqueta} class="tit"${s}>${dentro}</${etiqueta}>` };
  },

  texto(b, ctx) {
    return { html: ctx.imagenes(b.html) };
  },

  imagen(b, ctx) {
    const img = ctx.imagenes(
      `<img src="${escapar(b.src)}" alt="${escapar(b.alt)}" loading="lazy" decoding="async">`);
    const cuerpo = b.url ? `<a href="${escapar(b.url)}">${img}</a>` : img;
    const pie = b.pie ? `<figcaption class="pie-foto">${escapar(b.pie)}</figcaption>` : '';
    return { html: pie ? `<figure class="foto">${cuerpo}${pie}</figure>` : cuerpo };
  },

  boton(b) {
    const externo = /^https?:\/\//.test(b.url) && !b.url.includes('casascontenedores.es');
    const extra = externo ? ' rel="noopener" target="_blank"' : '';
    return {
      clases: b.alinear ? [`al-${b.alinear}`] : [],
      html: `<a class="boton" href="${escapar(b.url || '#')}"${extra}>${textoConLinea(b.texto)}</a>`,
    };
  },

  separador() {
    return { clases: ['es-separador'], html: '<hr class="filete">' };
  },

  espaciador(b) {
    const alto = Number(b.alto);
    return { html: `<div class="hueco"${estilo([alto ? `height:${alto}px` : ''])}></div>` };
  },

  mapa(b) {
    const q = encodeURIComponent(b.direccion || '');
    return {
      html: '<div class="mapa">' +
        `<iframe loading="lazy" title="${escapar(b.direccion)}" aria-label="${escapar(b.direccion)}"` +
        ` src="https://maps.google.com/maps?q=${q}&amp;t=m&amp;z=${b.zoom || 10}&amp;output=embed&amp;iwloc=near"` +
        ' referrerpolicy="no-referrer-when-downgrade"></iframe></div>',
    };
  },

  formulario(b, ctx) {
    ctx.formularios.push(b.id);
    return { html: `<!--FORMULARIO:${b.id}-->` };
  },

  video(b) {
    if (!b.url) return { html: '' };
    const yt = b.url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
    if (yt) {
      return {
        html: '<div class="video">' +
          '<iframe loading="lazy" title="Vídeo"' +
          ` src="https://www.youtube-nocookie.com/embed/${yt[1]}" allowfullscreen></iframe></div>`,
      };
    }
    return {
      html: `<div class="video"><video controls preload="none" src="${escapar(b.url)}"></video></div>`,
    };
  },

  galeria(b, ctx) {
    const fotos = b.imagenes
      .map((u) => '<figure>' +
        ctx.imagenes(`<img src="${escapar(u)}" alt="" loading="lazy" decoding="async">`) + '</figure>')
      .join('');
    return { html: `<div class="galeria" data-cols="${b.columnas || 4}">${fotos}</div>` };
  },

  ancla(b) {
    return { html: `<div class="ancla" id="${escapar(b.ancla)}"></div>` };
  },
};

/* ------------------------------------------------------------- el recorrido */

function pintarElemento(b, ctx, nivel) {
  if (b.t === 'seccion') return pintarSeccion(b, ctx, nivel);
  const pintor = PINTORES[b.t];
  if (!pintor) return '';
  const { html, clases = [] } = pintor(b, ctx);
  if (html === '') return '';

  // Alineacion, color, fondo, borde y relleno: del arbol, no de una hoja ajena.
  const pares = [];
  if (b.alinear) pares.push(`text-align:${b.alinear}`);
  if (b.t === 'texto' && b.color) pares.push(`color:${b.color}`);
  if (b.relleno) pares.push(`padding:${b.relleno}`);
  if (b.margen) pares.push(`margin:${b.margen}`);

  // El fondo del propio widget: es lo que convierte en tarjeta gris los
  // bloques de la portada. Sin esto sus titulos blancos quedan sobre blanco.
  const extras = [];
  if (b.fondo?.color) { pares.push(`background-color:${b.fondo.color}`); extras.push('con-fondo'); }
  if (b.fondo?.imagen) {
    pares.push(`background-image:url('${b.fondo.imagen}')`);
    pares.push('background-size:cover', 'background-position:center');
    extras.push('con-fondo');
  }
  if (b.borde) {
    if (b.borde.tipo && b.borde.tipo !== 'none') pares.push(`border-style:${b.borde.tipo}`);
    if (b.borde.ancho) pares.push(`border-width:${b.borde.ancho}`);
    if (b.borde.color) pares.push(`border-color:${b.borde.color}`);
    if (b.borde.radio) pares.push(`border-radius:${b.borde.radio}`);
  }

  const todas = ['b', `b--${b.t}`, ...clases, ...extras].join(' ');
  return `<div class="${todas}"${estilo(pares)}>${html}</div>`;
}

function pintarColumna(c, ctx, nivel) {
  const { pares, clases } = fondoDe(c);
  // El ancho que el usuario dio a la columna. La rejilla lo usa como base;
  // en movil todas pasan a una sola columna (lo hace el CSS).
  const ancho = c.ancho ?? c.anchoBase ?? 100;
  pares.push(`--col:${Number(ancho).toFixed(3)}`);
  if (c.relleno) pares.push(`--col-relleno:${c.relleno}`);
  if (c.alinearVertical) pares.push(`justify-content:${c.alinearVertical === 'middle' ? 'center' : c.alinearVertical}`);

  const dentro = (c.elementos || []).map((e) => pintarElemento(e, ctx, nivel + 1)).join('');
  return `<div class="${['col', ...clases].join(' ')}"${estilo(pares)}>${dentro}</div>`;
}

/**
 * Margen de una seccion, con el margen superior NEGATIVO anulado en las
 * secciones de primer nivel.
 *
 * Por que: varias paginas traian `margin-top:-84px` en su primera seccion. Ese
 * numero lo puso el autor para que la foto principal se comiera la franja gris
 * del tema de WordPress. Esa franja ya no existe, asi que el margen negativo
 * ya no compensa nada: sube la foto y la mete DEBAJO de la barra del menu.
 */
function margenDe(s, nivel) {
  if (!s.margen) return '';
  if (nivel !== 0) return `margin:${s.margen}`;
  const lados = String(s.margen).trim().split(/\s+/);
  if (lados.length && parseFloat(lados[0]) < 0) lados[0] = '0px';
  return `margin:${lados.join(' ')}`;
}

function pintarSeccion(s, ctx, nivel) {
  const { pares, clases } = fondoDe(s);
  if (s.relleno) pares.push(`--bl-relleno:${s.relleno}`);
  const m = margenDe(s, nivel);
  if (m) pares.push(m);
  if (s.altoMinimo) pares.push(`min-height:${s.altoMinimo}px`);

  const hueco = s.hueco || 'default';
  const cols = s.columnas || [];
  const columnas = cols.map((c) => pintarColumna(c, ctx, nivel)).join('');
  const ancla = s.ancla ? ` id="${escapar(s.ancla)}"` : '';

  const todas = ['bloque',
    nivel === 0 ? 'bloque--raiz' : 'bloque--dentro',
    (s.disposicion || 'boxed') === 'full_width' ? 'bloque--ancho' : '',
    ...clases].filter(Boolean).join(' ');

  return `<section class="${todas}"${ancla}${estilo(pares)}>` +
    // El numero de columnas viaja al CSS: sin el, no se puede descontar el
    // hueco del ancho de cada una y una fila de cuatro al 25 % se parte.
    `<div class="bloque-in"><div class="fila fila--${hueco}" style="--n:${cols.length || 1}">` +
    `${columnas}</div></div></section>`;
}

/**
 * Pinta el arbol entero.
 * @param {Array} bloques   arbol de la pagina
 * @param {Object} opciones { imagenes, postId }
 * @returns {{html: string, formularios: string[]}}
 */
export function pintar(bloques, { imagenes = (h) => h } = {}) {
  const ctx = { n: 0, imagenes, formularios: [] };
  const html = (bloques || []).map((s) => pintarElemento(s, ctx, 0)).join('\n');
  return { html, formularios: ctx.formularios };
}

/**
 * Deja exactamente un <h1> en la pagina.
 *  - Si la pagina enseña la banda de titulo del tema, el H1 es el de la banda
 *    y los encabezados del contenido se quedan como estan.
 *  - Si no la enseña, el PRIMER encabezado del contenido asciende a h1, sin
 *    cambiar su texto ni su sitio.
 * Devuelve el texto del H1.
 */
export function asegurarH1(bloques, banda, titulo) {
  let primero = null;
  const buscar = (lista) => {
    for (const b of lista || []) {
      if (primero) return;
      if (b.t === 'encabezado') { primero = b; return; }
      if (b.t === 'seccion') for (const c of b.columnas || []) buscar(c.elementos);
    }
  };
  buscar(bloques);

  if (banda) return titulo;
  if (!primero) return titulo;
  primero.etiqueta = 'h1';
  return String(primero.texto || titulo).replace(/<[^>]+>/g, '').trim() || titulo;
}
