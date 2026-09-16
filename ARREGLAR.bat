@echo off
REM ============================================================
REM  ARREGLAR.bat  —  hace todo lo que falta, en orden.
REM  Doble clic sobre este fichero, o ejecutarlo desde
REM  Simbolo del sistema estando en esta carpeta.
REM ============================================================
cd /d "%~dp0"
echo.
echo ===== 1 de 5 : descomprimiendo el contenido de las paginas =====
powershell -NoProfile -Command "Expand-Archive -Path '%~dp0resto.zip' -DestinationPath '%~dp0' -Force"
if errorlevel 1 goto error

echo.
echo ===== 2 de 5 : montando las hojas de estilo originales =====
call npm run css
if errorlevel 1 goto error

echo.
echo ===== 3 de 5 : descargando las fotos que faltan =====
echo (incluidas las fotos de fondo de las franjas oscuras)
call node scripts/descargar-imagenes.mjs
if errorlevel 1 goto error

echo.
echo ===== 4 de 5 : descargando las letras y los iconos =====
echo (Roboto, Roboto Condensed, Font Awesome... tarda un par de minutos)
call node scripts/descargar-fuentes.mjs
if errorlevel 1 goto error

echo.
echo ===== 5 de 5 : compilando y comprobando =====
call npm run todo

echo.
echo ============================================================
echo  TERMINADO. Mira arriba: tiene que poner "fallos: 0".
echo  Si pone fallos: 0, ya puedes subirlo con:
echo      git add -A
echo      git commit -m "Fotos de fondo, letras e iconos"
echo      git push
echo ============================================================
pause
exit /b 0

:error
echo.
echo ############################################################
echo  ALGO HA FALLADO en el paso de arriba.
echo  Copia el texto del error y pasamelo.
echo ############################################################
pause
exit /b 1
