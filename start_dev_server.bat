@echo off
echo ========================================
echo   PRO-Questoes - Servidor de Desenvolvimento
echo ========================================
echo.
echo Iniciando servidor local...
echo.
echo Frontend (pro-frontend): http://localhost:8000
echo Questoes (pro-questoes): http://localhost:8001
echo.
echo Para parar o servidor, pressione Ctrl+C
echo.

cd /d %~dp0
start "PRO-Frontend" cmd /c "cd /d %~dp0 && python -m http.server 8000"
start "PRO-Questoes" cmd /c "cd /d %~dp0..\pro-questoes && python -m http.server 8001"

echo Servidores iniciados!
echo.
echo URLs disponíveis:
echo - Frontend: http://localhost:8000/saladeestudos.html
echo - Questões: http://localhost:8001/qindex.html
echo.
pause
