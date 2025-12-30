@echo off
REM =================================================================
REM 🚀 SCRIPT DE DEPLOY GIT - PRO Concursos
REM =================================================================
REM Este script limpa o repositório remoto e faz push da nova versão
REM
REM Requisitos: Git instalado no sistema
REM https://git-scm.com/downloads
REM =================================================================

echo 🚀 Iniciando deploy para GitHub...
echo.

REM Configurar credenciais do Git
echo 📝 Configurando credenciais do Git...
git config --global user.name "naussen"
git config --global user.email "naussen@hotmail.com"
echo ✅ Credenciais configuradas
echo.

REM Verificar se já existe um repositório Git
if exist .git (
    echo 📁 Repositório Git encontrado
    echo 🧹 Limpando arquivos não rastreados...
    git reset --hard HEAD
    git clean -fd
) else (
    echo 📁 Inicializando repositório Git...
    git init
)

REM Adicionar remote origin (força sobrescrever se existir)
echo 🔗 Configurando remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/naussen/pro-frontend.git
echo ✅ Remote configurado
echo.

REM Verificar conexão com o repositório
echo 🔍 Testando conexão com GitHub...
git ls-remote --heads origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Erro: Não foi possível conectar ao repositório GitHub
    echo ❌ Verifique se a URL está correta e se você tem acesso
    echo ❌ Você pode precisar configurar um Personal Access Token
    echo.
    echo 💡 Para configurar token:
    echo    1. Vá para: https://github.com/settings/tokens
    echo    2. Crie um "Personal Access Token (classic)"
    echo    3. Dê permissão "repo"
    echo    4. Use o token como senha quando solicitado
    echo.
    pause
    exit /b 1
)
echo ✅ Conexão com GitHub OK
echo.

REM Adicionar todos os arquivos
echo 📦 Adicionando arquivos...
git add .
echo ✅ Arquivos adicionados
echo.

REM Fazer commit
echo 💾 Fazendo commit...
set COMMIT_MSG=Nova versão com Vite - arquitetura modular completa
git commit -m "%COMMIT_MSG%"
if %errorlevel% neq 0 (
    echo ⚠️  Nenhum arquivo para commitar ou erro no commit
    echo ℹ️  Verificando status...
    git status
    echo.
    echo 💡 Se não há mudanças, o repositório já está atualizado
    goto :end
)
echo ✅ Commit realizado: %COMMIT_MSG%
echo.

REM Forçar push para branch main (limpa histórico remoto)
echo 🚀 Fazendo force push para branch main...
echo ⚠️  ATENÇÃO: Isso vai sobrescrever o histórico remoto!
echo.
set /p CONFIRM="Deseja continuar? (y/N): "
if /i not "!CONFIRM!"=="y" (
    echo ❌ Operação cancelada pelo usuário
    goto :end
)

git push -f origin main
if %errorlevel% neq 0 (
    echo ❌ Erro no push. Tentando push normal...
    git push origin main
    if %errorlevel% neq 0 (
        echo ❌ Erro no push normal também
        echo 💡 Possíveis soluções:
        echo    1. Configure um Personal Access Token
        echo    2. Verifique se você tem permissões de escrita
        echo    3. Execute: git push -u origin main
        goto :end
    )
)

echo ✅ Push realizado com sucesso!
echo.

REM Verificar status final
echo 📊 Status final:
git log --oneline -5
echo.
echo 🔗 URL do repositório: https://github.com/naussen/pro-frontend
echo.

:end
echo 🎯 Deploy concluído!
echo.
echo 💡 Próximos passos:
echo    1. ✅ Verifique o repositório no GitHub
echo    2. ✅ Configure Netlify para deploy automático
echo    3. ✅ Configure variáveis de ambiente no Netlify
echo    4. ✅ Teste o deploy automático
echo.
pause
