@echo off
echo ===================================
echo   On Time Service - Локальный сервер
echo   Сайт: http://localhost:8080
echo ===================================
echo.
cd /d "%~dp0"
start http://localhost:8080
python -m http.server 8080
pause
