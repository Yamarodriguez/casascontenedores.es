@echo off
REM ============================================================
REM  RAMA.bat  —  guarda el rediseño en una rama de Git aparte.
REM  Doble clic sobre este fichero.
REM
REM  Que hace:
REM   1. Crea la rama "rediseno" a partir de lo que tengas ahora.
REM   2. Mete en ella TODOS los cambios del rediseño.
REM   3. La sube a GitHub.
REM
REM  Tu rama principal (main) NO se toca: sigue con la web como
REM  estaba. Para volver a ella:   git checkout main
REM  Para volver al rediseno:      git checkout rediseno
REM ============================================================
cd /d "%~dp0"
title Casas Contenedores - crear rama del rediseno

echo.
echo ===== Rama en la que estas ahora =====
git rev-parse --abbrev-ref HEAD
echo.

echo ===== 1 de 4 : creando la rama "rediseno" =====
git checkout -b rediseno 2>nul
if errorlevel 1 (
  echo    La rama ya existia. Me cambio a ella.
  git checkout rediseno
  if errorlevel 1 goto error
)

echo.
echo ===== 2 de 4 : anadiendo los cambios =====
git add -A
if errorlevel 1 goto error

echo.
echo ===== 3 de 4 : guardando el cambio =====
git commit -m "Rediseno visual: marcado y hoja de estilo propios, heroe y franja de cierre" -m "El contenido no se toca: las 263 paginas conservan los mismos encabezados, en el mismo orden, que la web en vivo. Las hojas de Elementor ya no se cargan; el aspecto lo pone src/styles/diseno.css."
if errorlevel 1 (
  echo    No habia nada nuevo que guardar, o ya estaba guardado. Sigo.
)

echo.
echo ===== 4 de 4 : subiendo la rama a GitHub =====
git push -u origin rediseno
if errorlevel 1 goto error

echo.
echo ============================================================
echo  LISTO. El rediseno esta en la rama "rediseno" de GitHub.
echo.
echo  Tu web publicada NO cambia: Netlify sigue publicando main.
echo  Para ver el rediseno en tu ordenador:  VER.bat
echo  Para volver a la web de antes:         git checkout main
echo ============================================================
pause
exit /b 0

:error
echo.
echo ############################################################
echo  ALGO HA FALLADO. Copia el texto del error y pasamelo.
echo  Lo mas habitual: Git te pide usuario y contrasena de GitHub.
echo ############################################################
pause
exit /b 1
