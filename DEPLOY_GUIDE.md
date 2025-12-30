# 🚀 GUIA COMPLETO DE DEPLOY - PRO Concursos

Este guia explica como fazer deploy da aplicação PRO Concursos usando Vite + Netlify.

## 📋 PRÉ-REQUISITOS

### Sistema
- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git** configurado
- **Netlify CLI** (opcional, mas recomendado)

### Contas Necessárias
- ✅ Conta no **Netlify**
- ✅ Conta no **Mercado Pago** (para pagamentos)
- ✅ Projeto no **Firebase** (opcional)

---

## 🛠️ CONFIGURAÇÃO INICIAL

### 1. Instalar Dependências

```bash
# Instalar dependências do projeto
npm install

# Instalar Netlify CLI (globalmente)
npm install -g netlify-cli
```

### 2. Configurar Git (se ainda não configurado)

```bash
git init
git add .
git commit -m "Initial commit - PRO Concursos with Vite"
```

### 3. Login no Netlify

```bash
# Fazer login no Netlify
netlify login

# Ou configurar token (mais seguro para CI/CD)
export NETLIFY_AUTH_TOKEN=your_token_here
```

### 4. Criar/Configurar Site no Netlify

```bash
# Criar novo site
netlify init

# OU conectar repositório existente
netlify link
```

---

## 🔧 CONFIGURAÇÃO DE VARIÁVEIS DE AMBIENTE

### No Netlify Dashboard

1. Vá para: **Site Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

#### 🔥 OBRIGATÓRIAS
```
MERCADOPAGO_ACCESS_TOKEN = seu_access_token_do_mercado_pago
```

#### 🎯 RECOMENDADAS PARA PRODUÇÃO
```
FIREBASE_API_KEY = sua_api_key
FIREBASE_AUTH_DOMAIN = seu-projeto.firebaseapp.com
FIREBASE_PROJECT_ID = seu-project-id
FIREBASE_STORAGE_BUCKET = seu-projeto.appspot.com
FIREBASE_MESSAGING_SENDER_ID = 123456789
FIREBASE_APP_ID = 1:123:web:abc123

GA_TRACKING_ID = GA-XXXXXXXXXX
HOTJAR_ID = 1234567
```

### Localmente (para desenvolvimento)

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar com seus valores reais
nano .env
```

---

## 🚀 OPÇÕES DE DEPLOY

### Opção 1: Deploy Automático (Git-based)

#### Configurar Deploy Automático

1. **Conecte o repositório:**
   - Netlify Dashboard → **Site Settings** → **Build & Deploy**
   - **Repository**: Selecione seu repositório Git

2. **Configure as opções de build:**
   ```
   Branch: main (ou master)
   Build command: npm run build
   Publish directory: dist
   ```

3. **Deploy automático:**
   ```bash
   git add .
   git commit -m "Deploy automático"
   git push origin main
   ```

### Opção 2: Deploy Manual (Drag & Drop)

```bash
# Fazer build
npm run build

# Deploy manual (arrastar pasta dist)
netlify deploy --dir=dist --prod
```

### Opção 3: Deploy via Script Automatizado

```bash
# Deploy para produção
npm run deploy:prod

# Deploy para staging
npm run deploy:staging

# Deploy para preview
npm run deploy:preview
```

---

## 📊 MONITORAMENTO E VERIFICAÇÃO

### Após o Deploy

#### 1. Verificar Status do Site
```bash
# Verificar status no Netlify
netlify status

# Abrir site no navegador
netlify open:site
```

#### 2. Verificar Build Logs
- Netlify Dashboard → **Site** → **Builds**
- Verificar se não há erros nos logs

#### 3. Testar Funcionalidades
- ✅ Página inicial carrega
- ✅ Navegação funciona
- ✅ Sala de estudos abre
- ✅ Sistema de pagamentos funciona
- ✅ Autenticação Firebase (se configurada)

#### 4. Verificar Performance
- **Lighthouse Score** > 90
- **First Contentful Paint** < 1.5s
- **Time to Interactive** < 3s

---

## 🔧 DEPLOY AVANÇADO

### Branch-based Deploy

```bash
# Deploy da branch development
git checkout -b staging
git push origin staging

# Netlify criará deploy automático para staging.yoursite.netlify.app
```

### Domain Customizado

1. **Comprar domínio** (ex: proconcursos.com.br)
2. **Configurar no Netlify:**
   - Site Settings → Domain Management
   - Add custom domain
3. **Configurar DNS** conforme instruções do Netlify

### HTTPS e Segurança

✅ **Automático no Netlify:**
- SSL/TLS automático
- HTTPS forçado
- Headers de segurança configurados
- CSP (Content Security Policy)

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Build Falhando

```bash
# Verificar logs detalhados
npm run build 2>&1 | tee build.log

# Limpar cache e tentar novamente
npm run clean
npm run build
```

### Erro: "Command failed: npm run build"

```
✅ Verificar Node.js version: node --version
✅ Verificar npm: npm --version
✅ Verificar dependências: npm ls
✅ Verificar variáveis de ambiente
```

### Erro: "MERCADOPAGO_ACCESS_TOKEN not configured"

```
✅ Verificar se variável está configurada no Netlify Dashboard
✅ Verificar se não tem espaços extras
✅ Verificar se é a Access Token correta (não Public Key)
```

### Site Lento

```bash
# Verificar tamanho do bundle
npm run analyze

# Otimizações possíveis:
# - Code splitting ativo ✅
# - Compression ativa ✅
# - CDN ativo ✅
```

---

## 📈 OTIMIZAÇÃO DE PERFORMANCE

### Métricas Alvo

| Métrica | Valor Alvo | Status |
|---------|------------|--------|
| **First Contentful Paint** | < 1.5s | ✅ |
| **Largest Contentful Paint** | < 2.5s | ✅ |
| **Time to Interactive** | < 3.0s | ✅ |
| **Lighthouse Score** | > 90 | ✅ |
| **Bundle Size** | < 500KB | ✅ |

### Otimizações Ativas

- ✅ **Gzip Compression** (Netlify automático)
- ✅ **CDN Global** (Netlify Edge)
- ✅ **Browser Caching** (Headers otimizados)
- ✅ **Image Optimization** (Vite automático)
- ✅ **Code Splitting** (por página)
- ✅ **Tree Shaking** (automático)

---

## 🔄 CI/CD AVANÇADO

### GitHub Actions (Exemplo)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build
      run: npm run build
      env:
        VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
        MERCADOPAGO_ACCESS_TOKEN: ${{ secrets.MERCADOPAGO_ACCESS_TOKEN }}

    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=dist --prod
      env:
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

---

## 📞 SUPORTE E MONITORAMENTO

### Logs e Debugging

```bash
# Logs do Netlify
netlify logs

# Status do site
netlify status

# Abrir dashboard
netlify open:admin
```

### Monitoramento Contínuo

- **Uptime Monitoring**: Configure em serviços como UptimeRobot
- **Error Tracking**: Configure Sentry ou similar
- **Analytics**: Google Analytics 4
- **Performance**: Web Vitals monitoring

---

## 🎯 CHECKLIST FINAL DE DEPLOY

### Pré-Deploy
- [ ] Todas as variáveis de ambiente configuradas
- [ ] `npm run build` funciona localmente
- [ ] Site funciona com `npm run preview`
- [ ] Netlify CLI instalado e logado

### Pós-Deploy
- [ ] Site carrega corretamente
- [ ] Todas as páginas funcionam
- [ ] Sistema de pagamentos opera
- [ ] Autenticação funciona (se aplicável)
- [ ] Performance dentro dos parâmetros
- [ ] HTTPS ativo
- [ ] Domain configurado (se custom)

---

**🎉 Parabéns! Seu deploy está completo e otimizado!**

Para dúvidas ou problemas, consulte:
- 📖 [Documentação Netlify](https://docs.netlify.com)
- 🐛 [Issues do Projeto](https://github.com/nvp-concursos/frontend/issues)
- 💬 [Suporte NVP Concursos](mailto:suporte@nvpconcursos.com.br)
