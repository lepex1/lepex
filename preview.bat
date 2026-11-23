@echo off
cd /d "%~dp0"
title lepex preview - http://localhost:4173/

if not exist "dist\index.html" (
    echo dist\index.html is missing, building...
    call npm run build
    if errorlevel 1 goto :fail
)

echo.
echo Serving dist on http://localhost:4173/ - close this window to stop the server.
echo.
call npm run preview

echo.
echo Preview server stopped.
pause
exit /b

:fail
echo.
echo Build failed - see the output above.
pause
exit /b 1
