@echo off
rem Empaqueta los PNG de assets\texturas en js\generado\texturas.js (ver README.md).
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (py -3 herramientas\texturas.py) else (python herramientas\texturas.py)
pause
