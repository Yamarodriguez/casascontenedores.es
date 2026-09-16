@echo off
REM ============================================================
REM  ARREGLAR.bat  —  aplica el rediseño y comprueba.
REM  Doble clic, o desde Simbolo del sistema en esta carpeta.
REM ============================================================
cd /d "%~dp0"
echo.
echo ===== 1 de 3 : descomprimiendo el contenido de las paginas =====
powershell -NoProfile -Command "Expand-Archive -Path '%~dp0paginas.zip' -DestinationPath '%~dp0src\content' -Force"
if errorlevel 1 goto error

echo.
echo ===== 2 de 3 : instalando letras e iconos (si faltan) =====
call npm install
if errorlevel 1 goto error

echo.
echo ===== 3 de 3 : compilando y comprobando =====
call npm run todo

echo.
echo ============================================================
echo  TERMINADO. Arriba tiene que poner "fallos: 0" y
echo  "Las 263 paginas tienen los mismos encabezados...".
echo.
echo  Para verlo:   npm run dev
echo  y abrir       http://localhost:4321
echo ============================================================
pause
exit /b 0

:error
echo.
echo ############################################################
echo  ALGO HA FALLADO. Copia el texto del error y pasamelo.
echo ############################################################
pause
exit /b 1
