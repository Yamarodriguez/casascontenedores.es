# Dos cosas que tienes que ejecutar tú, Yama

Desde donde yo trabajo **no puedo entrar en casascontenedores.es** (el cortafuegos
me lo bloquea). Necesito que bajes tú dos cosas de tu propia web. Son dos
órdenes y luego me pasas el resultado.

## Antes de nada: ¿tienes Node instalado?

Abre el **Símbolo del sistema** (tecla Windows, escribe `cmd`, Enter) y escribe:

```
node --version
```

- Si contesta algo como `v22.x.x` → perfecto, sigue abajo.
- Si dice que no reconoce la orden → descarga Node desde <https://nodejs.org>
  (el botón grande de la izquierda, "LTS"), instálalo dándole a Siguiente a
  todo, cierra la ventana negra y ábrela otra vez.

## Paso 1 — ponte en la carpeta

Descomprime este zip en el Escritorio. Te quedará una carpeta
`casascontenedores`. En la ventana negra escribe:

```
cd %USERPROFILE%\Desktop\casascontenedores
```

## Paso 2 — bajar las imágenes

```
node scripts/descargar-imagenes.mjs
```

Son **1.164 archivos**. Tarda entre 10 y 30 minutos según tu conexión. Se puede
cortar con Ctrl+C y volver a lanzar: no repite lo ya descargado. Al acabar te
dice `RESULTADO: { ok: ... }` y, si algo falló, lo apunta en
`imagenes-fallidas.txt`.

## Paso 3 — bajar la estructura de la web actual

```
node scripts/descargar-estructura.mjs
```

Esto tarda 2 o 3 minutos. Lee las 263 páginas de tu web tal como se ven hoy y
se queda solo con los títulos, los encabezados y las cuentas. Genera un fichero
`estructura-viva.json`. Lo necesito para comprobar, página por página, que la
web nueva tiene exactamente los mismos encabezados que la vieja.

## Paso 4 — bajar el diseño actual

```
node scripts/descargar-muestra.mjs
```

Medio minuto. Guarda en la carpeta `muestra-viva` el HTML completo de siete
páginas (una de cada tipo) y todas las hojas de estilo de la web. Como me has
pedido copia exacta del diseño, esto es lo que me deja ver los colores, las
tipografías y las medidas reales en vez de adivinarlas.

## Paso 5 — me lo devuelves

En el Explorador, dentro de la carpeta `casascontenedores`:

1. Selecciona la carpeta **`public`**, la carpeta **`muestra-viva`** y el
   archivo **`estructura-viva.json`**.
2. Botón derecho → **Enviar a** → **Carpeta comprimida (en zip)**.
3. Mueve ese zip a `Escritorio\casas-contenedores` (la carpeta que ya
   compartimos) y dímelo por el chat.

Si el zip se pasa de tamaño y no sube, dímelo y lo partimos en dos.
