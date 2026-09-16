/**
 * render.js — Pinta el arbol de maquetacion (`bloques`) de cada pagina.
 *
 * El arbol sale de scripts/arbol.py, que lo saca del propio Elementor. Aqui
 * NO se decide nada de diseno: cada bloque se pinta con los valores que trae.
 * Lo que es comun a todos los bloques vive en global.css; lo que es propio de
 * un elemento concreto (un tamano de letra, un ancho de columna, un color)
 * sale como una regla CSS con su identificador, igual que hacia Elementor.
 *
 * Anadir un tipo de bloque nuevo = anadir una funcion a PINTORES. Nada mas.
 */

const ANCHO_POR_DEFECTO = 1140;     // .elementor-section-boxed de Elementor
const HUECO_POR_DEFECTO = 20;       // padding de columna (10px a cada lado)
const MARGEN_BLOQUE = 20;           // .elementor-widget:not(:last-child)

const escapar = (s) =>
  String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ETIQUETAS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span']);

/* Los titulos de Elementor pueden traer HTML por dentro (<strong>, <br>, un
   enlace). Escaparlo entero dejaba "<strong>Planos de..." a la vista. Se deja
   pasar solo un puñado de etiquetas de linea y se escapa el resto. */
const LINEA = /^<\/?(?:strong|b|em|i|u|br|span|small|sup|sub|a)(?:\s[^<>]*)?\/?>$/i;

function textoConLinea(t) {
  return String(t ?? '')
    .split(/(<[^<>]+>)/)
    .map((trozo) => (trozo.startsWith('<') && trozo.endsWith('>')
      ? (LINEA.test(trozo) ? trozo : escapar(trozo))
      : escapar(trozo)))
    .join('');
}

/** Acumula las reglas CSS propias de cada elemento. */
class Hoja {
  constructor() { this.normal = []; this.tablet = []; this.movil = []; }
  add(sel, decl, medio = 'normal') {
    // se prefija con .entrada para que estas reglas ganen siempre a las
    // generales de global.css, que se carga despues
    sel = sel.split(',').map((x) => `.entrada ${x.trim()}`).join(',');
    const cuerpo = Object.entries(decl)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${k}:${v}`)
      .join(';');
    if (cuerpo) this[medio].push(`${sel}{${cuerpo}}`);
  }
  toString() {
    const partes = [this.normal.join('\n')];
    if (this.tablet.length) partes.push(`@media (max-width:1024px){\n${this.tablet.join('\n')}\n}`);
    if (this.movil.length) partes.push(`@media (max-width:767px){\n${this.movil.join('\n')}\n}`);
    return partes.filter(Boolean).join('\n');
  }
}

/** Reglas que puede llevar cualquier bloque: alineacion, margenes, rellenos. */
function estiloComun(b, sel, hoja) {
  hoja.add(sel, {
    'text-align': b.alinear,
    margin: b.margen,
    padding: b.relleno,
  });
  hoja.add(sel, { 'text-align': b.alinearTablet, margin: b.margenTablet }, 'tablet');
  hoja.add(sel, { 'text-align': b.alinearMovil, margin: b.margenMovil, padding: b.rellenoMovil }, 'movil');
}

function estiloTexto(t, sel, hoja) {
  if (!t) return;
  hoja.add(sel, {
    'font-family': t.familia ? `'${t.familia}', sans-serif` : undefined,
    'font-size': t.tamano ? `${t.tamano}px` : undefined,
    'font-weight': t.peso,
    'line-height': t.interlineado ? `${t.interlineado}${t.interlineadoUnidad || 'em'}` : undefined,
    'letter-spacing': t.espaciado ? `${t.espaciado}px` : undefined,
    'text-transform': t.transformar,
    'font-style': t.estilo,
  });
  if (t.tamanoTablet) hoja.add(sel, { 'font-size': `${t.tamanoTablet}px` }, 'tablet');
  if (t.tamanoMovil) hoja.add(sel, { 'font-size': `${t.tamanoMovil}px` }, 'movil');
}

/* ------------------------------------------------------------- los pintores */

const PINTORES = {
  encabezado(b, sel, hoja, ctx) {
    const etiqueta = ETIQUETAS.has(b.etiqueta) ? b.etiqueta : 'h2';
    hoja.add(`${sel} .titulo`, { color: b.color });
    estiloTexto(b.tipo, `${sel} .titulo`, hoja);
    const dentro = b.url
      ? `<a href="${escapar(b.url)}">${textoConLinea(b.texto)}</a>`
      : textoConLinea(b.texto);
    return `<${etiqueta} class="titulo">${dentro}</${etiqueta}>`;
  },

  texto(b, sel, hoja, ctx) {
    hoja.add(`${sel}`, { color: b.color });
    estiloTexto(b.tipo, `${sel}`, hoja);
    return ctx.imagenes(b.html);
  },

  imagen(b, sel, hoja, ctx) {
    if (b.ancho) hoja.add(`${sel} img`, { width: b.ancho });
    if (b.anchoMovil) hoja.add(`${sel} img`, { width: b.anchoMovil }, 'movil');
    const img = ctx.imagenes(
      `<img src="${escapar(b.src)}" alt="${escapar(b.alt)}" loading="lazy" decoding="async">`);
    const cuerpo = b.url ? `<a href="${escapar(b.url)}">${img}</a>` : img;
    const pie = b.pie ? `<figcaption>${escapar(b.pie)}</figcaption>` : '';
    return `<figure class="figura">${cuerpo}${pie}</figure>`;
  },

  boton(b, sel, hoja) {
    hoja.add(`${sel} .boton`, {
      'background-color': b.fondo,
      color: b.colorTexto,
      'border-color': b.colorBorde,
      'border-width': b.grosorBorde,
      'border-style': b.grosorBorde ? 'solid' : undefined,
      'border-radius': b.radio,
      padding: b.rellenoBoton,
    });
    estiloTexto(b.tipo, `${sel} .boton`, hoja);
    if (b.fondoHover || b.colorHover) {
      hoja.add(`${sel} .boton:hover, ${sel} .boton:focus`, {
        'background-color': b.fondoHover,
        color: b.colorHover,
        'border-color': b.colorBordeHover,
      });
    }
    const externo = /^https?:\/\//.test(b.url) && !b.url.includes('casascontenedores.es');
    const extra = externo ? ' rel="noopener" target="_blank"' : '';
    return `<a class="boton" href="${escapar(b.url || '#')}"${extra}>${textoConLinea(b.texto)}</a>`;
  },

  separador(b, sel, hoja) {
    hoja.add(`${sel} .separador`, {
      'border-top-color': b.color,
      'border-top-width': `${b.grosor}px`,
      width: b.ancho,
      'margin-block': `${b.hueco ?? 15}px`,
    });
    return '<hr class="separador">';
  },

  espaciador(b, sel, hoja) {
    hoja.add(sel, { height: `${b.alto}px` });
    if (b.altoMovil != null) hoja.add(sel, { height: `${b.altoMovil}px` }, 'movil');
    return '';
  },

  mapa(b, sel, hoja, ctx) {
    hoja.add(`${sel} iframe`, { height: `${b.alto || 300}px` });
    const q = encodeURIComponent(b.direccion || '');
    return `<iframe class="mapa" loading="lazy" title="Mapa de ${escapar(b.direccion)}"` +
      ` src="https://maps.google.com/maps?q=${q}&t=m&z=${b.zoom || 10}&output=embed&iwloc=near"` +
      ` allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>`;
  },

  formulario(b, sel, hoja, ctx) {
    ctx.formularios.push(sel);
    return `<!--FORMULARIO:${sel}-->`;
  },

  video(b) {
    if (!b.url) return '';
    const yt = b.url.match(/(?:youtu\.be\/|v=)([\w-]{6,})/);
    if (yt) {
      return `<div class="video"><iframe loading="lazy" title="Vídeo"` +
        ` src="https://www.youtube-nocookie.com/embed/${yt[1]}" allowfullscreen></iframe></div>`;
    }
    return `<video class="video" controls preload="none" src="${escapar(b.url)}"></video>`;
  },

  galeria(b, sel, hoja, ctx) {
    hoja.add(`${sel} .galeria`, { '--columnas': b.columnas || 4 });
    const fotos = b.imagenes
      .map((u) => ctx.imagenes(`<img src="${escapar(u)}" alt="" loading="lazy" decoding="async">`))
      .join('');
    return `<div class="galeria">${fotos}</div>`;
  },

  ancla(b) {
    return `<span id="${escapar(b.ancla)}" class="ancla"></span>`;
  },
};

/* ------------------------------------------------------------- el recorrido */

function pintarElemento(b, hoja, ctx, nivel = 1) {
  if (b.t === 'seccion') return pintarSeccion(b, hoja, ctx, nivel > 0);
  const pintor = PINTORES[b.t];
  if (!pintor) return '';
  const sel = `.e-${b.id}`;
  estiloComun(b, sel, hoja);
  const dentro = pintor(b, sel, hoja, ctx);
  if (b.t === 'espaciador') return `<div class="bloque espaciador e-${b.id}"></div>`;
  if (!dentro) return '';
  const ancla = b.ancla && b.t !== 'ancla' ? ` id="${escapar(b.ancla)}"` : '';
  return `<div class="bloque bloque-${b.t} e-${b.id}"${ancla}>${dentro}</div>`;
}

function pintarColumna(c, hoja, ctx, i) {
  const id = `c${ctx.n++}`;
  const sel = `.${id}`;
  // el ancho va en `flex`, no en `width`: dentro de un contenedor flex es la
  // base la que manda, y un width con base 0 deja la columna en nada
  hoja.add(sel, {
    flex: c.ancho != null ? `0 0 ${c.ancho}%` : undefined,
    'max-width': c.ancho != null ? `${c.ancho}%` : undefined,
    padding: c.relleno,
    'background-color': c.fondo?.color,
    'justify-content': c.alinearVertical,
  });
  if (c.anchoTablet != null) {
    hoja.add(sel, { flex: `0 0 ${c.anchoTablet}%`, 'max-width': `${c.anchoTablet}%` }, 'tablet');
  }
  hoja.add(sel, {
    flex: c.anchoMovil != null ? `0 0 ${c.anchoMovil}%` : '0 0 100%',
    'max-width': c.anchoMovil != null ? `${c.anchoMovil}%` : '100%',
  }, 'movil');

  const dentro = c.elementos.map((e) => pintarElemento(e, hoja, ctx, 1)).join('');
  return `<div class="columna ${id}">${dentro}</div>`;
}

function pintarSeccion(s, hoja, ctx, anidada = false) {
  const sel = `.e-${s.id}`;
  // OJO: en Elementor la separacion entre columnas NO es un `gap` de flex,
  // es relleno de la propia columna. Ponerla como gap ademas del relleno
  // hacia que cuatro columnas del 25 % sumaran mas del 100 % y se partieran
  // las rejillas de tarjetas.
  const lados = s.hueco === 'no' ? 0
    : s.hueco === 'custom' ? (s.huecoPx ?? 0) / 2
      : HUECO_POR_DEFECTO / 2;
  const arriba = s.hueco === 'no' ? 0 : HUECO_POR_DEFECTO / 2;

  hoja.add(sel, {
    margin: s.margen,
    padding: s.relleno,
    'background-color': s.fondo?.color,
    'background-image': s.fondo?.imagen ? `url('${s.fondo.imagen}')` : undefined,
    'background-position': s.fondo?.posicion,
    'background-size': s.fondo?.tamano,
    'background-repeat': s.fondo?.repetir,
    'background-attachment': s.fondo?.fijado,
    'min-height': s.altoMinimo ? `${s.altoMinimo}px` : undefined,
  });
  if (s.margenMovil || s.rellenoMovil) {
    hoja.add(sel, { margin: s.margenMovil, padding: s.rellenoMovil }, 'movil');
  }
  if (s.fondo?.velo) {
    hoja.add(`${sel} > .velo`, {
      'background-color': s.fondo.velo,
      opacity: s.fondo.veloOpacidad ?? 0.5,
    });
  }
  hoja.add(`${sel} > .interior`, { 'max-width': `${s.ancho || ANCHO_POR_DEFECTO}px` });
  hoja.add(`${sel} > .interior > .columna`, { padding: `${arriba}px ${lados}px` });

  const columnas = (s.columnas || []).map((c, i) => pintarColumna(c, hoja, ctx, i)).join('');
  const velo = s.fondo?.velo ? '<div class="velo"></div>' : '';
  const clases = ['seccion', s.estirada ? 'estirada' : '', anidada ? 'anidada' : '', `e-${s.id}`]
    .filter(Boolean).join(' ');
  const ancla = s.ancla ? ` id="${escapar(s.ancla)}"` : '';
  return `<section class="${clases}"${ancla}>${velo}<div class="interior">${columnas}</div></section>`;
}

/**
 * Pinta el arbol entero.
 * @param {Array} bloques  arbol de la pagina
 * @param {Function} imagenes  funcion que sanea el HTML de imagenes (webp, marcador)
 * @returns {{html: string, css: string, formularios: string[]}}
 */
export function pintar(bloques, imagenes = (h) => h) {
  const hoja = new Hoja();
  const ctx = { n: 0, imagenes, formularios: [] };
  const html = (bloques || []).map((s) => pintarElemento(s, hoja, ctx, 0)).join('\n');
  return { html, css: hoja.toString(), formularios: ctx.formularios };
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
  const recorrer = (lista) => {
    for (const b of lista || []) {
      if (b.t === 'seccion') { for (const c of b.columnas || []) recorrer(c.elementos); }
      else if (b.t === 'encabezado') {
        if (!primero) primero = b;
        if (b.etiqueta === 'h1') b.etiqueta = 'h2';   // primero se bajan todos
      }
    }
  };
  recorrer(bloques);

  if (banda || !primero) return titulo;
  primero.etiqueta = 'h1';
  return primero.texto;
}

export default { pintar, asegurarH1 };
