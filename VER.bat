@echo off
REM ============================================================
REM  VER.bat  —  deja la web funcionando en tu ordenador.
REM  Doble clic sobre este fichero.
REM
REM  Abre el navegador solo, en http://localhost:4321
REM  DEJA LA VENTANA NEGRA ABIERTA mientras la miras.
REM  Para parar: Ctrl+C en esa ventana, o cerrarla.
REM ============================================================
cd /d "%~dp0"
title Casas Contenedores - servidor local

echo.
echo ===== 1 de 3 : instalando lo que falta =====
echo (la primera vez tarda un par de minutos; despues es instantaneo)
call npm install
if errorlevel 1 goto error

echo.
echo ===== 2 de 3 : generando letras, iconos y hojas de estilo =====
call npm run fuentes
if errorlevel 1 goto error
call npm run css
if errorlevel 1 goto error

echo.
echo ===== 3 de 3 : arrancando el servidor =====
echo El navegador se abre solo en unos segundos.
echo.
start "" cmd /c "timeout /t 12 >nul & start http://localhost:4321"
call npm run dev

echo.
echo El servidor se ha parado.
pause
exit /b 0

:error
echo.
echo ############################################################
echo  ALGO HA FALLADO en el paso de arriba.
echo  Copia el texto rojo del error y pasamelo.
echo ############################################################
pause
exit /b 1
