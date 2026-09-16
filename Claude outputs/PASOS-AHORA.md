# Fotos e iconos: qué pasaba y qué hacer

## Lo que encontré

Son **dos cosas distintas**, las dos por ficheros que no estaban descargados.

**1. Las fotos de fondo (lo gordo).**
Las franjas grandes del sitio —la oscura de «Casa Prefabricada con contenedores
Marítimos», la de «Ventajas de las casas de Contenedores», la del presupuesto,
la del diseño en 3D— no llevan la foto en el texto de la página: la llevan
puesta desde la hoja de estilo. Mi descargador de imágenes solo miraba el
texto, así que **nunca pidió esas fotos**. Son solo 10 ficheros distintos, pero
se usan **1.295 veces** repartidas por casi las 263 páginas. Sin ellas, esas
franjas salen de color liso.

Ya está corregido: el descargador ahora mira también las hojas de estilo, y
**el validador da FALLO si falta alguna**, para que no se vuelva a colar.

**2. Los iconos.**
Los iconitos de las tarjetas (el rayo, el reloj de arena, la hoja…) son Font
Awesome, que es una *letra*, no una imagen. Sin su fichero el navegador dibuja
un cuadrado vacío. Lo baja `descargar-fuentes.mjs`, que es el script nuevo del
mensaje anterior.

He barrido las 7 páginas tipo: aparte de esto, **no falla ningún otro fichero**.

## Qué hacer

Descomprime `casascontenedores-fotos-e-iconos.zip` encima de
`C:\Users\Yaman\Desktop\casas-contenedores` (lleva también todo lo del mensaje
anterior, así que da igual si aquello ya lo aplicaste o no).

En Símbolo del sistema, de uno en uno:

```
cd C:\Users\Yaman\Desktop\casas-contenedores

powershell Expand-Archive -Path casascontenedores-fotos-e-iconos.zip -DestinationPath . -Force

npm run css

node scripts/descargar-imagenes.mjs

node scripts/descargar-fuentes.mjs

npm run todo
```

- El de **imágenes** bajará unas 32 fotos (las 10 de fondo y algunas sueltas).
- El de **fuentes** bajará 107 ficheros de letras e iconos. Tarda un par de
  minutos.

Cuando termine, `npm run todo` tiene que decir:

```
fallos: 0 | avisos: 1
VALIDACION SUPERADA: el 100 % de las paginas esta correcto.
Las 263 paginas tienen los mismos encabezados, en el mismo orden, que la web en vivo.
```

Si en «fallos» sigue apareciendo alguna *foto de fondo sin descargar*, dime cuál
y lo miro: querrá decir que esa foto ya no está en el servidor antiguo.

Con 0 fallos, ya puedes subirlo:

```
git add -A
git commit -m "Descarga tambien las fotos de fondo del CSS; validador las exige"
git push
```

## Pendiente de ti (no urgente)

- `src/data/site.json` → `formulario.accessKey`: mientras esté vacío, el botón
  del formulario dice «ESCRÍBENOS POR WHATSAPP» en vez de «ENVIAR». Se arregla
  con una clave gratuita de web3forms.com.
