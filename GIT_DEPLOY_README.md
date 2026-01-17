# 🚀 DEPLOY PARA GITHUB - PRO Concursos

## 📋 PRÉ-REQUISITOS

### ✅ Git Instalado
Se você não tem o Git instalado:

1. **Baixe o Git:**
   - Vá para: https://git-scm.com/downloads
   - Baixe e instale a versão para Windows

2. **Verifique a instalação:**
   ```bash
   git --version
   # Deve mostrar algo como: git version 2.39.0
   ```

### ✅ Conta GitHub
- Conta criada em: https://github.com
- Repositório: `https://github.com/naussen/pro-frontend`

---

## 🎯 OPÇÕES DE DEPLOY

### Opção 1: Script Automático (Recomendado)

#### Execute o Script `deploy_git.bat`

```bash
# Navegue até a pasta do projeto
cd "D:\pro-frontend - Copia (2)"

# Execute o script (duplo clique ou comando)
deploy_git.bat
```

**O que o script faz:**
1. ✅ Configura credenciais Git
2. ✅ Inicializa repositório (se necessário)
3. ✅ Conecta ao repositório remoto
4. ✅ Adiciona todos os arquivos
5. ✅ Faz commit das mudanças
6. ✅ **Força push** para limpar histórico remoto
7. ✅ Verifica status final

---

### Opção 2: Deploy Manual (Passo a Passo)

Se preferir fazer manualmente:

#### 1. Configurar Git
```bash
# Configurar credenciais
git config --global user.name "naussen"
git config --global user.email "naussen@hotmail.com"
```

#### 2. Inicializar Repositório
```bash
# Navegar para a pasta do projeto
cd "D:\pro-frontend - Copia (2)"

# Inicializar Git (se não existir)
git init

# Adicionar remote
git remote add origin https://github.com/naussen/pro-frontend.git
```

#### 3. Preparar Arquivos
```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Nova versão com Vite - arquitetura modular completa"
```

#### 4. Deploy (Sobrescrever Remoto)
```bash
# ⚠️  ATENÇÃO: Isso limpa o histórico remoto
git push -f origin main
```

---

## 🔐 CONFIGURAÇÃO DO GITHUB (Se necessário)

### Personal Access Token (se solicitado senha)

Se o GitHub pedir senha durante o push:

1. **Crie um Personal Access Token:**
   - Vá para: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Nome: "PRO Concursos Deploy"
   - Permissões: Marque **"repo"** (acesso completo aos repositórios)
   - Clique em "Generate token"

2. **Use o token como senha:**
   - Username: `naussen`
   - Password: **cole o token gerado**

3. **Token é válido apenas uma vez:**
   - Guarde em local seguro
   - Use apenas quando necessário

---

## 📊 VERIFICAÇÃO PÓS-DEPLOY

### No GitHub:
1. ✅ Vá para: https://github.com/naussen/pro-frontend
2. ✅ Verifique se todos os arquivos estão lá
3. ✅ Veja o último commit: "Nova versão com Vite - arquitetura modular completa"

### Local:
```bash
# Verificar status
git status
git log --oneline -3
```

---

## 🔄 DEPLOY AUTOMÁTICO (Netlify)

Após o push para GitHub:

### 1. Configurar Netlify
```bash
# Login no Netlify
npx netlify login

# Conectar ao repositório
npx netlify init
# OU
npx netlify link
```

### 2. Configurar Build Settings
- **Branch:** `main`
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### 3. Configurar Environment Variables
No Netlify Dashboard → Site Settings → Environment Variables:

#### 🔥 Credenciais Firebase (OBRIGATÓRIAS):
```
FIREBASE_API_KEY = AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8
FIREBASE_AUTH_DOMAIN = nvp-concursos.firebaseapp.com
FIREBASE_PROJECT_ID = nvp-concursos
FIREBASE_STORAGE_BUCKET = nvp-concursos.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID = 397960760271
FIREBASE_APP_ID = 1:397960760271:web:1243b04141178453d860ba
FIREBASE_MEASUREMENT_ID = G-T6RVBM12BQ
```

#### 💳 Pagamento (Opcional):
```
MERCADOPAGO_ACCESS_TOKEN = seu_token_aqui
```

**⚠️ IMPORTANTE:** Configure TODAS as variáveis do Firebase antes do deploy para evitar erros de autenticação.

### 4. Deploy Automático
```bash
# Todo push para main dispara deploy automático
git push origin main
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### ❌ "git is not recognized"
```
✅ Instale o Git: https://git-scm.com/downloads
✅ Reinicie o terminal após instalação
✅ Verifique: git --version
```

### ❌ "Permission denied" ou "Authentication failed"
```
✅ Configure Personal Access Token
✅ Verifique username: naussen
✅ Use token como senha
```

### ❌ "fatal: remote origin already exists"
```
✅ Remova remote antigo:
   git remote remove origin
✅ Adicione novamente:
   git remote add origin https://github.com/naussen/pro-frontend.git
```

### ❌ "failed to push some refs"
```
✅ Force push para sobrescrever:
   git push -f origin main
```

---

## 📁 ESTRUTURA FINAL NO GITHUB

Após deploy bem-sucedido:

```
pro-frontend/
├── 📄 *.html                 # Páginas MPA
├── 🎨 styles/               # CSS modular
├── 📜 scripts/              # JavaScript ES6
├── 🔧 vite.config.js        # Build system
├── 📦 package.json          # Dependências
├── 🗂️ netlify/              # Serverless functions
├── 🚀 deploy_git.bat        # Script de deploy
└── 📚 *.md                  # Documentação
```

---

## 🎉 DEPLOY CONCLUÍDO!

Após executar o script ou comandos manuais:

1. ✅ **Repositório limpo** no GitHub
2. ✅ **Nova versão** com Vite implantada
3. ✅ **Arquitetura modular** documentada
4. ✅ **Deploy automático** configurado
5. ✅ **Produção pronta** para uso

**🚀 Agora você tem um projeto profissional no GitHub com deploy automatizado!**

---

*Para dúvidas, consulte a documentação completa em `DEPLOY_GUIDE.md` e `README_VITE.md`.*
