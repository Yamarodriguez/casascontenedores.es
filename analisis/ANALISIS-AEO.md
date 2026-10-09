# Análisis AEO: que las inteligencias artificiales lean y citen casascontenedores.es

Fecha: 9 de octubre de 2026. Medido sobre la web en vivo (`https://casascontenedores.es`).

**AEO** (optimización para motores de respuesta) es lo mismo que el SEO, pero
pensado para ChatGPT, Claude, Perplexity, Gemini y los resúmenes con IA de
Google. Esas herramientas mandan un robot a leer la web y, cuando alguien les
pregunta «¿cuánto cuesta una casa contenedor?», responden con frases sacadas de
las webs que mejor contestan… y a veces las citan con enlace.

Para que nos citen hacen falta tres cosas: **que el robot pueda entrar**, **que
entienda quiénes somos** y **que encuentre respuestas cortas y concretas**.

---

## 1. ¿Pueden entrar los robots de IA? — Sí, sin problemas

Hemos llamado a la portada haciéndonos pasar por cada robot:

| Robot | De quién es | Resultado |
|---|---|---|
| GPTBot, OAI-SearchBot, ChatGPT-User | ChatGPT (OpenAI) | Entra (200) |
| ClaudeBot, Claude-User | Claude (Anthropic) | Entra (200) |
| PerplexityBot | Perplexity | Entra (200) |
| Google-Extended | Gemini (Google) | Entra (200) |
| Applebot-Extended | Apple Intelligence | Entra (200) |
| CCBot | Common Crawl (lo usan muchas IA) | Entra (200) |
| Bytespider | TikTok / ByteDance | Entra (200) |

Además, lo que ya está bien:

- **La web es HTML estático (Astro).** Todo el texto está en la página desde el
  primer momento; el robot no tiene que ejecutar nada para leerlo. Muchas webs
  de la competencia (Elementor, Wix) cargan parte del texto con JavaScript y
  las IA no lo ven. Esto es una ventaja real.
- **Rápida**: la portada responde en menos de medio segundo y pesa 100 KB.
- **robots.txt deja pasar a todos** y apunta al sitemap (283 direcciones).
- **Cada página ya lleva marcado para máquinas** (JSON-LD): `WebSite`,
  `Organization`, `WebPage`, `FAQPage` y `BreadcrumbList`.
- **Las preguntas frecuentes están en el propio HTML** (desplegables
  `<details>`), no escondidas tras JavaScript. Las IA las leen tal cual.
- **Las guías nuevas** (por ejemplo `/casa-contenedor-suelo-rustico/`) ya están
  escritas como le gusta a una IA: el título es la pregunta y la primera frase
  la contesta.

---

## 2. Lo que falta, por orden de impacto

### 2.1 La página de precios no dice ningún precio (lo más importante)

La pregunta que más se le hace a una IA sobre este tema es «¿cuánto cuesta una
casa contenedor?». En `/precios/` los encabezados prometen precios («Casas
contenedores precios según m2») pero el texto que sigue habla de asesoramiento
y remite al catálogo. **La IA no encuentra una cifra que citar, así que cita a
otro.**

Lo mismo pasa con los plazos («¿cuánto se tarda?»).

> **Necesito de ti, Yama:** una horquilla de precio por m² (o por modelo) y los
> plazos reales. No me los invento. Con eso se añade, al principio de
> `/precios/`, una tablita y una frase del tipo «Una casa contenedor de 30 m²
> cuesta entre X € y Y €, llave en mano, sin parcela». Es el cambio que más
> citas puede traer.

### 2.2 La IA no sabe bien quién es la empresa

El marcado `Organization` solo lleva nombre, web, correo y teléfono. Le falta:

- **Logo**.
- **Dirección / zona** (el aviso legal dice Valencia). Lo ideal es marcar la
  empresa como negocio local (`LocalBusiness` / `HomeAndConstructionBusiness`)
  con la zona de servicio «España».
- **Perfiles en otras webs** (`sameAs`): Google Business, Instagram, Facebook,
  YouTube, prefabricadascasas.es… Las IA se fían más de una empresa cuando la
  ven igual en varios sitios.
- **No hay página de «Quiénes somos».** Las IA (y Google) valoran saber quién
  está detrás: años de experiencia, obras hechas, zona en la que trabajáis.

> **Necesito de ti:** tus perfiles en redes / Google Business y si quieres
> página de «Quiénes somos» (con datos que tú me des).

### 2.3 Falta registrarse en Bing

ChatGPT busca en internet a través de **Bing**, y Copilot también. Hoy la web
solo está dada de alta en Google Search Console. Darla de alta en **Bing
Webmaster Tools** (se puede importar desde Search Console en dos clics) y
activar **IndexNow** (aviso automático a Bing cada vez que cambia una página)
hace que ChatGPT vea antes los cambios.

> Lo de Bing lo tienes que hacer tú con tu cuenta (te guío). IndexNow lo dejo
> yo montado en la web.

### 2.4 Fichero `llms.txt` (no existe)

Es un fichero nuevo, pensado para IA: un resumen en texto plano de qué es la
web y cuáles son sus páginas importantes (precios, modelos, permisos, guías,
FAQ). Hoy da error 404. Hacerlo es barato y no toca nada de lo que se ve.

### 2.5 Todas las páginas dicen que cambiaron el mismo día

El sitemap marca las 283 páginas con la fecha del último despliegue
(6-10-2026), hayan cambiado o no. Los robots aprenden a no fiarse de esa fecha.
Mejor poner a cada página la fecha en que cambió de verdad (se saca del
historial de git) y añadir esa fecha también al marcado de la página
(`dateModified`). Las IA prefieren contenido con fecha reciente y fiable.

### 2.6 Descripciones antiguas con «✅» y palabras repetidas

Las páginas heredadas de WordPress llevan descripciones como «Casas
contenedores Precios ✅, Precios de Construcción de casas hechas con container…».
Las IA a veces usan esa descripción para resumir la página, y esta no resume
nada. Las guías nuevas ya tienen descripciones buenas (frases que explican).

> **Decisión tuya:** la descripción no se ve en la página, pero es texto
> original. ¿Me dejas reescribir las de las páginas principales (portada,
> precios, modelos, permisos, provincias grandes)?

### 2.7 Decidir qué robots de IA dejamos entrar

Hoy entran todos. Hay dos tipos:

- **Los que buscan para responder** (OAI-SearchBot, ChatGPT-User, Claude-User,
  PerplexityBot): son los que pueden **citarte con enlace**. Deben entrar sí o sí.
- **Los que leen para entrenar** (GPTBot, ClaudeBot, Google-Extended, CCBot,
  Bytespider): usan el texto para aprender, sin enlace directo.

Mi recomendación para una web que quiere vender: **dejar entrar a todos**
(también ayuda a que la IA «conozca» la marca), y bloquear solo Bytespider,
que gasta mucho y no trae visitas. Dejaría el `robots.txt` con los nombres
escritos uno a uno para que quede clara la decisión.

---

## 3. Plan propuesto

**Lo que puedo hacer ya, sin datos tuyos y sin tocar el contenido:**

1. Crear `llms.txt` con el resumen de la web y sus páginas clave.
2. Escribir el `robots.txt` con cada robot de IA nombrado (todos permitidos,
   salvo lo que decidas sobre Bytespider).
3. Fechas reales por página en el sitemap y `dateModified` en el marcado.
4. Montar IndexNow para avisar a Bing de los cambios.
5. Completar el marcado de la empresa con lo que ya está en la web (logo, zona
   de servicio, Valencia).

**Lo que necesita algo de ti:**

6. Precios y plazos reales → tabla y respuesta directa en `/precios/`.
7. Perfiles en redes / Google Business → `sameAs`.
8. Datos para una página «Quiénes somos».
9. Permiso para reescribir las descripciones antiguas.
10. Alta en Bing Webmaster Tools (con tu cuenta).

Después de publicar, se puede comprobar cada mes preguntando a ChatGPT,
Perplexity y Gemini cosas como «¿cuánto cuesta una casa contenedor en
Valencia?» y apuntando si nos citan.
