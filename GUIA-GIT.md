# Subir la carpeta a GitHub, paso a paso

Objetivo: que la carpeta `casascontenedores` del Escritorio acabe en un
repositorio de GitHub. Así yo me la descargo desde ahí (imágenes incluidas) y
seguimos sin tener que pasarnos archivos por el chat.

Hazlo **después** de ejecutar los tres scripts del `LEEME-PRIMERO.md`, para que
las imágenes ya estén dentro.

---

## 1. Instalar Git (solo la primera vez)

Comprueba si ya lo tienes. Abre el **Símbolo del sistema** (tecla Windows,
escribe `cmd`, Enter) y teclea:

```
git --version
```

- Si contesta `git version 2.x.x` → ya lo tienes, pasa al punto 2.
- Si dice que no reconoce la orden → descárgalo de <https://git-scm.com/download/win>,
  instálalo dándole a **Siguiente** a todo sin cambiar nada, cierra la ventana
  negra y ábrela otra vez.

Y dile a Git quién eres (esto se hace una vez en la vida):

```
git config --global user.name "Yamandu Rodriguez"
git config --global user.email "licyamandurodriguez3@gmail.com"
```

---

## 2. Crear el repositorio en GitHub

En el navegador, con tu sesión de GitHub abierta:

1. Ve a <https://github.com/new>
2. **Repository name**: `casascontenedores`
3. **Public** (déjalo público: así puedo descargármelo yo sin que tengas que
   darme ninguna contraseña. El contenido es tu web, que ya es pública)
4. **NO** marques "Add a README file" ni ninguna de las otras casillas.
   Tiene que quedar vacío.
5. Botón verde **Create repository**

Te quedará una página con instrucciones. Ignórala, usa las de abajo.

---

## 3. Conectar la carpeta y subirla

Vuelve al Símbolo del sistema y escribe esto, una línea cada vez, pulsando
Enter después de cada una:

```
cd %USERPROFILE%\Desktop\casascontenedores
```

```
git init
```

```
git add .
```

```
git commit -m "Contenido extraido del WordPress, imagenes y muestra del diseno actual"
```

```
git branch -M main
```

```
git remote add origin https://github.com/Yamarodriguez/casascontenedores.git
```

```
git push -u origin main
```

**Ojo con el último**: en `Yamarodriguez` pon tu usuario real de GitHub, tal
como aparece en la barra de direcciones cuando entras en tu perfil.

---

## 4. Identificarte

Al lanzar el `git push` se abrirá una ventana del navegador pidiéndote entrar
en GitHub. Entra con tu cuenta y dale a autorizar. Eso lo hace **Git en tu
ordenador**: yo no veo ni toco tu contraseña, y no hace falta que me la pases.

A partir de ahí ya no te la volverá a pedir.

Si la subida tarda varios minutos es normal: son las imágenes.

---

## 5. Avísame

Cuando termine, pégame en el chat la dirección del repositorio, del estilo:

```
https://github.com/tu-usuario/casascontenedores
```

Yo me lo descargo, monto la web entera encima, la valido, la compilo y te
devuelvo el proyecto terminado. La última subida a GitHub la harás tú con dos
órdenes, porque para escribir en tu repositorio haría falta una contraseña tuya
y prefiero no manejarla:

```
git add .
git commit -m "Web migrada a Astro"
git push
```

---

## Si algo falla

| Lo que ves | Qué pasa |
|---|---|
| `'git' no se reconoce...` | No está instalado o no has reabierto la ventana. Cierra y abre el Símbolo del sistema. |
| `remote origin already exists` | Ya lo conectaste antes. Usa `git remote set-url origin https://...` con la dirección buena. |
| `Updates were rejected` | El repositorio no estaba vacío. Bórralo en GitHub y créalo de nuevo sin marcar ninguna casilla. |
| `Repository not found` | El usuario o el nombre están mal escritos en la dirección. |
| Se queda parado mucho rato | Son las imágenes subiendo. Déjalo. |

Cualquier mensaje raro, cópiamelo tal cual y te digo qué es.
