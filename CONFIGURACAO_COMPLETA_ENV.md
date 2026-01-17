# 🚀 Configuração Completa de Variáveis de Ambiente

## 📋 Guia Consolidado para Produção

Este guia mostra como configurar **todas** as variáveis de ambiente necessárias para o sistema Pro Concursos funcionar corretamente após as melhorias de segurança.

---

## 🎯 **PASSO 1: Configurar Frontend (Netlify)**

### Acesse: https://app.netlify.com

1. Selecione o site `proconcursos` (ou seu domínio)
2. Vá em **Site settings** → **Environment variables**
3. Clique em **Add a variable** para cada uma:

### 📱 **Variáveis para Frontend**

| Chave | Valor | Descrição | Obrigatório |
|-------|-------|-----------|-------------|
| `FIREBASE_API_KEY` | `AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8` | Chave da API Firebase | ✅ |
| `FIREBASE_AUTH_DOMAIN` | `nvp-concursos.firebaseapp.com` | Domínio de autenticação | ✅ |
| `FIREBASE_PROJECT_ID` | `nvp-concursos` | ID do projeto Firebase | ✅ |
| `FIREBASE_STORAGE_BUCKET` | `nvp-concursos.firebasestorage.app` | Bucket de storage | ✅ |
| `FIREBASE_MESSAGING_SENDER_ID` | `397960760271` | ID do sender | ✅ |
| `FIREBASE_APP_ID` | `1:397960760271:web:1243b04141178453d860ba` | ID da aplicação | ✅ |
| `FIREBASE_MEASUREMENT_ID` | `G-T6RVBM12BQ` | ID do Google Analytics | ❌ (Opcional) |

### 💳 **Variáveis para Funções Serverless (Netlify Functions)**

| Chave | Valor | Descrição | Obrigatório |
|-------|-------|-----------|-------------|
| `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-xxxxxxxxxxxxxxxxxx` | Token Mercado Pago | ✅ (para pagamentos) |
| `FIREBASE_SERVICE_ACCOUNT` | `{JSON completo}` | Service Account Firebase | ✅ (para webhooks) |

---

## 🖥️ **PASSO 2: Configurar Backend (Railway/Heroku/Render)**

### Escolha seu provedor:

#### **Railway** (Recomendado)
1. Acesse: https://railway.app
2. Selecione o projeto `proconcursos-backend`
3. Vá em **Variables**

#### **Heroku**
1. Acesse: https://dashboard.heroku.com
2. Selecione o app `proconcursos-backend`
3. Vá em **Settings** → **Config Vars**

#### **Render**
1. Acesse: https://dashboard.render.com
2. Selecione o serviço `proconcursos-backend`
3. Vá em **Environment**

### 🔑 **Variáveis para Backend**

| Chave | Valor | Descrição | Obrigatório |
|-------|-------|-----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | `{JSON completo da service account}` | Credenciais Firebase Admin | ✅ |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` | String de conexão MongoDB | ✅ |
| `GROQ_API_KEY` | `gsk_xxxxxxxxxxxxxxxxxxxxxxxx` | Chave da API Groq (IA) | ✅ |
| `MERCADO_PAGO_ACCESS_TOKEN` | `APP_USR-xxxxxxxxxxxxxxxxxx` | Token Mercado Pago | ✅ |
| `FRONTEND_URL` | `https://proconcursos.netlify.app` | URL do frontend | ✅ |
| `BACKEND_URL` | `https://proconcursos-backend.railway.app` | URL do backend | ✅ |
| `NODE_ENV` | `production` | Ambiente de execução | ✅ |
| `REDIS_URL` | `redis://user:pass@host:port` | URL do Redis | ❌ (Opcional) |

---

## 🔧 **PASSO 3: Como Obter as Credenciais**

### 📋 Lista de Serviços e Como Obter Credenciais

#### 1. **Firebase Service Account** (Backend)
```
1. Console Firebase: https://console.firebase.google.com
2. Projeto: nvp-concursos
3. Project settings → Service accounts
4. Generate new private key
5. Baixar JSON → Copiar TODO o conteúdo
```

#### 2. **MongoDB URI**
```
1. MongoDB Atlas: https://cloud.mongodb.com
2. Seu cluster → Connect → Connect your application
3. Copiar connection string
4. Substituir <username> e <password>
```

#### 3. **Groq API Key**
```
1. Groq Console: https://console.groq.com
2. API Keys → Create API Key
3. Copiar chave gerada
```

#### 4. **Mercado Pago Access Token**
```
1. Mercado Pago Developers: https://www.mercadopago.com.br/developers
2. Suas integrações → Selecionar aplicação
3. Credenciais de produção → Access Token
```

---

## ✅ **PASSO 4: Verificar Configuração**

### Teste Automático

Execute este comando no backend após configurar:

```bash
node -e "
console.log('🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE...\n');

// Variáveis obrigatórias
const required = [
  'MONGODB_URI',
  'FIREBASE_SERVICE_ACCOUNT',
  'GROQ_API_KEY',
  'MERCADO_PAGO_ACCESS_TOKEN',
  'FRONTEND_URL',
  'BACKEND_URL'
];

let allGood = true;
required.forEach(key => {
  if (!process.env[key]) {
    console.log('❌', key, '- FALTANDO');
    allGood = false;
  } else {
    console.log('✅', key, '- OK');
  }
});

console.log('\n' + (allGood ?
  '🎉 TODAS AS VARIÁVEIS OBRIGATÓRIAS CONFIGURADAS!' :
  '⚠️ CONFIGURE AS VARIÁVEIS EM VERMELHO ANTES DE CONTINUAR.'
));
"
```

### Teste Manual

1. **Deploy**: Faça deploy de ambos os projetos
2. **Teste Login**: Tente fazer login/cadastro
3. **Teste IA**: Gere um flashcard automaticamente
4. **Teste Pagamento**: Faça um pagamento de teste
5. **Verifique Logs**: Confirme que não há erros de configuração

---

## 🏠 **Configuração para Desenvolvimento Local**

### Frontend (.env)
```bash
# Firebase Configuration
FIREBASE_API_KEY=AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8
FIREBASE_AUTH_DOMAIN=nvp-concursos.firebaseapp.com
FIREBASE_PROJECT_ID=nvp-concursos
FIREBASE_STORAGE_BUCKET=nvp-concursos.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=397960760271
FIREBASE_APP_ID=1:397960760271:web:1243b04141178453d860ba
FIREBASE_MEASUREMENT_ID=G-T6RVBM12BQ
```

### Backend (.env)
```bash
# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT={\"type\":\"service_account\",...}

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# IA - Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxx

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Ambiente
NODE_ENV=development
PORT=3001

# Redis (opcional)
REDIS_URL=redis://localhost:6379
```

---

## 🚨 **Troubleshooting**

### Problemas Comuns

#### ❌ "Firebase credentials not found"
**Solução**: Verifique se `FIREBASE_SERVICE_ACCOUNT` contém o JSON completo

#### ❌ "MongoDB connection failed"
**Solução**: Verifique URI e credenciais no MongoDB Atlas

#### ❌ "GROQ_API_KEY not configured"
**Solução**: Sistema funcionará em modo fallback (sem IA avançada)

#### ❌ Rate limiting não funciona
**Solução**: Configure `REDIS_URL` ou deixe vazio (usará memória)

---

## 📊 **Status Final**

Após configurar tudo corretamente, você deve ver:

### ✅ **Backend**
- ✅ MongoDB conectado
- ✅ Firebase Admin inicializado
- ✅ Servidor rodando sem erros
- ✅ Rate limiting ativo

### ✅ **Frontend**
- ✅ Firebase inicializado com credenciais de produção
- ✅ Console mostra: `🔐 Firebase: Credenciais carregadas com sucesso`
- ✅ Login/cadastro funcionando
- ✅ Pagamentos processando

### ✅ **Integrações**
- ✅ Mercado Pago funcionando
- ✅ Groq API para IA
- ✅ Webhooks configurados

---

## 🎯 **Checklist Final**

- [ ] Frontend: Variáveis Firebase configuradas no Netlify
- [ ] Frontend: Token Mercado Pago configurado no Netlify
- [ ] Backend: Service Account Firebase configurada
- [ ] Backend: MongoDB URI configurada
- [ ] Backend: Groq API Key configurada
- [ ] Backend: URLs configuradas
- [ ] Deploy realizado em ambos os projetos
- [ ] Testes funcionais passando
- [ ] Logs sem erros de configuração

**🚀 Sistema pronto para produção com segurança máxima!**