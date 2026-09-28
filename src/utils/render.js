/**
 * render.js — Pinta el arbol de maquetacion (`bloques`) de cada pagina.
 *
 * El arbol sale de Elementor (scripts/arbol.py). Aqui se pinta con marcado
 * PROPIO y el aspecto lo pone src/styles/diseno.css.
 *
 * LA REGLA DE ORO: el CONTENIDO no se toca. Cada encabezado conserva su
 * nivel (h1/h2/h3) y su texto exacto, cada parrafo su HTML, cada enlace su
 * destino, y todo en el mismo orden. Lo que cambia es la caja en la que va.
 *
 * RECONOCIMIENTO DE PATRONES
 * Elementor guardaba la maquetacion en su CSS, que ya no se carga. Sin el,
 * una rejilla de tarjetas llegaba como cuatro columnas grises con un titulo
 * blanco (invisible sobre blanco) y una foto; una fila de etiquetas, como
 * titulos blancos sueltos; la lista de ventajas, como diez parrafos en una
 * columna verde. Aqui se reconocen esas formas por su ESTRUCTURA (que
 * elementos tiene cada columna) y se pintan con el componente que les
 * corresponde. Los espaciadores y separadores del original no se pintan:
 * eran presentacion, y el ritmo vertical lo pone ahora la hoja de estilo.
 *
 * Anadir un tipo de bloque nuevo = anadir una funcion a PINTORES.
 * Anadir un patron nuevo = anadir un detector + un pintor de patron.
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

const textoPlano = (h) => String(h ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/* dentro de una tarjeta que ya es un enlace no puede ir otro enlace */
const sinEnlaces = (t) => String(t ?? '').replace(/<\/?a\b[^>]*>/gi, '');

const esBlanco = (c) => /^#(?:f{3}|f{6}|fefefe|fdfdfd|fcfcfc)$/i.test(String(c || '').trim());

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
function fondoDe(b, ctx) {
  const f = b.fondo;
  if (!f) return { pares: [], clases: [] };
  const pares = [];
  const clases = [];
  // un fondo blanco sobre pagina blanca no es un fondo: se ignora, para que
  // el bloque no se pinte como tarjeta con relleno
  const color = f.color && !esBlanco(f.color) ? f.color : '';
  if (color) pares.push(`--bl-color:${color}`);
  // una foto de fondo que no esta en public/ no se pide (evita un 404 por
  // pagina); queda el color del velo, que ya hacia de red de seguridad.
  // Antes de descartarla se prueba sin el sufijo "-scaled" de WordPress:
  // la portada del bloque 3D existe con ese nombre.
  let foto = f.imagen || '';
  if (foto && ctx?.existe && !ctx.existe(foto)) {
    const sin = foto.replace(/-scaled(\.\w+)$/, '$1');
    foto = sin !== foto && ctx.existe(sin) ? sin : '';
  }
  const hayFoto = Boolean(foto);
  if (hayFoto) {
    pares.push(`--bl-foto:url('${foto}')`);
    clases.push('con-foto');
    if (f.posicion) pares.push(`--bl-pos:${f.posicion}`);
    // una foto pequena (560 px) estirada a toda la pantalla se ve pixelada:
    // la hoja la desenfoca un poco bajo el velo
    const medida = ctx?.fotos?.[foto];
    if (medida && medida.ancho && medida.ancho < 1000) clases.push('con-foto-pequena');
    // El tamaño ("initial"), la repeticion y el "fijado" del original no se
    // respetan: una foto a tamaño natural y fija al scroll dejaba franjas
    // negras alrededor y da tirones en el movil. Siempre a sangre (cover).
  }
  if (f.velo) {
    pares.push(`--bl-velo:${f.velo}`);
    pares.push(`--bl-velo-op:${f.veloOpacidad ?? 0.5}`);
    clases.push('con-velo');
    // Red de seguridad: si el bloque lleva velo pero no color propio, se le
    // pone el color del velo DEBAJO de la foto. Asi, si la foto no carga (o
    // tarda), la franja sigue siendo oscura y el texto blanco se lee igual.
    if (!color) pares.push(`--bl-color:${f.velo}`);
  }
  if (color || hayFoto || f.velo) clases.push('con-fondo');
  // --bl-color se hereda (es una variable CSS): solo pinta el color de fondo
  // quien lo declara, no sus columnas de dentro
  if (color || f.velo) clases.push('con-color');
  return { pares, clases };
}

/* --------------------------------------------------------- limpieza de texto
   Tres paginas traen un <style> pegado a mano dentro de un widget de texto
   (con reglas para body y .card que se colaban en TODA la web) y una lista
   de preguntas con la respuesta en display:none y sin ningun script que la
   abriera. El <style> se quita; las preguntas pasan a <details>, que abre y
   cierra sin JavaScript. El texto y el nivel del encabezado no cambian. */
function limpiarTexto(html) {
  let h = String(html ?? '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
  h = h.replace(
    /<div class="faq-item">\s*<(h[2-4]) class="faq-question"[^>]*>([\s\S]*?)<\/\1>\s*<div class="faq-answer">([\s\S]*?)<\/div>\s*<\/div>/gi,
    (m, et, pregunta, respuesta) =>
      `<details class="faq-item"><summary><${et} class="faq-question">${pregunta.trim()}</${et}></summary>` +
      `<div class="faq-answer">${respuesta.trim()}</div></details>`,
  );
  return h;
}

/* ------------------------------------------------------------- los pintores
   Cada uno devuelve SOLO lo que va dentro del bloque.
   `clases` son clases adicionales para el <div> que lo envuelve. */

/* Los verdes claros que el original usaba en titulares (#52D457, #2EB340…)
   no se leen sobre blanco: pasan al verde de la marca. El resto de colores
   (el blanco de las franjas oscuras, los grises) se respeta. */
const VERDES_CLAROS = /^#(52d457|2eb340|51b95a|0bce1c|02e215|11b313|4caf50|8bc34a)$/i;
const colorTitular = (c) => (c && VERDES_CLAROS.test(String(c).trim()) ? '#0e7a3c' : c);

const PINTORES = {
  encabezado(b) {
    const etiqueta = ETIQUETAS.has(b.etiqueta) ? b.etiqueta : 'h2';
    const dentro = b.url
      ? `<a href="${escapar(b.url)}">${textoConLinea(b.texto)}</a>`
      : textoConLinea(b.texto);
    // El color del titular viene del arbol: en las franjas oscuras es blanco.
    const color = colorTitular(b.color);
    const s = estilo([color ? `color:${color}` : '']);
    return { html: `<${etiqueta} class="tit"${s}>${dentro}</${etiqueta}>` };
  },

  texto(b, ctx) {
    return { html: ctx.imagenes(limpiarTexto(b.html)) };
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

  // componentes interactivos (calculadora de hipoteca, presupuesto por pasos,
  // catalogo filtrable): la pagina los inserta en el sitio del marcador
  componente(b) {
    return { html: /^[a-z-]+$/.test(b.nombre || '') ? `<!--COMPONENTE:${b.nombre}-->` : '' };
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
    // galeria con fichas { src, miniatura, alt, ancho, alto, anchoGrande }: la
    // miniatura (la misma URL que servia WordPress) en la rejilla, la foto
    // grande en el srcset y en el enlace, que el visor (src/scripts/galeria.js)
    // abre en grande sin salir de la pagina
    if (Array.isArray(b.fotos)) {
      const fotos = b.fotos.map((f) => {
        const mini = f.miniatura || f.src;
        const srcset = f.miniatura && f.anchoGrande ? ` srcset="${escapar(f.miniatura)} ${f.ancho}w, ${escapar(f.src)} ${f.anchoGrande}w" sizes="(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 280px"` : '';
        const medidas = f.ancho && f.alto ? ` width="${f.ancho}" height="${f.alto}"` : '';
        return `<figure><a href="${escapar(f.src)}" data-galeria-foto>` +
          ctx.imagenes(`<img src="${escapar(mini)}"${srcset} alt="${escapar(f.alt || '')}"${medidas} loading="lazy" decoding="async">`) +
          '</a></figure>';
      }).join('');
      return { html: `<div class="galeria galeria--fotos" data-galeria data-cols="${b.columnas || 4}">${fotos}</div>` };
    }
    const fotos = b.imagenes
      .map((u) => '<figure>' +
        ctx.imagenes(`<img src="${escapar(u)}" alt="" loading="lazy" decoding="async">`) + '</figure>')
      .join('');
    return { html: `<div class="galeria" data-cols="${b.columnas || 4}">${fotos}</div>` };
  },

  ancla(b) {
    return { html: `<div class="ancla" id="${escapar(b.ancla)}"></div>` };
  },

  /* Preguntas frecuentes (contenido nuevo del campo "ampliacion"): acordeon
     nativo con <details>, sin JavaScript. La pregunta va en un h3 DENTRO del
     <summary> para conservar la jerarquia h2 > h3 que lee Google; la
     respuesta admite HTML sencillo (p, ul, strong, a). */
  faq(b) {
    const items = (b.items || []).filter((i) => i && i.pregunta && i.respuesta);
    if (!items.length) return { html: '' };
    const html = items.map((i) => {
      const respuesta = /^\s*<(p|ul|ol|table)\b/i.test(i.respuesta) ? i.respuesta : `<p>${i.respuesta}</p>`;
      return `<details class="faq-item"><summary><h3 class="faq-question">${textoConLinea(i.pregunta)}</h3></summary>` +
        `<div class="faq-answer">${respuesta}</div></details>`;
    }).join('');
    return { html: `<div class="faq-container">${html}</div>` };
  },
};

/* ----------------------------------------------------------- los detectores
   Miran los elementos "con peso" de una columna: todo menos espaciadores,
   separadores y anclas, que no cuentan para decidir que forma tiene. */

const SIN_PESO = new Set(['espaciador', 'separador', 'ancla']);
const conPeso = (col) => (col.elementos || []).filter((e) => !SIN_PESO.has(e.t));
const esTitulo = (e) => e.t === 'encabezado' && /^h[2-4]$/.test(e.etiqueta || 'h2');

/** Tarjeta de modelo: un titulo y una foto (y como mucho un texto corto). */
function esTarjeta(col) {
  const els = conPeso(col);
  if (els.length < 2 || els.length > 3) return null;
  const enc = els.find(esTitulo);
  const img = els.find((e) => e.t === 'imagen');
  const txt = els.find((e) => e.t === 'texto');
  if (!enc || !img) return null;
  if (els.length === 3 && !txt) return null;
  if (txt && textoPlano(txt.html).length > 260) return null;
  return { enc, img, txt };
}

/** Etiqueta: la columna es SOLO un titulo. */
function esEtiqueta(col) {
  const els = conPeso(col);
  return els.length === 1 && esTitulo(els[0]) ? els[0] : null;
}

/** Ventajas: tres o mas parejas titulo + texto, y nada mas. */
function esVentajas(col) {
  const els = conPeso(col);
  if (els.length < 6 || els.length % 2) return null;
  const pares = [];
  for (let i = 0; i < els.length; i += 2) {
    if (!esTitulo(els[i]) || els[i + 1].t !== 'texto') return null;
    pares.push([els[i], els[i + 1]]);
  }
  return pares;
}

/** Foto con boton: columna con foto de fondo y, como mucho, un boton dentro. */
function esFotoBoton(col) {
  if (!col.fondo?.imagen) return null;
  const els = conPeso(col);
  if (els.length === 0) return { boton: null };
  if (els.length === 1 && els[0].t === 'boton') return { boton: els[0] };
  return null;
}

/** Solo foto: la columna es una imagen (enlazada o no), a lo sumo con un
 *  boton debajo ("Haz clic aqui"), y nada mas. */
function esSoloFoto(col) {
  const els = conPeso(col);
  if (!els.length || els.length > 2 || els[0].t !== 'imagen') return null;
  if (els.length === 2 && els[1].t !== 'boton') return null;
  return { imagen: els[0], boton: els[1] || null };
}

/** Lista de enlaces: la columna es SOLO una <ul> de <li><a>…</a></li>
 *  (el directorio de localidades, repartido en cinco columnas). Devuelve los
 *  <li> tal cual, o null. */
function esListaEnlaces(col) {
  const els = conPeso(col);
  if (els.length !== 1 || els[0].t !== 'texto') return null;
  const html = String(els[0].html || '').trim();
  if (!/^<ul[^>]*>[\s\S]*<\/ul>$/i.test(html)) return null;
  const items = html.match(/<li\b[^>]*>[\s\S]*?<\/li>/gi) || [];
  if (items.length < 3) return null;
  if (!items.every((li) => /^<li\b[^>]*>\s*<a\b[^>]*>[\s\S]*?<\/a>\s*<\/li>$/i.test(li))) return null;
  return items;
}

/** "Casas de contenedores 90 m2" -> la entrada de src/data/modelos-m2.json
 *  para 90, si la pagina existe (ctx.modelosM2 la trae la ruta). */
function modeloPorSuperficie(enc, ctx) {
  if (!ctx.modelosM2) return null;
  // con el texto ORIGINAL del rotulo: uno reescrito ("Piscina contenedor para
  // tu casa de 90 m²", src/utils/renombres.js) sigue siendo la piscina
  const m = textoPlano(enc.textoOriginal ?? enc.texto).match(/(\d{2,3})\s*m\s*[²2]/i);
  return m ? ctx.modelosM2[m[1]] || null : null;
}

/** Caja de texto: titulo(s) y texto/boton, sin fotos. */
function esCaja(col) {
  const els = conPeso(col);
  if (!els.length || els.length > 6) return false;
  if (!els.some((e) => e.t === 'encabezado')) return false;
  return els.every((e) => ['encabezado', 'texto', 'boton'].includes(e.t));
}

/* ------------------------------------------------- pintores de los patrones */

function pintarModelos(tarjetas, ctx) {
  const items = tarjetas.map(({ enc, img, txt }) => {
    const url = img.url || enc.url || '';
    // un producto sobre fondo blanco (un contenedor recortado, una portada)
    // se ensena entero; una foto de verdad se recorta a la proporcion comun
    const producto = Boolean(ctx.fotos?.[img.src]?.blanco);
    const etiqueta = ETIQUETAS.has(enc.etiqueta) ? enc.etiqueta : 'h3';
    const foto = ctx.imagenes(
      `<img src="${escapar(img.src)}" alt="${escapar(img.alt || textoPlano(enc.texto))}" loading="lazy" decoding="async">`);
    const titulo = url ? textoConLinea(sinEnlaces(enc.texto)) : textoConLinea(enc.texto);
    const texto = txt ? `<div class="modelo__texto">${ctx.imagenes(limpiarTexto(url ? sinEnlaces(txt.html) : txt.html))}</div>` : '';
    const dentro = `<figure class="modelo__foto">${foto}</figure>` +
      `<div class="modelo__cuerpo"><${etiqueta} class="modelo__titulo">${titulo}</${etiqueta}>${texto}</div>`;
    const clase = producto ? 'modelo modelo--producto' : 'modelo';
    return url
      ? `<article class="${clase}"><a class="modelo__enlace" href="${escapar(url)}">${dentro}</a></article>`
      : `<article class="${clase}"><div class="modelo__enlace">${dentro}</div></article>`;
  }).join('');
  return `<div class="modelos" style="--n:${tarjetas.length}">${items}</div>`;
}

function pintarEtiquetas(encs) {
  const items = encs.map((e) => {
    const etiqueta = ETIQUETAS.has(e.etiqueta) ? e.etiqueta : 'h3';
    const dentro = e.url
      ? `<a href="${escapar(e.url)}">${textoConLinea(sinEnlaces(e.texto))}</a>`
      : textoConLinea(e.texto);
    return `<${etiqueta} class="etiqueta">${dentro}</${etiqueta}>`;
  }).join('');
  return `<div class="etiquetas">${items}</div>`;
}

function pintarVentajas(pares, ctx) {
  const items = pares.map(([enc, txt]) => {
    const etiqueta = ETIQUETAS.has(enc.etiqueta) ? enc.etiqueta : 'h3';
    return `<article class="ventaja">` +
      `<${etiqueta} class="ventaja__titulo">${textoConLinea(enc.texto)}</${etiqueta}>` +
      `<div class="ventaja__texto">${ctx.imagenes(limpiarTexto(txt.html))}</div></article>`;
  }).join('');
  return `<div class="ventajas">${items}</div>`;
}

/* ------------------------------------------------------------- el recorrido */

function pintarElemento(b, ctx, nivel, anchoPadre) {
  if (b.t === 'seccion') return pintarSeccion(b, ctx, nivel, anchoPadre);
  if (SIN_PESO.has(b.t) && b.t !== 'ancla') return '';
  const pintor = PINTORES[b.t];
  if (!pintor) return '';
  const { html, clases = [] } = pintor(b, ctx);
  if (html === '') return '';

  // Alineacion, color, fondo, borde y relleno: del arbol, no de una hoja ajena.
  const pares = [];
  // El justificado del original abre rios de blanco en columnas estrechas
  // (y en el movil, donde Elementor lo cambiaba por "alinearMovil"): en
  // bandera. El resto de alineaciones se respeta.
  if (b.alinear && b.alinear !== 'justify') pares.push(`text-align:${b.alinear}`);
  if (b.t === 'texto' && b.color) pares.push(`color:${b.color}`);
  if (b.relleno) pares.push(`padding:${b.relleno}`);
  // De los margenes del arbol solo se respetan los verticales positivos. Los
  // negativos eran apaños de Elementor para montar un bloque sobre otro; los
  // laterales (87 px, 100 px…) eran maquetacion de escritorio que en el
  // movil dejaba el texto en una columna de 150 px (Elementor los ponia a 0
  // ahi con "margenMovil"). Ahora el ancho lo da la columna.
  if (b.margen) {
    const l = String(b.margen).trim().split(/\s+/);
    const arriba = parseFloat(l[0]) > 0 ? l[0] : '0px';
    const abajo = parseFloat(l[2] ?? l[0]) > 0 ? (l[2] ?? l[0]) : '0px';
    if (arriba !== '0px' || abajo !== '0px') pares.push(`margin:${arriba} 0 ${abajo}`);
  }

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

function pintarColumna(c, ctx, nivel, ancho) {
  const { pares, clases } = fondoDe(c, ctx);
  pares.push(`--col:${Number(ancho).toFixed(3)}`);
  if (c.relleno) pares.push(`--col-relleno:${c.relleno}`);
  if (c.alinearVertical) pares.push(`justify-content:${c.alinearVertical === 'middle' ? 'center' : c.alinearVertical}`);

  let dentro;
  // la ampliacion (texto corrido nuevo) no pasa por los detectores: una
  // sucesion de h2 + parrafo no es una lista de ventajas
  const ventajas = c.sinPatrones ? null : esVentajas(c);
  const fotoBoton = c.sinPatrones ? null : esFotoBoton(c);
  if (ventajas) {
    clases.push('col--ventajas');
    dentro = pintarVentajas(ventajas, ctx);
  } else if (fotoBoton) {
    clases.push('col--foto');
    dentro = fotoBoton.boton ? `<div class="col--foto__accion">${pintarElemento(fotoBoton.boton, ctx, nivel + 1, ancho)}</div>` : '';
  } else {
    if ((c.elementos || []).some((e) => e.t === 'formulario')) clases.push('col--formulario');
    dentro = (c.elementos || []).map((e) => pintarElemento(e, ctx, nivel + 1, ancho)).join('');
  }
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
  // El margen superior de una seccion raiz lo pone diseno.css (el ritmo
  // entre secciones). Un "margin:0px 0px 0px 0px" en linea lo anulaba y
  // pegaba la franja a la anterior; asi que arriba nunca se emite y del
  // resto solo lo positivo.
  const l = String(s.margen).trim().split(/\s+/);
  const der = l[1] ?? l[0], aba = l[2] ?? l[0], izq = l[3] ?? der;
  const pares = [];
  if (parseFloat(aba) > 0) pares.push(`margin-bottom:${aba}`);
  if (parseFloat(der) > 0) pares.push(`margin-right:${der}`);
  if (parseFloat(izq) > 0) pares.push(`margin-left:${izq}`);
  return pares.join(';');
}

/** El <section> que envuelve cualquier bloque, con su fondo y su relleno. */
function envolver(s, ctx, nivel, dentro, extras = []) {
  const { pares, clases } = fondoDe(s, ctx);
  // El relleno de las secciones de primer nivel lo pone la hoja de estilo
  // (era el de Elementor, a menudo 0 porque el aire lo daban espaciadores
  // que ya no se pintan). En las anidadas se respeta.
  if (s.relleno && nivel > 0) pares.push(`--bl-relleno:${s.relleno}`);
  const m = margenDe(s, nivel);
  if (m) pares.push(m);
  if (s.altoMinimo) pares.push(`min-height:${s.altoMinimo}px`);
  const ancla = s.ancla ? ` id="${escapar(s.ancla)}"` : '';
  const todas = ['bloque',
    nivel === 0 ? 'bloque--raiz' : 'bloque--dentro',
    (s.disposicion || 'boxed') === 'full_width' ? 'bloque--ancho' : '',
    ...extras, ...clases].filter(Boolean).join(' ');
  return `<section class="${todas}"${ancla}${estilo(pares)}><div class="bloque-in">${dentro}</div></section>`;
}

function pintarSeccion(s, ctx, nivel, anchoPadre = 100) {
  // Las columnas que solo traian espaciadores (los huecos entre tarjetas del
  // original) no se pintan: el hueco lo pone la rejilla. Una columna con foto
  // de fondo si cuenta aunque no tenga nada dentro: la foto es contenido.
  const cols = (s.columnas || []).filter((c) => conPeso(c).length > 0 || c.fondo?.imagen);
  if (!cols.length) return '';

  // La ampliacion SEO (contenido nuevo al final de la pagina, campo
  // "ampliacion" del JSON): una columna de texto corrido, sin detectores.
  // Lo mismo para una seccion "libre" (la ficha de las paginas de modelo
  // nuevas): texto corrido en columna de lectura.
  if (s.ampliacion || s.libre) {
    cols.forEach((c) => { c.sinPatrones = true; });
    const columnas = cols.map((c) => pintarColumna(c, ctx, nivel, 100)).join('');
    return envolver(s, ctx, nivel, `<div class="fila" style="--n:1">${columnas}</div>`, [s.ampliacion ? 'bloque--ampliacion' : 'bloque--libre']);
  }

  // La foto de cabecera del original (la que ahora representa el heroe) no
  // se repite justo debajo de el.
  if (nivel === 0 && ctx.omitir && cols.length === 1) {
    const els = conPeso(cols[0]);
    if (els.length === 1 && els[0].t === 'imagen' && els[0].src === ctx.omitir) return '';
  }

  // --- patrones de seccion entera ---
  if (cols.length >= 2) {
    const tarjetas = cols.map(esTarjeta);
    if (tarjetas.every(Boolean)) return envolver(s, ctx, nivel, pintarModelos(tarjetas, ctx), ['bloque--modelos']);
  }
  // Un titulo suelto en blanco sobre una seccion SIN fondo era un rotulo que
  // perdio su color de fondo: pasa a chip. Con fondo propio es un titulo de
  // franja normal y se queda como esta.
  const etiquetas = cols.map(esEtiqueta);
  if (etiquetas.every(Boolean) && (cols.length >= 2 || (esBlanco(etiquetas[0].color) && !s.fondo))) {
    // Los rotulos de superficie ("Casas de contenedores 90 m2") tienen ahora
    // su pagina y su foto (src/data/modelos-m2.json): se pintan como
    // tarjetas, igual que "Casa con dos contenedores". El texto no cambia.
    const modelos = etiquetas.map((e) => modeloPorSuperficie(e, ctx));
    if (modelos.every(Boolean)) {
      const tarjetas = etiquetas.map((e, i) => ({ enc: { ...e, url: e.url || modelos[i].url }, img: { src: modelos[i].imagen, alt: modelos[i].alt, url: modelos[i].url }, txt: null }));
      return envolver(s, ctx, nivel, pintarModelos(tarjetas, ctx), ['bloque--modelos']);
    }
    const conEnlace = etiquetas.map((e, i) => (modelos[i] && !e.url ? { ...e, url: modelos[i].url } : e));
    return envolver(s, ctx, nivel, pintarEtiquetas(conEnlace), ['bloque--etiquetas']);
  }

  // El directorio de localidades: listas de enlaces en varias columnas pasan
  // a una sola nube de pastillas.
  const listas = cols.map(esListaEnlaces);
  if (listas.every(Boolean) && listas.flat().length >= 10) {
    const items = listas.flat().join('');
    return envolver(s, ctx, nivel, `<ul class="zonas">${items}</ul>`, ['bloque--zonas']);
  }

  const extras = [];
  if (cols.length === 2) {
    const [a, b] = cols;
    const foto = esSoloFoto(a) ? 0 : esSoloFoto(b) ? 1 : -1;
    if (foto >= 0 && esCaja(cols[1 - foto])) {
      extras.push('bloque--banda', foto === 0 ? 'bloque--banda-foto-izq' : 'bloque--banda-foto-der');
      const media = esSoloFoto(cols[foto]);
      if (media.boton) extras.push('bloque--banda-con-boton');
      if (ctx.fotos?.[media.imagen.src]?.blanco) extras.push('bloque--banda-producto');
    }
  }
  if (cols.some((c) => !c.sinPatrones && esVentajas(c))) extras.push('bloque--ventajas');
  if (cols.some((c) => (c.elementos || []).some((e) => e.t === 'formulario'))) extras.push('bloque--contacto');

  // Una fila anidada dentro de una columna estrecha (las dos cajas PERMISOS /
  // PLANOS, cada una con texto y foto) no cabe a dos columnas: se apila.
  const apilada = nivel > 0 && anchoPadre < 60;

  // Los anchos se reparten de nuevo entre las columnas que quedan (si se ha
  // quitado la del hueco, las demas crecen para ocupar la fila).
  const total = cols.reduce((n, c) => n + Number(c.ancho ?? c.anchoBase ?? 100), 0) || 100;
  const columnas = cols.map((c) => {
    const ancho = (Number(c.ancho ?? c.anchoBase ?? 100) / total) * 100;
    return pintarColumna(c, ctx, nivel, ancho);
  }).join('');

  const hueco = s.hueco || 'default';
  const fila = `<div class="fila fila--${hueco}${apilada ? ' fila--apilada' : ''}" style="--n:${cols.length}">${columnas}</div>`;
  return envolver(s, ctx, nivel, fila, extras);
}

/**
 * Pinta el arbol entero.
 * @param {Array} bloques   arbol de la pagina
 * @param {Object} opciones { imagenes, omitir, existe }
 *   imagenes: filtro para el HTML con <img> (saneado / webp)
 *   omitir:   ruta de la foto de cabecera que ya pinta el heroe
 *   existe:   (ruta) => bool, para no pedir fotos de fondo que faltan
 *   fotos:    src/data/imagenes.json (medidas y si el fondo es blanco)
 *   modelosM2: src/data/modelos-m2.json, solo con las entradas cuya pagina existe
 * @returns {{html: string, formularios: string[]}}
 */
export function pintar(bloques, { imagenes = (h) => h, omitir = '', existe = null, fotos = null, modelosM2 = null } = {}) {
  const ctx = { n: 0, imagenes, formularios: [], omitir, existe, fotos, modelosM2 };
  const html = (bloques || []).map((s) => pintarElemento(s, ctx, 0, 100)).join('\n');
  return { html, formularios: ctx.formularios };
}

/**
 * El <h1> de cada pagina es el del heroe (su titulo). 64 paginas traen ademas
 * un h1 dentro del contenido (el autor lo puso a mano en Elementor): baja a
 * h2 para que solo haya un h1, sin tocar su texto ni su sitio. Devuelve
 * cuantos ha bajado.
 */
export function rebajarH1(bloques) {
  let n = 0;
  const recorrer = (lista) => {
    for (const b of lista || []) {
      if (b.t === 'seccion') { for (const c of b.columnas || []) recorrer(c.elementos); continue; }
      if (b.t === 'encabezado' && b.etiqueta === 'h1') { b.etiqueta = 'h2'; n++; }
      if (b.t === 'texto' && /<h1\b/i.test(b.html || '')) {
        b.html = b.html.replace(/<h1\b([^>]*)>/gi, '<h2$1>').replace(/<\/h1>/gi, '</h2>');
        n++;
      }
    }
  };
  recorrer(bloques);
  return n;
}

/**
 * Convierte el campo "ampliacion" de una pagina (contenido SEO nuevo que va
 * al final, escrito en un formato sencillo) en una seccion del arbol:
 *
 *   ampliacion: {
 *     secciones: [{ nivel: 'h2'|'h3', titulo, html }, ...],
 *     faq: { titulo, items: [{ pregunta, respuesta }] }
 *   }
 *
 * Devuelve la seccion (para añadirla a `bloques`) y la lista de preguntas
 * (para el JSON-LD FAQPage de Base.astro), o null si no hay nada.
 */
export function seccionAmpliacion(ampliacion, { sinFaq = false } = {}) {
  if (!ampliacion) return null;
  const elementos = [];
  for (const s of ampliacion.secciones || []) {
    if (!s || !s.titulo) continue;
    elementos.push({ t: 'encabezado', etiqueta: s.nivel === 'h3' ? 'h3' : 'h2', texto: s.titulo });
    if (s.html) elementos.push({ t: 'texto', html: s.html });
  }
  const faq = (ampliacion.faq?.items || []).filter((i) => i && i.pregunta && i.respuesta);
  // Con `sinFaq` las preguntas no se pintan aqui: van dentro del acordeon que
  // la pagina ya tiene, para que no salgan dos h2 de "Preguntas frecuentes".
  if (faq.length && !sinFaq) {
    elementos.push({ t: 'encabezado', etiqueta: 'h2', texto: ampliacion.faq.titulo || 'Preguntas frecuentes' });
    elementos.push({ t: 'faq', items: faq });
  }
  if (!elementos.length) return faq.length ? { seccion: null, faq } : null;
  return {
    seccion: { t: 'seccion', id: 'ampliacion', ampliacion: true, ancla: 'mas-informacion', columnas: [{ ancho: 100, elementos }] },
    faq,
  };
}
