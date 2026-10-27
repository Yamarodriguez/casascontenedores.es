/**
 * nuevas-ciudades.mjs — crea paginas de ciudad (casas y/o contenedores
 * maritimos) a partir de las de Adra, que hacen de plantilla: mismos bloques,
 * mismos h2 en el mismo orden (asi aplicar-local.mjs les mete despues sus
 * parrafos propios) y la localidad cambiada en titulo, h1, textos y mapa.
 *
 *   node scripts/nuevas-ciudades.mjs [lista.json] [--forzar]
 *
 * La lista (por defecto scripts/ciudades-nuevas.json) lleva dos grupos de
 * [slug, localidad, provincia]: "ambas" (casas y maritimos) y "maritimos"
 * (solo la de maritimos). No pisa una pagina existente salvo --forzar.
 * Despues: node scripts/aplicar-local.mjs <carpeta-de-textos>.
 */
import fs from 'node:fs';
import path from 'node:path';

const RAIZ = path.resolve('.');
const PAGINAS = path.join(RAIZ, 'src', 'content', 'pages');
const ZONAS = JSON.parse(fs.readFileSync(path.join(RAIZ, 'src/data/zonas.json'), 'utf8')).provincias;
const forzar = process.argv.includes('--forzar');
const fichero = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'scripts/ciudades-nuevas.json';
const lista = JSON.parse(fs.readFileSync(path.resolve(fichero), 'utf8'));

const leer = (slug) => fs.readFileSync(path.join(PAGINAS, `${slug}.json`), 'utf8');
const PLANTILLA = { casas: leer('adra'), maritimos: leer('contenedores-maritimos-adra') };

// el titulo SEO mas largo que quepa en 60 caracteres
const tituloSeo = (opciones) => opciones.find((t) => t.length <= 60) || opciones.at(-1);

function crear(familia, [slug, localidad, provincia]) {
  if (!ZONAS[provincia]) throw new Error(`${slug}: provincia ${provincia} no esta en zonas.json`);
  const ruta = familia === 'casas' ? slug : `contenedores-maritimos-${slug}`;
  const destino = path.join(PAGINAS, `${ruta}.json`);
  if (fs.existsSync(destino) && !forzar) { console.log(`ya existe ${ruta}.json (usa --forzar)`); return; }

  // "Adra" -> localidad en todo el texto (en el alt de la foto, con guiones)
  const enJson = (s) => JSON.stringify(s).slice(1, -1);
  let texto = PLANTILLA[familia]
    .replace(/(-contenedores-|-marítimos-)Adra/g, `$1${enJson(localidad.replace(/ /g, '-'))}`)
    .replace(/Adra/g, enJson(localidad));
  const p = JSON.parse(texto);
  delete p.local;
  delete p.postId;

  p.slug = ruta;
  p.ruta = `/${ruta}/`;
  p.localidad = localidad;
  p.provincia = provincia;
  // el mapa: localidad y provincia, para que no caiga en otra del mismo nombre
  const lugar = `${localidad}, ${ZONAS[provincia].nombre}`;
  const q = encodeURIComponent(lugar);
  p.cuerpo = p.cuerpo.replace(/maps\?q=[^&"]+/g, `maps?q=${q}`);
  const recorrer = (lista) => {
    for (const e of lista || []) {
      if (e?.t === 'seccion') for (const c of e.columnas || []) recorrer(c.elementos);
      else if (e?.t === 'mapa') e.direccion = lugar;
    }
  };
  recorrer(p.bloques);

  if (familia === 'casas') {
    p.tituloSeo = tituloSeo([
      `Casas contenedores en ${localidad}: llave en mano desde 600 €/m²`,
      `Casas contenedores en ${localidad}: llave en mano`,
      `Casas contenedores en ${localidad}`,
    ]);
  } else {
    p.tituloSeo = tituloSeo([
      `Contenedores marítimos en ${localidad}: venta, alquiler y precios`,
      `Contenedores marítimos en ${localidad}: venta y alquiler`,
      `Contenedores marítimos en ${localidad}`,
    ]);
  }
  fs.writeFileSync(destino, JSON.stringify(p, null, 1));
  console.log(`escrita ${ruta}.json`);
}

for (const c of lista.ambas || []) { crear('casas', c); crear('maritimos', c); }
for (const c of lista.maritimos || []) crear('maritimos', c);
