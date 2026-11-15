@echo off
setlocal
cd /d "%~dp0"

set "LOCAL_URL=http://127.0.0.1:4173/#/home"
set "PAGES_URL=https://oscanton.github.io/gimpro/#/home"

set "INTERACTIVE="
if "%~1"=="" (
  set "INTERACTIVE=1"
  goto menu
)
if /I "%~1"=="local" goto local
if /I "%~1"=="pages" goto pages
if /I "%~1"=="github" goto pages
if /I "%~1"=="test" goto test
if /I "%~1"=="e2e" goto e2e
if /I "%~1"=="build" goto build
if /I "%~1"=="help" goto help

echo Opcion desconocida: %~1
goto help

:menu
cls
echo.
echo  GIMPRO - Lanzador de pruebas
echo  ============================
echo.
echo  [1] Abrir servidor local
echo  [2] Abrir GitHub Pages
echo  [3] Ejecutar comprobaciones rapidas
echo  [4] Ejecutar pruebas de navegador
echo  [5] Generar build para GitHub Pages
echo  [0] Salir
echo.
choice /C 123450 /N /M "Selecciona una opcion: "
if errorlevel 6 exit /b 0
if errorlevel 5 goto build
if errorlevel 4 goto e2e
if errorlevel 3 goto test
if errorlevel 2 goto pages
if errorlevel 1 goto local

:requirements
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js no esta instalado o no esta en PATH.
  exit /b 1
)
where pnpm >nul 2>nul
if errorlevel 1 (
  echo ERROR: pnpm no esta instalado o no esta en PATH.
  echo Puedes habilitarlo con: corepack enable
  exit /b 1
)
if not exist "node_modules\.bin\vite.cmd" (
  echo Instalando dependencias...
  call pnpm install --frozen-lockfile
  if errorlevel 1 exit /b 1
)
exit /b 0

:local
call :requirements
if errorlevel 1 goto failed
echo.
echo Abriendo %LOCAL_URL%
echo Pulsa Ctrl+C para detener el servidor.
call pnpm dev --host 127.0.0.1 --port 4173 --open /#/home
exit /b %errorlevel%

:pages
echo Abriendo %PAGES_URL%
start "Gimpro GitHub Pages" "%PAGES_URL%"
exit /b 0

:test
call :requirements
if errorlevel 1 goto failed
call pnpm check
if errorlevel 1 goto failed
echo.
echo Todas las comprobaciones rapidas han pasado.
if defined INTERACTIVE pause
exit /b 0

:e2e
call :requirements
if errorlevel 1 goto failed
call pnpm test:e2e
if errorlevel 1 goto failed
echo.
echo Las pruebas de navegador han pasado.
if defined INTERACTIVE pause
exit /b 0

:build
call :requirements
if errorlevel 1 goto failed
call pnpm build:pages
if errorlevel 1 goto failed
echo.
echo Build de GitHub Pages creado en: %CD%\dist
if defined INTERACTIVE pause
exit /b 0

:help
echo.
echo Uso: gimpro.bat [local^|pages^|test^|e2e^|build]
echo.
echo   local  - Arranca Vite y abre el navegador local.
echo   pages  - Abre https://oscanton.github.io/gimpro/
echo   test   - Valida contenido, lint, tests unitarios y build.
echo   e2e    - Ejecuta flujo, accesibilidad y offline en navegador.
echo   build  - Genera dist/ con base /gimpro/ para GitHub Pages.
exit /b 1

:failed
echo.
echo La operacion ha fallado. Revisa el mensaje anterior.
if defined INTERACTIVE pause
exit /b 1
