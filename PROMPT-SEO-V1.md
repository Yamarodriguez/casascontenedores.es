# Prompt para repetir en otra web el análisis SEO y los cambios de casascontenedores.es (versión 1)

Sale del trabajo SEO hecho en casascontenedores.es del 17 al 28 de septiembre
de 2026: 24 flujos de agentes, 283 páginas ampliadas con 208.414 palabras
nuevas, 24 páginas nuevas, 718 encabezados renombrados, una auditoría de 27
acciones y las correcciones que salieron de ella. Lo reconstruyeron seis
agentes a partir de los scripts, los ficheros de trabajo, git y las
conversaciones; otros seis lo verificaron y corrigieron 102 cosas. El detalle,
fase a fase y con fichero y línea, está en `analisis/ANALISIS-SEO-CASAS.md`.

**El orden de las fases de aquí NO es el que seguimos: es el que habría
ahorrado los errores.** Lo que se hizo tarde (limpiar el original, fijar las
cifras, las páginas nuevas antes que las ampliaciones) va ahora al principio.

---

## PARA TI, YAMA: cómo se usa

1. La web tiene que estar **ya migrada a Astro con el método de
   `PROMPT-MIGRACION-V5.md`**: una página = un JSON en `src/content/pages/`,
   un motor que pinta, `npm run todo` en verde. Si la web es otra cosa, vale
   la parte de **análisis** (Fases 1, 4, 5, 6 y 13) tal cual, y los cambios
   hay que adaptarlos al sistema que tenga.
2. Copia a la carpeta del proyecto el contenido de `kit-seo-v1.zip`
   descomprimido: este fichero, `analisis/`, `flujos/` (los 22 flujos de
   agentes con sus prompts literales), `herramientas/` (los scripts de medida
   y corrección que no estaban en el repositorio) y `kit/` (scripts, motor,
   componentes y datos de ejemplo).
3. Rellena la **sección 1**. Lo más importante son los **datos reales**:
   sin ellos, Claude escribe sin cifras y remite al presupuesto. En
   casascontenedores nunca llegaron, y precios y plazos siguen pendientes.
4. Abre Claude Code en la carpeta y pega el mensaje de abajo.

### El mensaje para la primera sesión

```
Quiero hacer en [DOMINIO] el mismo análisis SEO y los mismos cambios que se
hicieron en casascontenedores.es. El método está en PROMPT-SEO-V1.md: léelo
entero antes de nada. Soy el propietario y no soy técnico: háblame en
castellano de España, de tú y sin jerga, y hazlo tú.

La web vende [PRODUCTOS O SERVICIOS] en [ZONA]. Las palabras clave
principales son [PALABRAS CLAVE]. Las familias (silos) de páginas son
[FAMILIAS, p. ej. "casas con contenedores" y "contenedores marítimos"].
[Tiene / no tiene] páginas por localidad.

Competidores que salen en Google por delante: [URLS, de 3 a 6, TODOS ahora].

Datos reales que puedes usar (las únicas cifras permitidas):
[PRECIOS, PLAZOS, SERVICIOS, ZONAS, GARANTÍAS, OBRAS, EQUIPO... o "ninguno
todavía: no inventes ninguno y remite al presupuesto"].

Normas y hechos del sector que sí se pueden citar: [LEYES, NORMAS,
MEDIDAS ESTÁNDAR... o "averígualo y enséñame la lista antes de usarla"].

Decisiones: las de la sección 0 del prompt, salvo: [nada / lo que cambies].

Empieza por la FASE 0: hazme el cuestionario con todo lo que te falte, en un
solo mensaje. No cambies nada en la web hasta que apruebe el plan.
```

### Para las sesiones siguientes

Una sesión por fase:

```
Lee CLAUDE.md y empieza la Fase [N] de PROMPT-SEO-V1.md.
```

---

# 0. DECISIONES (con su opción por defecto)

| Decisión | Qué significa para ti | Por defecto | Alternativa |
|---|---|---|---|
| **Dec. 1** — Contenido original | Si se toca el texto que ya tenía la web | **No se toca.** Todo lo nuevo se añade **al final** de cada página o alrededor | Se toca solo lo que tú apruebes, una cosa por una, por escrito |
| **Dec. 2** — Encabezados | Si los h2/h3 originales pueden cambiar de texto | **Sí, por un mapa de renombres** que tú apruebas, para que nombren la palabra clave de su página | No se renombran |
| **Dec. 3** — Cifras | Qué números pueden salir en lo nuevo | **Solo los que tú des** y los hechos del sector verificables. Lo demás, «lo indica el presupuesto» | Promediar las cifras que la web ya publica, **enseñándotelas antes de aplicar** |
| **Dec. 4** — Páginas de localidad | Qué se hace con las páginas por ciudad | **Se enriquecen con datos locales verificados** (ficha por ciudad) | Las que no traen tráfico se consolidan (redirección o sin indexar) |
| **Dec. 5** — Bloques repetidos | Qué bloques de la portada se repiten en todas las páginas | **Solo los de su familia, achicados**, con cabecera distinta por tipo de página | Todos en todas (en casascontenedores la FAQ de casas pesaba el 40 % del texto en las ciudades de contenedores) |
| **Dec. 6** — Publicar | Cuándo sube lo nuevo | **Solo lo aprobado, desde una rama, una vez por fase** | Publicar lo que haya (dejó borradores sin verificar en la web tres veces) |
| **Dec. 7** — Quién sube a `main` | | **Claude**, con `npm run todo` a 0 fallos | Tú |

---

# 1. LO QUE TIENES QUE TENER TÚ (se pide todo en la Fase 0)

Cada cosa que falte se pidió después a trozos o se quedó sin hacer. Entre
corchetes, lo que pasó en casascontenedores.

## Datos reales
- [ ] **Cifras, UNA por concepto**: precio por unidad, por m², por modelo o
      por servicio; con o sin IVA; qué incluye y qué va aparte; plazo real
      separando fabricación, permisos y entrega; tarifas de transporte;
      condiciones de alquiler o financiación; fecha de revisión.
      [Nunca llegaron. La web decía 600-800 €/m², y 3-6, 4-7 y 6-8 meses según
      la página.]
- [ ] **Qué vendes de verdad**: productos, tipos, servicios y zonas. Lo que
      no hagas no se publica. [Los 9 servicios se dedujeron de un competidor;
      «Descarga GRATIS en PDF» prometía un catálogo que no existe en ~149
      páginas.]
- [ ] **Identidad y confianza**: razón social, NIF, dirección, teléfono
      visible y horario, quién hace el trabajo, equipo, garantía escrita,
      obras reales con localidad y fotos propias, reseñas, perfil de
      Google. [Todo sin dar; el aviso legal decía otra actividad.]
- [ ] **Hechos del sector** que se pueden citar: normas, leyes, medidas
      estándar. [ISO 668, LOE, CTE, leyes del suelo de cada comunidad, ICIO.]
- [ ] **Frases de la web que hay que confirmar o quitar**: Claude las saca en
      la Fase 1. [«arquitectos colegiados», «financiación flexible», «50
      años», «materiales de Bauhaus».]

## Decisiones
- [ ] **Qué se puede tocar del original** (Dec. 1 y 2) y qué queda prohibido.
- [ ] **Lista COMPLETA de competidores**, de una vez. [Un flujo se abortó a los
      32 segundos porque llegaron tres más 21 segundos después.]
- [ ] **Dominios hermanos**: si tienes otra web, qué dominio quieres
      posicionar para cada búsqueda y adónde van sus enlaces. [355 enlaces
      salían a prefabricadascasas.es.]
- [ ] **Bloques repetidos** (Dec. 5) y **páginas dudosas**: en otro idioma,
      otro país, duplicadas entre sí, con avisos de «próximamente» o «en
      obras». [/container-homes/, /argentina/, /interior/ frente a
      /por-dentro/, /pergolas/, /casas-prefabricadas/.]
- [ ] **Títulos y descripciones**: permiso para reescribirlos por fases con
      Search Console. [153 títulos de más de 60 caracteres y 258
      descripciones con emojis siguen igual; 21 propuestas sin respuesta.]
- [ ] **Fotos**: permiso para descargar de la web vieja lo que falte, y para
      usar fotos con licencia libre donde no haya foto propia.
- [ ] **Cómo contestas**: todas las preguntas juntas y numeradas («1 sí, 2 no,
      3 sí pero sin enlaces»).

## Herramientas que tienen que funcionar
- [ ] **Formulario que envía de verdad** a un correo que funciona, con la
      clave del servicio (Web3Forms u otro). [Fue el primer fallo de la lista
      de competencia; la clave llegó el último día.]
- [ ] **Search Console** verificado, con el export de Rendimiento → Páginas y
      Consultas (16 meses). **Analytics** con conversiones. **Correo del
      dominio** funcionando. **Aviso de cookies** antes de Analytics y
      AdSense. [Todo apareció como urgente en la auditoría final.]
- [ ] Si la web vive de contactos, AdSense fuera de las páginas de
      conversión.

---

# A. REGLAS INNEGOCIABLES

Van en **todos** los encargos a agentes, casi literales. En
`flujos/` están los prompts completos.

## A1. El contenido original
1. **No se toca**: ni un texto, ni un título, ni el nivel de un encabezado, ni
   un enlace, ni el orden. Se **añade al final** (campo `ampliacion`) o
   alrededor (bloques que pinta el motor desde `src/data/`).
2. Excepciones, solo con permiso escrito del propietario y una por una:
   renombrar encabezados por `encabezados.json` (Dec. 2); erratas, voseo o
   «usted» por `erratas.json`; reescribir un párrafo que contradiga al resto
   de la web; cambiar un enlace o un botón; reordenar una rejilla.
   Cada excepción: **regla en un fichero de datos, script que se puede
   ejecutar dos veces sin estropear nada, pasada en seco con recuento y 5
   ejemplos, commit propio «(pedido por el propietario)»**.
3. **El comparador de encabezados sigue exigiendo 100 % idénticos** con la
   web viva; cada cambio autorizado se documenta como «cambio permitido» en
   datos (`encabezados.json`, `orden-tipos.json`, `erratas.json`), nunca
   relajando la comprobación.

## A2. Cifras y hechos
4. **CERO CIFRAS INVENTADAS.** Prohibido escribir precios, euros,
   porcentajes, plazos en días, semanas, meses o años, «X años de
   experiencia», «X obras o clientes», temperaturas, consumos, distancias,
   poblaciones, pesos o medidas, **salvo la LISTA BLANCA** del encargo: los
   datos del propietario y los hechos del sector verificables. **La lista
   blanca se escribe completa y explícita desde el principio, con lo que SÍ
   se permite**: en casascontenedores faltaron los códigos de carretera
   (A-1, AP-68), los artículos de ley, los nombres de puertos de la ficha y
   «sumas directas de medidas», y cada uno produjo rechazos falsos. Cuando se
   cite una cifra de la propia web, se dice **la página exacta de la que
   sale** («4-7 meses» se atribuyó a `/precios/` y salía de otra página).
5. **No repetir ni reforzar afirmaciones de la web que no se puedan
   verificar** (precios antiguos, plazos distintos por página, «50 años»,
   «bancos que aprueban»). Tampoco contradecirlas: no citarlas, y remitir a
   la página que las publica o al presupuesto.
6. **Nada de promesas**: ni «en 24 horas», ni «garantía de X», ni «técnicos
   certificados», ni «los mejores», ni «líderes», ni cobertura distinta de
   la real; nunca sede, depósito, stock, visitas ni plazos locales. Solo lo
   que la página del propio servicio diga.
7. **Decir qué afirmar, no solo qué prohibir.** Prohibir «depósito propio»
   más la plantilla «zona de servicio, no sede» produjo «No tenemos depósito
   propio en X» en 13 páginas y preguntas-plantilla idénticas. Se da la
   fórmula positiva («zona de servicio, presupuesto puesto en destino») y se
   prohíbe mencionar el concepto.
8. **Comprobación de hechos legales tras redactar**, con una lista de
   afirmaciones sensibles del sector. Las falsedades plausibles pasan el
   verificador porque no son cifras: «sin cédula no puedes empadronarte» (6
   páginas, dos veces por página), «cimentar mientras se tramita la
   licencia», «la placa CSC certifica ISO 668», «Ley de Ordenación de
   Edificios». Cuando aparece una, **se busca en todo el sitio** y se repite
   el grep tras corregir (quedaban 2).

## A3. Idioma y forma
9. **Español de España con tuteo** (tú, puedes, elige, pide). Prohibido:
   voseo (elegí, podés, vos, adaptá, acá, tenés, recibís, accedé), «usted» y
   americanismos (costos, piso por vivienda, plomería, aberturas, aislación,
   factibilidad, ingresa, financiamiento, sustentable, celular, plata,
   departamento, living, «a la brevedad», habitacional, medidor). Sin
   erratas, sin emojis, separadores españoles (30.480 kg, 2,44 m), sin
   relleno («en este artículo exploraremos»), mayúsculas solo al principio y
   en nombres propios.
10. **Sin keyword stuffing**: la palabra clave exacta, natural, en el h2 de
    apertura y **como mucho 6 veces** en una ampliación contando títulos, FAQ
    y enlaces (**8** en una página nueva, **12** donde el tipo va en todos los
    h2). Se fija en la regla **qué campos cuentan**. Títulos de sección
    naturales, en pregunta o promesa concreta.
11. **h3 en forma de pregunta**: al menos 2 (mejor 3; ≥3 en página nueva, ≥4
    en modelo ampliado), con `¿…?`, cada uno como elemento aparte justo
    debajo del h2 al que pertenece, respuesta directa en la primera frase.
    Un h3 nunca abre ni queda huérfano; sus preguntas no se repiten en la FAQ.
12. **Negritas SEO**: `<strong>` sobre la expresión clave de 2 a 5 palabras,
    como máximo una por párrafo o `<li>`, **entre 4 y 12** por ampliación
    (5-14 en página nueva, 8-14 en modelo). Nunca una sola palabra ni un
    código («A-62», «DB-HE»), nunca frases enteras. Las negritas que ya
    existan en listas no cuentan.
13. **HTML permitido**: `p`, `ul`, `ol`, `li`, `strong`, `em`, `a` (solo rutas
    internas), `table`, `thead`, `tbody`, `tr`, `th`, `td`, `br`. Nada de
    `h1`-`h6` dentro del html (los títulos van en su campo con su nivel), ni
    `img`, `style`, `script`, ni enlaces externos.
14. **Enlaces internos**: 2-4 por ampliación, 4-8 por página nueva, solo a
    rutas de **la lista completa del sitio** (`_rutas.json`, generada, no
    escrita a mano) más las páginas nuevas del lote. Ancla descriptiva
    variada; como mucho un enlace por destino; nunca «Haz clic aquí»; nunca
    a dominios hermanos o ajenos.
15. **FAQ**: título «Preguntas frecuentes sobre <tema o ciudad>», 3-6
    preguntas reales (de la cantera de la investigación), distintas de los
    h3 y de las que la página ya tenga, respuestas de **40-70 palabras**
    (35-50 en localidad, 40-80 en página nueva), directas en la primera
    frase, con un `<strong>` y como mucho un enlace. Cada pregunta nace de un
    dato concreto. **Prohibidas las preguntas-plantilla** («¿Tenéis depósito
    en X?», «¿Qué licencia pide el Ayuntamiento de X?», «¿Desde qué puerto
    llega a X?»). **Una sola FAQ por página** y un solo `FAQPage` con solo las
    preguntas propias. Las preguntas se pintan como h3: cuentan para las
    reglas de encabezados.
16. **Longitudes**, en **un único fichero de umbrales** que lean flujos y
    scripts (redactor, verificador y script usaban umbrales distintos):
    ampliación de tema 300-600 palabras con FAQ; localidad de la familia
    principal 200-350 y de la secundaria 250-400 más FAQ; página nueva
    900-1.500 (FAQ central hasta 2.200); modelo nuevo 700-1.000; sección
    60-180; intro junto al formulario 220-260 medida en navegador;
    `tituloSeo` 45-60 caracteres empezando por la palabra clave;
    `descripcion` 130-158 sin emojis y con llamada a la acción; alt 8-16
    palabras; texto de tarjeta 22-40. El verificador tolera un margen
    explícito (title 45-65, description 110-160, FAQ ±5) «para no rechazar
    por un carácter».
17. **Solo contenido nuevo y útil**: cada sección responde a una pregunta
    real con el porqué técnico o legal. No se repiten los h2 de plantilla ni
    nada que la página ya cuente (el redactor recibe sus encabezados y lee
    su JSON). Un mismo tema se redacta desde el ángulo de cada página. No se
    contradicen las páginas relacionadas: el verificador las comprueba.
18. **Cada página distinta de verdad**: en un lote de localidades, al menos el
    60 % de las frases son diferentes; varía el orden de los bloques, los
    ejemplos y el enfoque de la FAQ. Los bloques generales no van en cada
    localidad: se enlazan a los hubs.

## A4. Cómo trabajan los agentes
19. **PROHIBIDO escribir ficheros**, en todos los prompts: «Solo lees y
    devuelves el resultado estructurado; la integración la hace otro. Scripts
    temporales solo en la carpeta temporal del sistema». Al terminar cada
    flujo, `git status --short` y revertir lo que un agente haya tocado. En
    casascontenedores, los redactores escribieron borradores en 160-206 JSON
    que acabaron en `main` sin verificar; uno editó una página y devolvió un
    informe en vez del contenido; otro cambió un título original y una
    imagen.
20. **Salida estructurada con esquema** (campos obligatorios, enums cerrados,
    mínimos y máximos), nunca un informe del trabajo; la ruta la fija el
    script; se da **un ejemplo literal de salida** (hubo h3 incrustados en el
    html del h2 y nombres de fichero en «ruta»). Las secciones «faq» del plan
    van en el campo `faq`, no en `secciones`.
21. **Redactar → pulir → verificar (adversarial) → un reintento con la lista
    de problemas → corrector individual → cierre humano.** El verificador
    «busca motivos para RECHAZAR y cita el fragmento exacto», con criterios
    numerados y **la misma lista blanca** que el redactor; «no rechaza por
    lo que las reglas permiten ni por matices de estilo»; no navega. El
    reintento lleva la cabecera literal «EL VERIFICADOR RECHAZÓ LA VERSIÓN
    ANTERIOR POR ESTO; corrígelo todo sin perder el resto:».
22. **Verificar PÁGINA a PÁGINA, nunca por lote.** Redactar en lotes de 5 para
    que no se parezcan está bien; verificar el lote entero hizo que un fallo
    en una ciudad rechazara las cinco: 11 de 40 lotes aprobados, 86 de 254
    páginas.
23. **El corrector hace retoque mínimo y cuenta antes de devolver** (negritas
    por párrafo, enlaces, apariciones de la palabra clave, h3-pregunta,
    longitud de cada respuesta). Subió la aprobación de 140/173 a 29/33. Los
    recuentos se comprueban además con un script determinista, porque los
    agentes fallan al contar.
24. **Para fallos mecánicos, script y no otra ronda de agentes**: rotación de
    variantes para bajar la palabra clave, regex en seco para quitar una
    frase repetida, mapa determinista para encabezados. Los verificadores
    LLM de encabezados rechazaron 3/3 y 13/13 páginas por estilo; la puerta
    real fue determinista y manual, en 5 minutos frente a 3 horas.
25. **Modelo barato** (`sonnet`, esfuerzo medio) para redactar, pulir,
    verificar, corregir y leer lotes de 8 URL (~60 k tokens por lote);
    **modelo grande** para fichas con navegación, mapear y comparar
    competencia, planificar y juzgar; `haiku` para leer ficheros.
26. **Todo flujo de más de 30 minutos se corta por el límite de sesión.** Cada
    etapa guarda su resultado en disco nada más terminar (y parciales
    numerados), se relanza con `resumeFromRunId`, se comprueba el estado del
    run (`completed` / `killed`) y **la cobertura ruta a ruta** al acabar
    (en cada run largo se perdió un lote de 5 páginas). Los dossieres
    grandes se trocean (el juez gastó 402 k tokens y murió por límite de
    salida).
27. **Fijar todas las reglas antes de lanzar.** Cambiarlas a mitad
    (h3-pregunta y negritas el día 3) invalidó la caché de lo ya redactado.
28. **Indexar fichas y resultados por un identificador fijado por el script**
    (slug), no por el nombre que escriba el agente: 4 agentes escribieron la
    clave con variante («Álava (Araba)») y 7 páginas se redactaron sin
    ficha.
29. **Cambios masivos sobre el original solo por script**: pasada en seco con
    recuento; reglas que no puedan aplicarse dos veces (`desea(?!s)`:
    «deseass» 206 veces); conservar la caja («Disculpa» a mitad de frase);
    lista de protegidas («Mas del Jutge»); solo nodos de texto, nunca URL,
    `src`, `alt` ni nombres de fichero; segunda pasada con 0 cambios; y las
    correcciones **viven en un JSON** que leen a la vez el pintor, el
    validador y el comparador (si no, el comparador falla: 3 claves de
    `encabezados.json` cambiaron).
30. **Nada se publica sin `npm run build`, `npm run validar` y
    `npm run comparar` en verde**, más el saneado programático de lo que se
    aplica (etiquetas, enlaces a rutas inexistentes, HTML sin cerrar por
    respuestas cortadas, h3 incrustados). La cobertura se comprueba sobre el
    HTML compilado (`dist`), no sobre el JSON. Al cerrar cada bloque, grep de
    «lo que nunca debe salir» sobre **todo** lo publicado.
31. **Medir en navegador real** (Playwright con `channel: 'chrome'`) sobre
    `dist` o la web publicada, nunca sobre el servidor de desarrollo (sirve
    CSS viejo y duplica peticiones); capturas de escritorio y de 390 px por
    tramos; «no cambiar el diseño» se demuestra con cajas y alturas antes y
    después; estilos congelados y servidor arrancado antes de lanzar
    revisores visuales.
32. **Al propietario, en palabras llanas**, con un ejemplo por acción,
    cifras **sacadas del fichero de resultados** (se dijo «5 de 7» y eran
    3/7; «tres revisores» y eran 2 lentes) y siempre con su base (1.337 «Haz
    clic aquí» en la web compilada, 1.352 botones en los JSON); tres listas
    (puedo hacerlo ya / necesita permiso / necesita datos tuyos) y preguntas
    numeradas para contestar juntas. Lo que no entiende no lo autoriza
    («465 enlaces por redirección», «?p=», «netlify.app» se quedaron sin
    hacer). Cuando una acción deshace una decisión suya, se dice y se ofrece
    una versión intermedia con una tabla antes/después.

---

# B. LAS FASES

| Fase | Qué | Necesita |
|---|---|---|
| 0 | Cuestionario y decisiones del propietario | nada |
| 1 | Inventario, lo que no se ve, lo que falta de la web vieja | la web compilada |
| 2 | Motor y contrato de salida | Fase 1 |
| 3 | Higiene del original (con permiso) y referencia única de cifras | Fases 0 y 2 |
| 4 | Investigación de Google y auditoría frente a competidores | Fase 1 |
| 5 | Análisis de competencia a fondo | competidores de la Fase 0 |
| 6 | El plan: dos planificadores y un juez. **Lo apruebas tú** | Fases 1, 4 y 5 |
| 7 | Fichas locales verificadas (si hay páginas por localidad) | Fase 6 |
| 8 | Páginas nuevas y herramientas (los hubs a los que enlazar) | Fases 5 y 6 |
| 9 | Ampliaciones: h2/h3 + FAQ al final de cada página | Fases 6, 7 y 8 |
| 10 | Encabezados que nombran la palabra de su página | Fase 3 |
| 11 | Bloques comunes, menú, enlazado y páginas clave | Fases 8 y 9 |
| 12 | Velocidad sin cambiar el diseño y publicación única | todo lo anterior |
| 13 | Auditoría de la web publicada y ciclo de decisiones | Fase 12 |

Al cerrar cada fase: `todo` en verde, commit, `CLAUDE.md` al día, y el estado
del cambio (local / commit / rama / publicado).

---

## FASE 0 — Cuestionario y decisiones

Un solo mensaje al propietario con **todo** lo de la sección 1 que falte,
numerado, con un ejemplo por punto y lo que se bloquea si no contesta. Se
acuerda desde ya **publicar desde rama cuando esté verificado** (Dec. 6).

**Cierre:** respuesta del propietario, punto a punto, apuntada en
`CLAUDE.md`.

---

## FASE 1 — Inventario y reconocimiento

1. **`scripts/inventario.mjs --json`** → `capturas-tmp/inventario.json`. Por
   página: ruta, tipo (portada / tema por familia / localidad por familia /
   legal / nueva), localidad, palabra clave, título SEO, descripción,
   palabras, **encabezados en orden con su nivel** y si trae FAQ.
   - Fue la pieza más reutilizada: la leyeron investigadores, auditores,
     planificadores, el juez (para no repetir h2) y el comparador de
     competencia. Regenerable con un comando y **regenerada después de cada
     cambio masivo** (en la auditoría final estaba 6 minutos desfasada
     respecto a un commit de 355 enlaces).
   - **Clasificar con dos señales** (menú + patrón de ruta o topónimo en el
     h1): solo por el menú, 11 de 263 páginas quedaron como «tema» y nunca
     se corrigió en el inventario.
   - Los agentes lo leen por tramos o con grep, nunca entero (564 KB).
2. **Un bloque CONTEXTO común** que encabece todos los prompts: negocio y
   familias, tecnología y dónde están los datos, cómo leer el inventario,
   tipos de página con conteos y longitud media, hubs, dominios hermanos.
3. **Lo que no se ve**: enlaces a `#`, a redirecciones (`/por-dentro` sin
   barra, `http://`, erratas en la ruta) y a otros dominios; botones sin
   destino; teléfono como texto (`tel:+34…`, `wa.me`); formulario que envía;
   PDF prometido; afirmaciones que el propietario debe confirmar; **cifras
   que se contradicen entre páginas** (`herramientas/precios/menciones.mjs`:
   53 frases distintas con €, meses o semanas, 633 apariciones).
4. **Duplicación entre plantillas**: similitud entre 5-10 pares del mismo
   tipo y % de palabras en bloques repetidos [97,9 % entre localidades, 68 %
   de las palabras en bloques repetidos en ≥60 páginas]. Es lo que justifica
   la Fase 7.
5. **Lo que la exportación del CMS no trajo**: shortcodes (`[modula id=…]`)
   y lo que pintan los plugins. Se baja de la web viva **con permiso**,
   diciendo cuántos ficheros y cuánto ocupan, **antes del cambio de DNS**.
   [58 fotos de la galería, descubiertas por el propietario el último día.]
   Los **alt** se escriben con un agente que **abre cada foto** y otro que la
   revisa (8-16 palabras, honrados, con la palabra clave, sin «imagen de»);
   nunca por el nombre del fichero; y se decide qué hacer con las fotos que
   no son del tema o llevan texto incrustado [24 y 9 de 58, sin decidir].
6. **Inventario SEO de la web compilada** (`herramientas/auditoria/
   inventario.mjs`): una fila por página con título, descripción, h1, h2/h3,
   palabras, enlaces internos con anclas, externos, imágenes sin alt o sin
   medidas, JSON-LD, enlaces entrantes; y `resumen.json` con umbrales
   (título >60 o <30, descripción >160 o <110, página fina <600 palabras,
   <3 entrantes, anclas genéricas).

**Cierre:** inventario y lista de «lo que no se ve» enseñados al propietario.

---

## FASE 2 — Motor y contrato de salida

Antes de planificar nada, se fija **el formato exacto** que devuelven los
agentes y **el único camino** por el que entra en la web.

- Campo `ampliacion` del JSON de cada página:
  `{secciones:[{nivel:"h2"|"h3", titulo, html}], faq:{titulo, items:[{pregunta, respuesta}]}}`.
  El motor lo pinta al final (`seccionAmpliacion` en `render.js`, ancla
  `#mas-informacion`) y genera el `FAQPage`. Si la página ya tiene una FAQ,
  **la nueva se funde en el acordeón existente** (`anadirFaq`, `sinFaq`):
  decidirlo ahora, no al revisar (dos h2 de «Preguntas frecuentes» en la
  misma página solo se vio después).
- `scripts/aplicar-ampliacion.mjs <resultado.json> [--seco] [--todas]
  [--quitar-rechazadas]`: aplica solo las aprobadas, sanea el HTML (lista
  blanca, equilibrio de etiquetas, h2-h4 incrustados desplegados como
  secciones), quita enlaces externos o a rutas inexistentes, informa.
- `src/utils/renombres.js` + `src/data/encabezados.json` (Fase 10),
  `alFinal` (reordenar secciones originales sin tocarlas), componentes por
  marcador (`{t:'componente', nombre}`), y los pasos del motor en este
  orden: `rebajarH1 → ordenarTipos → anadirIntro/subirAlIntro →
  anadirModelos → seccionAmpliacion → servicios-auto → anadirZonas →
  anadirFaq → alFinal → aplicarRenombres → pintar`, siempre sobre
  `structuredClone` del árbol. Todo está en `kit/`.
- `npm run build`, `npm run validar` (texto visible = original + añadidos +
  renombres) y `npm run comparar` (encabezados frente a la web viva, con los
  cambios permitidos documentados).
- **Un ejemplo literal de salida en cada prompt.**

**Cierre:** una ampliación de prueba pintada, validada y comparada.

---

## FASE 3 — Higiene del original (con permiso) y referencia única de cifras

Se hace **antes** de renombrar encabezados y de redactar: en
casascontenedores se hizo el último día, rompió 3 claves de
`encabezados.json` y obligó a los redactores de renombres a copiar erratas
literales.

Con la autorización de la Fase 0, por la vía de A1.2:

| Qué | Cómo | [Resultado] |
|---|---|---|
| **Erratas, voseo y «usted»** | Medir → agentes **clasifican frase a frase** (ninguno / voseo / usted) → `src/data/erratas.json` {palabras, frases, protegidas} → `corregir-erratas.mjs --seco` → aplicar. Reglas no reaplicables, caja conservada, protegidas, solo texto visible, también las claves de `encabezados.json` y los rótulos del menú | [«contendor» 1.528, «conteiner» 341, tildes, 208 frases revisadas, 112 cambiadas, 26 formas de voseo; 288 ficheros] |
| **Ciudades cruzadas** en título, descripción y h2 (plantillas copiadas) | Detector automático sobre **todas** las localidades (`herramientas/auditoria/ciudades-cruzadas.mjs`), **en el build** desde ahora | [5 casos en 198 páginas] |
| **Botones a `#`** | Lista con destino por contexto, aprobada | [24 en 9 páginas] |
| **Anclas «Haz clic aquí»** | `botones-descriptivos.mjs`: 2 textos por destino (≤20 caracteres) elegidos por **hash de la ruta**; alto de botón medido antes y después | [1.352 botones → 23 textos, 195 medidos sin cambio] |
| **Enlaces a redirecciones** | Dirección final en el enlace: barra final, `https`, errata de la ruta, `tel:+34`, `wa.me` | [465 en la web compilada; **sin hacer**: el propietario no lo entendió] |
| **Enlaces a dominios hermanos** | Reglas en el árbol (tipo de elemento, sección, regex) y lista de lo que queda sin cambiar; después **medir el reparto de entrantes** | [355 en 158 páginas → una página pasó a recibir 624 enlaces; la franja de «renders» se separó a su página] |
| **Referencia única de cifras** | Con los datos del propietario (Fase 0). Si no los da y dice «pon promedios»: `menciones.mjs` → propuesta con revisores adversariales → **enseñársela antes de aplicar** → reemplazos exactos por ordinal o encabezado anterior, revisados en cada tipo de página | [Quedó interrumpido y sin aplicar; 22 cambios propuestos] |

**Cierre:** `todo` en verde, segunda pasada de cada script con 0 cambios, y
la lista blanca de cifras cerrada en `CLAUDE.md`.

---

## FASE 4 — Investigación de Google y auditoría frente a competidores

Dos flujos separados (mezclar lo visual con lo SEO en uno solo complicó la
lectura).

**Investigación de SERP**, una por intención (6 aquí: general, precio,
modelos y tipos, normativa, familia secundaria, local). Para cada consulta
literal, con búsqueda web y **abriendo de verdad al menos 6 resultados
orgánicos** (no anuncios): competidores (12-19 por consulta) con url,
título, h1, **la lista COMPLETA de h2/h3 en orden** (no un resumen: es lo que
permite copiar la secuencia ganadora), palabras, elementos (tabla de precios,
FAQ, pasos, testimonios, galería, comparativa, calculadora, mapa, vídeo) y
temas; `temasComunes`, `preguntas` reales (25-43 por consulta: FAQ de los
competidores y «otras preguntas» de Google si se ven), `huecos` (14-18).
Los investigadores tienen acceso a nuestros JSON: así se vio que **11 de las
20 FAQ de la portada estaban copiadas de un competidor** y no se
reutilizaron. [100 entradas de competidor en 42 dominios.]

**Auditoría del sitio** en 4 ámbitos (portada y páginas de dinero; tema;
plantillas de localidad; metadatos): hallazgos, recomendaciones por ruta,
temas sin cubrir, cruzando con lo que cubren los competidores.

**Revisión visual** aparte: escritorio y 390 px, una página por tipo, servidor
levantado y estilos congelados.

**Salida:** `capturas-tmp/seo-resultado.json`, guardado nada más terminar.

---

## FASE 5 — Análisis de competencia a fondo

Para los 3-6 competidores de la Fase 0 (todos a la vez), un flujo en cuatro
pasos:
1. **Mapear** cada web por familias de su menú, sitemap y robots (todas las
   URL si ≤12 por familia; 3 de muestra si es repetitiva). [411 URL en 50
   familias de 4 webs.]
2. **Leer** en lotes de 8 con modelo barato: título, h1, encabezados,
   elementos, cifras que publican, qué prometen. Solo lectura; nunca
   rellenar formularios; no copiar textos. [284 páginas, 2,99 M tokens.]
3. **Comparar** con lo nuestro y **verificar adversarialmente contra nuestro
   propio contenido** (con grep en los JSON): cada hueco queda «no»,
   «parcial» (con la ruta donde ya se toca) o «sí». [79 huecos, 26 de
   prioridad alta; 56 parciales.]
4. **Presentar en tres grupos**, que es lo que el propietario decide rápido:
   - **fallos que anulan la conversión** (formulario que no envía, PDF que no
     existe, teléfono ausente): primero;
   - **lo que no necesita datos del propietario** (guías, fichas de servicio,
     herramientas, variantes de búsqueda, enlaces entre páginas): lo eligió
     tal cual;
   - **lo que exige cifras reales** (tarifas, precios por modelo, obras,
     testimonios, equipo, dirección): espera. **No se inventa.**

**Salida:** `capturas-tmp/competencia.json` y la lista al propietario.

---

## FASE 6 — El plan (lo apruebas tú antes de escribir nada)

1. **Dos planificadores independientes** sobre las Fases 1, 4 y 5: uno por
   **cobertura y fiabilidad** (datos, normativa, proceso), otro por
   **intención y conversión**. **Con los rangos de longitud ya dados**: sin
   ellos pidieron 900-1.800 palabras por página.
2. **Un juez** que funde, deduplica, comprueba la cobertura contra el
   inventario y ajusta. Devuelve:
   - **principios** [12: son la sección A];
   - **un plan por página de tema** [62]: secciones con nivel, título literal,
     puntos a contar, palabras, formato (párrafos / lista / tabla / faq) y
     palabras clave, más el motivo;
   - **una plantilla por tipo de localidad** [4 y 5 secciones; 12 y 9
     variables] con **solo lo que cambia de verdad entre ciudades**; los
     bloques generales se mandan a los hubs por enlace (el plan 1 proponía 7
     secciones y 1.800 palabras por ciudad: habría reproducido la
     duplicación);
   - **estrategia de FAQ con matriz de deduplicación**: qué pregunta vive en
     qué página [47 preguntas base];
   - **las páginas nuevas y los modelos en el mismo plan** (aquí se
     planificaron aparte y 10 días después);
   - **sugerencias de título y descripción**, anotadas y **cerradas con una
     pregunta concreta** al propietario [21 sin respuesta].
3. **Volcado a un fichero por página** (`capturas-tmp/plan/<slug>.json` con
   metadatos y encabezados actuales), más `_principios.json`,
   `_localidades.json`, `_rutas.json` (todas las rutas) y `_listas` (qué
   localidades ya tienen FAQ en el cuerpo).
4. **Enseñar el plan y esperar.** Aquí la redacción arrancó 3 minutos después
   del volcado, sin aprobación.

---

## FASE 7 — Fichas locales verificadas (si hay páginas por localidad)

Sin ficha, el redactor escribe plantilla con el topónimo cambiado.

- **Se lanzan solas, antes de redactar**, y se guardan en
  `capturas-tmp/fichas-locales.json` [tres lanzamientos murieron en esta
  fase por límite de sesión].
- Lotes de 9 localidades por agente, con búsqueda web; **clave = slug fijado
  por el script**; cobertura nombre a nombre al terminar.
- Campos del sector [14: comunidad, ley del suelo con número, documento de
  habitabilidad, plan general, clase de suelo, protecciones, zona climática,
  terreno, logística, restricciones de acceso, actividad económica, páginas
  hermanas, qué se verificó y qué se omitió], con una **referencia de
  normas por territorio** en el prompt para verificar, no para copiar.
- **Solo datos verificables**; si no, `«no verificado: omitir»` en ese campo
  (así el verificador rechazó después años de planes que no estaban en la
  ficha).
- **Prohibido en las fichas**: precios, distancias, plazos, tasas,
  poblaciones, cualquier cifra que no sea el número de una norma o una
  clasificación oficial.
- [123 fichas para 124 nombres; 7 páginas se redactaron sin ficha por claves
  con variante.]

---

## FASE 8 — Páginas nuevas y herramientas

Van **antes** de las ampliaciones porque son los hubs a los que estas
enlazan. Salen de los huecos de la Fase 5 que no necesitan datos del
propietario. [7 modelos por superficie; 7 guías: financiación, suelo
rústico, cimentación, inconvenientes, casas modulares, preguntas frecuentes,
antifraude; hub y 9 fichas de servicio; 3 herramientas.]

**Brief por página**: traduce el hueco **quitando lo que no se puede
afirmar** y diciendo qué no incluir; palabra clave; hueco de competencia a
leer; páginas relacionadas nuestras (para no contradecirlas y enlazarlas);
lista de fotos permitidas con ruta exacta.

**Reglas de página nueva** (además de A): intro con h2; cuerpo de 4-7 h2 y
3-6 h3 (≥3 en pregunta); **todos los h2 y h3 con la palabra clave o una
variante** (las preguntas de la FAQ se renderizan como h3: o cumplen o se
excluyen explícitamente); 900-1.500 palabras; `tituloSeo` 45-62;
`descripcion` 130-158 sin emojis; foto de la lista.

**Páginas hermanas** (modelos por tamaño): **tabla canónica previa** de
público y composición por entidad, reparto de argumentos, **revisor de
cruce** y, a partir del segundo rechazo, **un editor único con todo el lote**;
después, verificar otra vez página a página. En paralelo se contradicen
[31 problemas de cruce] y calcan la estructura del encargo «con el tamaño
cambiado»: obligar a leer la página y a elegir de un catálogo de temas que
no se solapen. Para «la palabra clave en todos los h2»: tope de apariciones,
variantes aceptadas y rotación determinista (`pulir-m2.mjs`).

**Montaje** con `nueva-pagina.mjs <specs.json>` y `nueva-pagina-modelo.mjs`:
foto de cabecera, intro con el formulario al lado, componente opcional,
secciones, componente final, FAQ en `ampliacion`; misma estructura que las
existentes. Conservar las versiones intermedias (v1, editadas, corregidas)
y un fichero de veredictos. `comprobar.mjs` para los umbrales y `manual.mjs`
para reemplazos exactos.

**Herramientas** por marcador en el HTML: calculadora (sin valores
precargados que parezcan oferta; avisa de lo que no incluye), formulario por
pasos (dice de qué página viene; conversión en Analytics), catálogo filtrable
(datos de **una sola fuente**). Probar con un guion de resultados esperados y
sin JavaScript. [Formulario por pasos en 11 páginas, catálogo en 3,
calculadora en 1.]

**Enlazar cada página nueva** desde el menú, la rejilla, el pie y el texto de
las relacionadas, armonizando lo antiguo (las guías recibían 2-8 enlaces y
ninguno desde las ciudades). Lista de URL nuevas para pedir indexación.

[17 páginas de 1.121-1.603 palabras (FAQ central 2.154); 7/17 aprobadas a la
primera, 8/11 tras corrección.]

---

## FASE 9 — Ampliaciones: h2/h3 + FAQ al final de cada página

El bloque grande [259 páginas; 14 lanzamientos en 10 días; 488 agentes y
11,8 M tokens de redacción, 534 agentes y 23,3 M de corrección, 96 y 6,1 M de
última ronda].

**9.1 Páginas de tema, una a una.** El redactor recibe su `plan/<slug>.json`,
lee el JSON de la página para no repetir y sigue el plan sección a sección.
Luego **pulido** (agente barato: h3-pregunta y negritas sin cambiar nada
más), **verificador por página** y **un reintento**.

**9.2 Localidades en lotes de 5 mezclando zonas de verdad** (el bucle
cortaba por orden alfabético), con la plantilla de su tipo y **las fichas
como única fuente de datos locales** en el prompt. Si la página ya tiene FAQ
en el cuerpo: solo 3-4 preguntas locales nuevas. **Verificación página a
página** (regla 22).

**9.3 Control de plantilla ANTES del verificador**: **sustituir el topónimo
por un marcador y contar en cuántas páginas aparece cada frase de ≥7
palabras**; las que salen en **3 o más** van al corrector como lista literal
(`frasesPlantilla`). El solape por ventanas de 8 palabras no sirve (el
topónimo rompe la ventana): 0 de 192 detectadas frente a 97 de 173.

**9.4 Corrección página a página** (`preparar-correccion.mjs`): fichero por
página rechazada con sus problemas, su ficha, sus encabezados, sus frases
plantilla y la orden de contar antes de devolver; última ronda de retoque
mínimo; los últimos rechazos los decide la sesión principal leyendo los
problemas. [86/254 → 140/173 → 29/33; 4 publicadas por criterio humano.]
Los rechazos más frecuentes: párrafos calcados (175), negritas (82), cifras
(71), stuffing (36), repetición (30).

**9.5 Aplicar solo lo aprobado** con `aplicar-ampliacion.mjs --seco` y luego
sin él; `--todas` solo con decisión explícita; FAQ unificada; `FAQPage`
solo con las propias. **No publicar «lo que haya»** (Dec. 6).

**9.6 Comprobación de hechos legal** sobre todo lo añadido (regla 8), con
grep en todo el sitio y reemplazos exactos, repetida tras corregir.

**9.7 Cierre del bloque**: grep de «lo que nunca debe salir» (voseo, el
concepto prohibido, etiquetas, enlaces rotos) sobre todo lo publicado y
limpieza programática en seco (`quitar-deposito.mjs`: 13 páginas y 2
preguntas de FAQ).

[Resultado: 283 de 287 páginas; 312 / 728 / 1.847 palabras (mín / mediana /
máx), 208.414 en total; 1.620 secciones, 756 h3, 1.261 preguntas, 1.717
negritas, 946 enlaces internos.]

---

## FASE 10 — Encabezados que nombran la palabra de su página (Dec. 2)

- Mapa `src/data/encabezados.json` → `{ "/ruta/": { "original EXACTO": "nuevo" } }`,
  aplicado por `renombres.js` **al final del pintado** (cubre lo añadido y
  la FAQ) y aceptado por `comparar` y `validar`. **Montar primero el
  mecanismo con el mapa vacío.**
- Los encabezados se extraen del **HTML compilado** y se clasifican por tipo
  (tarjeta de modelo, rótulo, ventaja, pregunta, título de sección).
- **Tres niveles**: renombre manual > regla determinista (plantillas por
  composición real de cada entidad) > propuesta del redactor. Los redactores
  inventaban relaciones («junto a la de un contenedor») y sufijos
  mecánicos; los verificadores LLM rechazaron todas las páginas por estilo;
  el mapa final lo escribió la sesión principal [62 renombres manuales] y lo
  comprobó con scripts: **cobertura** (falta / sobra / sin palabra),
  **identidad** (números + sustantivos: una tarjeta de 45 m² no puede pasar
  a nombrar otra superficie), **«pierde palabras»** (el nuevo se come el
  tema del original). Guardar `textoOriginal`.
- Topes: hasta 2 h2 sin la palabra, variantes aceptadas listadas, ninguna
  fórmula en más de un tercio de los encabezados, dos encabezados nunca
  iguales, el sentido y el tamaño exacto se conservan. Las tarjetas que
  enlazan a **otro** modelo lo nombran intacto y al principio.
- **Revisar el texto bajo cada encabezado renombrado**: da visibilidad a
  párrafos antiguos con promesas («precios inigualables»), que se corrigen
  con permiso.
- [718 renombres en 19 rutas: planos 46, permisos 48, pasos 43, 13 páginas
  de tipo 546, prefabricadas 33, ciudades 2.]

---

## FASE 11 — Bloques comunes, menú, enlazado y páginas clave

Todo se pinta desde datos al compilar; los JSON de página no cambian.

**11.1 Bloques comunes en las páginas de localidad** (Dec. 5): modelos y FAQ
de la portada, **achicados y solo los de su familia**, con cabecera por tipo
de página; solo las preguntas propias al `FAQPage`. [Se copiaron enteros en
197 ciudades a petición del propietario y la auditoría los marcó como
relleno.]

**11.2 Bloque de zonas**: `zonas.mjs` → `zonas.json` (territorio → páginas
con su familia); primero las del mismo tipo, luego el otro tipo, luego el
territorio superior; slugs irregulares en tabla a mano; el script avisa si
una ruta no existe. [205 páginas; 53 entradas.]

**11.3 Párrafos de entrada a la altura del formulario**: el texto de la
columna izquierda acaba donde acaba el formulario de la derecha. Se **mide
en navegador a dos anchos** (`herramientas/intro/medir.mjs`) y se guarda el
número por página en `intro-ciudades.json` [casas 1-3 párrafos, marítimos
5; tolerancia 45 px]; **sin enlaces**; en páginas nuevas se sube contenido
existente en vez de añadir; la columna se marca `sinPatrones`.

**11.4 Rejilla de servicios con foto en todas las páginas**:
`servicios.json` con tarjetas (foto, alt, posición), cabecera por tipo de
página (`home`, `servicios`, `cabeceras` por ruta con `excluir`, `generica`
por familia con la localidad en el h2) para no repetir el mismo h2 en 283
páginas; la página de un servicio no muestra su tarjeta. **Fotos catalogadas
abriendo cada imagen** (banners con texto incrustado, un render duplicado);
sin foto que lo muestre, foto «de contexto» y alt honrado; copias con la
palabra clave, originales intactos. Servicios en h3, un `<strong>` y un
enlace por tarjeta, misma columna que el texto de arriba (medida), tarjeta
de cierre. Planificar una ronda visual con el propietario.

**11.5 Menú**: paneles para las familias grandes, «Servicios» antes que
«Provincias», submenú de tipos desde `orden-tipos.json` (un solo dato para
rejilla, menú y comparador); **puente de hover** entre el enlace y el panel
(en `global.css`); comprobar en varios anchos con script.

**11.6 Páginas clave, una por familia** (portada, hub de la segunda familia,
páginas con aviso de «próximamente»): flujo Investigar → Auditar → Redactar
propuesta completa → Verificar con 2-3 lentes hasta 3 rondas → Sintetizar
con crítico. Sin permiso: FAQ ampliada nombrando el producto [6 → 14
preguntas de 58-72 palabras, con «origen» por dato], rejilla con cabecera
propia, banda de territorios al final (`alFinal`), tipos ordenados en toda
la familia [104 páginas], intro nueva donde había un aviso. **Con permiso,
uno por uno**: título y descripción, y los **párrafos originales que
contradicen al resto** [6, con motivo y redacción nueva: «ok perfecto»].
Cuando se corrige un dato, corregirlo en las páginas enlazadas [tara / placa
CSC en 3]. La familia se detecta por el **campo de menú**, no por el prefijo
de la ruta [33-34 páginas se quedaban fuera]. Tras integrar, **volver a
contar** (las correcciones sacan textos del rango). Integrar con un script
que aborta si el texto no coincide.

---

## FASE 12 — Velocidad sin cambiar el diseño y publicación única

- Héroe en WebP con `srcset` y `preload`; `unicode-range` en las fuentes
  locales (solo `latin`); `width` y `height` reales en todas las imágenes.
  [172 héroes de 327 KB → 156 KB; 113 KB menos de fuentes por página; 7.776
  imágenes; LCP de partida 8,6-9 s en móvil.]
- **Re-medir en producción antes de aplicar lo que diga el plan** (decía
  «8 fuentes que no se usan» y eran los `latin-ext` sin `unicode-range`).
- Prueba objetiva: cajas de imágenes y botones y alto de página antes y
  después, a 1440 y 390 px [452 imágenes y 195 botones idénticos].
- **Publicación única desde rama** con build, validar y comparar en verde, y
  la lista de URL nuevas para pedir indexación. [Aquí hubo tres
  publicaciones a medias por «sube a main».]

---

## FASE 13 — Auditoría de la web publicada y ciclo de decisiones

Después de publicar y **con el inventario regenerado tras el último commit**.

1. **Medir una vez** (`herramientas/auditoria/inventario.mjs` sobre `dist`)
   y dárselo a todos los auditores: «usa estos datos, no los rehagas».
2. **Seis auditores en paralelo**, 8-16 hallazgos cada uno con cifras, rutas
   y cómo lo han comprobado:
   - **arquitectura**: tipos y jerarquía, menús, migas, profundidad de clic,
     huérfanas, **canibalización** (pares que compiten), páginas finas;
   - **SEO en página**: títulos, descripciones, h1, duplicación entre
     plantillas, alts, datos estructurados, Open Graph; plantilla de título y
     descripción por tipo;
   - **enlazado**: reparto de entrantes, anclas, enlaces a redirecciones,
     externos, rotos, vecinas y gemelas, guías → comerciales; modelo de hubs
     con cifras objetivo;
   - **técnica**: peso, LCP y CLS en 4-5 páginas publicadas, imágenes sin
     medidas, canonical, sitemap, cabeceras, redirecciones del CMS viejo,
     **cookies antes del consentimiento**, accesibilidad básica;
   - **contenido y conversión**: señales de confianza, cifras que se
     contradicen, erratas, voseo, promesas sin respaldo, llamadas a la
     acción, legales;
   - **competencia** para 6-8 búsquedas: quién sale, qué ofrece, si salimos.
3. **Un escéptico por dimensión** repite las medidas: confirmado / matizado
   (con corrección) / refutado. [83 hallazgos: 26 confirmados, 57 matizados,
   0 refutados; sirve para corregir cifras, no para tumbar.]
4. **Plan**: nota de 0 a 10 por área, 15-25 acciones con prioridad, impacto,
   esfuerzo y **quién** (puedo hacerlo ya / necesita permiso / necesita datos
   del propietario / lo hace el propietario), lo que está bien, preguntas al
   propietario, y un **crítico de completitud**. [27 acciones: 10 / 8 / 5 / 4;
   15 preguntas.]
5. **Lo más urgente no fue SEO**: correo sin MX, Analytics antes del
   consentimiento, Search Console sin verificar. Va primero.
6. **Informe en palabras llanas**, acción por acción con un ejemplo, avisando
   cuando una deshace una decisión del propietario; él contesta por viñetas;
   cada decisión se ejecuta por la vía de A1.2 y se cierra con una tabla «Lo
   que pediste | Resultado | Commit».

---

## FASES OPCIONALES (lo que en casascontenedores quedó pendiente)

- **FAQ y rejilla achicadas** en las ciudades de la familia secundaria
  (propuesta «achicar y adaptar» sin confirmar).
- **Precios y plazos**: una referencia con fecha (flujo interrumpido).
- **Títulos y descripciones** por fases con Search Console [153 y 258].
- **Cierre de la migración**: subdominio del hosting al dominio, `?p=ID` a
  su página, redirección 301 de la ruta con errata, caché de los 404.
- **Botones de contacto por familia y teléfono visible**; formulario por
  pasos en las páginas de más intención; evento de conversión por página.
- **Enlaces de texto hacia guías y hubs** desde las ciudades; enlazado de
  territorios hermanos; **migas con jerarquía** y datos estructurados
  (`BreadcrumbList`, `Service`, `LocalBusiness` cuando haya dirección).
- **Datos de empresa** en las legales, perfil de Google, reseñas, obras.
- **Páginas dudosas** sin decisión; guías propuestas y no hechas
  (legal, comparativa, mantenimiento); fotos con licencia libre.
- **Consolidar ciudades** sin demanda con los datos de Search Console.

---

# C. NÚMEROS DE REFERENCIA (web de unas 260 páginas)

| Fase | Coste medido | Resultado |
|---|---|---|
| 4 Investigación | 20 agentes (coste de los 17 investigadores no registrado; los 3 planificadores, 0,94 M) | 6 SERP, 4 auditorías, 7 revisiones visuales |
| 5 Competencia | 42 agentes · 2,99 M · 55 min | 411 URL, 284 páginas, 79 huecos |
| 6 Plan | dentro del flujo anterior | 62 planes, 2 plantillas, 47 preguntas base |
| 7 Fichas | 14 agentes | 123 fichas |
| 8 Modelos por m² | 37 + 8 + 14 + 28 agentes · 7,4 M | 7 páginas de 1.702-2.456 palabras |
| 8 Guías y servicios | 65 + 42 agentes · 11,8 M | 17 páginas |
| 9 Ampliaciones | 488 + 534 + 96 agentes · 41 M | 283 páginas, 208.414 palabras |
| 11 Página clave (cada una) | 14 agentes · 2,2-2,5 M · 50-85 min | FAQ, servicios, renombres, permisos |
| 13 Auditoría | 14 agentes | 83 hallazgos, 27 acciones |

Cortes por límite de uso o de sesión: el 17, 20, 21, 27 y 28 (tres veces).
Todo flujo largo se diseña para relanzarse.

---

# D. LAS 15 LECCIONES QUE MÁS AHORRAN

1. **Pedirlo todo al principio** (sección 1): lo que llegó a trozos abortó
   flujos y lo que nunca llegó sigue pendiente.
2. **Inventario primero, con dos señales de clasificación, regenerable y
   leído por tramos.**
3. **Limpiar el original y fijar las cifras antes de renombrar y redactar.**
4. **Lista blanca completa y explícita**, con lo que sí se permite y la
   página fuente de cada cifra.
5. **Fichas locales verificadas antes de escribir una línea de localidad**,
   indexadas por slug, con «no verificado: omitir».
6. **Verificar página a página, nunca por lote.**
7. **Duplicados: topónimo → marcador y contar páginas (≥3)**, antes del
   verificador.
8. **Decir qué afirmar, no solo qué prohibir.**
9. **Comprobación de hechos legal aparte del verificador de cifras**, y
   buscar cada error en todo el sitio.
10. **Los agentes no escriben ficheros; nada se publica sin aprobar.**
11. **Fijar todas las reglas y umbrales antes de lanzar, en un fichero
    único**; guardar cada etapa en disco; comprobar la cobertura al acabar.
12. **El corrector cuenta antes de devolver; para lo mecánico, script.**
13. **Páginas hermanas: tabla canónica, revisor de cruce y editor único.**
14. **Medir en navegador real sobre la web compilada**, y re-medir antes de
    aplicar una propuesta del plan.
15. **Al propietario: palabras llanas, cifras del fichero, un ejemplo por
    acción, todas las decisiones en un mensaje**, y avisar cuando algo
    deshace una decisión suya.

---

# E. EL KIT

| Carpeta del zip | Qué hay | Uso |
|---|---|---|
| `flujos/` | Los 22 scripts de flujos con los prompts literales (investigación y plan, competencia, fichas y ampliaciones, corrección y última ronda, modelos por m², guías y servicios, encabezados, servicios con fotos, páginas clave, alts, tuteo, auditoría, precios) | Plantillas: cambiar rutas, listas y la lista blanca |
| `herramientas/` | Los scripts de medida y corrección que vivían en `capturas-tmp/` y no estaban en el repositorio: `extraer-ampliaciones`, `preparar-correccion`, `quitar-deposito`, `cobertura-modelos`, `encabezados/` y `encabezados-tipos/` (extraer, fusionar, deterministas, revisar, aplicar, tarjetas), `auditoria/` (inventario, ciudades-cruzadas, botones-vacios, renders, fuentes, caracteres, cajas, peso, iniciador, sin-medidas, botones), `erratas/` (medir, aplicar-tuteo, voseo-palabras), `precios/menciones`, `fotos/` (descargar, integrar), `nuevas/` (comprobar, manual, probar-componentes, probar-calculadora, zonas-check), `modelos-m2/` (pulir-m2, extraer), `intro/` (medir), `servicios-home/`, `maritimos/`, `prefabricadas/`; más `plan/_principios.json` y `auditoria/plan.txt` como ejemplos de salida | Copiar al proyecto nuevo (`herramientas/`) y adaptar |
| `kit/scripts/` | `inventario`, `aplicar-ampliacion`, `nueva-pagina`, `nueva-pagina-modelo`, `corregir-erratas` + `erratas`, `botones-descriptivos`, `zonas`, `capturar`, `fotos-servicios`, `webp`, `analizar-imagenes`, `fuentes-locales`, `validar`, `comparar-encabezados` | `aplicar-ampliacion`, `corregir-erratas`, `capturar` y `renombres` tal cual; el resto, adaptar listas y tipos |
| `kit/src/` | `utils/` (render, comunes, intro, tipos, hero, imagenes, renombres), `pages/[...slug].astro`, `layouts/Base.astro`, `components/` (ServiciosContenedores, CalculadoraHipoteca, FormularioPasos, CatalogoModelos, Header), `scripts/formularios.js` | Motor y componentes |
| `kit/src/data/` | `encabezados.json`, `erratas.json`, `orden-tipos.json`, `modelos-m2.json`, `zonas.json`, `intro-ciudades.json`, `intro-libres.json`, `servicios.json`, `imagenes.json` | **Ejemplos de formato**: se vacían y se rellenan con los datos de la web nueva |

Datos que hay que crear en el proyecto nuevo: los de `src/data/` de arriba,
`site.json` con la clave del formulario, `menus.json` con el campo `grupo`, y
`estructura-viva.json` (encabezados de la web en producción) para el
comparador.

---

# F. QUÉ AÑADIR A `CLAUDE.md`

```markdown
## SEO (PROMPT-SEO-V1.md)
- Fase actual: [n] — falta: [...]
- Decisiones: Dec. 1 [..] 2 [..] 3 [..] 4 [..] 5 [..] 6 [..] 7 [..]
- Lista blanca de cifras y hechos (con la página fuente de cada una): [...]
- Datos del propietario recibidos: [...] · pendientes: [...]
- Excepciones autorizadas al original: [encabezados.json, erratas.json, ...]
- Umbrales: [ruta del fichero único]
- Resultados guardados: capturas-tmp/inventario.json, seo-resultado.json,
  competencia.json, plan/, fichas-locales.json, ampliaciones*.json,
  correcciones*.json, auditoria/plan.txt
```

---

# ANEXO — Plantillas literales que más se reutilizan

**Cabecera de todos los prompts (NO_ESCRIBIR):**
> IMPORTANTE: PROHIBIDO crear, editar o borrar ficheros (ni JSON, ni código,
> ni imágenes). Solo lees y devuelves el resultado estructurado; la
> integración la hace otro. Puedes escribir scripts temporales solo en el
> directorio temporal del sistema.

**Verificador:**
> Eres un verificador ADVERSARIAL de contenido SEO para [sitio]. Busca
> motivos para RECHAZAR (aprobado=false) y lístalos citando el fragmento
> exacto: [criterios numerados]. No rechaces por lo que las reglas permiten
> expresamente ([lista blanca]) ni por matices de estilo. Si apruebas, deja
> en «problemas» solo observaciones menores. No navegues por la web:
> contrasta solo con la ficha y con HECHOS. Cuenta tú mismo negritas,
> apariciones de la palabra clave, caracteres del título y de la
> descripción, y palabras.
> Esquema: `{aprobado: boolean, problemas: string[]}`.

**Reintento:**
> EL VERIFICADOR RECHAZÓ LA VERSIÓN ANTERIOR POR ESTO; corrígelo todo sin
> perder el resto:
> - …

**Corrector de retoque mínimo:**
> Haz un RETOQUE MÍNIMO: resuelve cada problema de la lista y deja todo lo
> demás igual. Antes de devolverla, repasa TODAS las reglas, no solo los
> problemas citados: cuenta negritas por párrafo y su número de palabras,
> enlaces totales, apariciones de la palabra clave, h3-pregunta y longitud
> de cada respuesta de la FAQ.

**Escéptico de auditoría:**
> Comprueba UNO A UNO estos hallazgos contra los ficheros, el inventario o la
> web publicada (repite las medidas clave tú mismo) e intenta refutarlos:
> cifras mal contadas, problemas que no lo son, propuestas que romperían
> algo o que contradicen las reglas del proyecto. Veredicto por hallazgo:
> confirmado, matizado (con la versión corregida) o refutado.

**Esquema de una ampliación:**
```json
{ "ruta": "/ruta/",
  "secciones": [ { "nivel": "h2", "titulo": "…", "html": "<p>…</p>" },
                 { "nivel": "h3", "titulo": "¿…?", "html": "<p>…</p>" } ],
  "faq": { "titulo": "Preguntas frecuentes sobre …",
           "items": [ { "pregunta": "¿…?", "respuesta": "…" } ] } }
```

**Esquema de una página nueva:** `slug, titulo (h1, 3-7 palabras), tituloSeo,
descripcion, palabraClave, foto, fotoAlt, intro{h2, html}, secciones[],
faq{titulo, items[]}`.

**Esquema de un hallazgo de auditoría:** `titulo, problema (con cifras y
rutas), evidencia (cómo se comprobó), propuesta, impacto, esfuerzo,
tocaOriginal, necesitaPropietario`; y de una acción del plan: `prioridad,
area, titulo, que, porque, impacto, esfuerzo, quien`.

---

*Reconstrucción completa, con fichero y línea: `analisis/ANALISIS-SEO-CASAS.md`.*
