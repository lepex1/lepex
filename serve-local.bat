@echo off
rem Local host for lepex1.github.io (production preview of dist/).
rem Double-click -> new terminal window with the server in foreground.
rem Close the window or press Ctrl+C -> server stops.
rem Server: scripts/serve-local.mjs (static dist host with automatic
rem trailing slashes: /portfolio -> 301 /portfolio/).
title lepex - local host (127.0.0.1:4173)
cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
    echo npm not found in PATH. Install Node.js first.
    pause
    exit /b 1
)

echo Building latest changes...
call npm run build
if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
)

echo Serving dist at http://127.0.0.1:4173/ (Ctrl+C or close window to stop)
node scripts\serve-local.mjs --host 127.0.0.1 --port 4173 --open