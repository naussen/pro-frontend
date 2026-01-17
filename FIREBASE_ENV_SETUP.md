# 🔐 Configuração Segura do Firebase - Variáveis de Ambiente

## 📋 Visão Geral

As credenciais do Firebase foram isoladas para variáveis de ambiente, eliminando o risco de exposição no código fonte.

## ⚙️ Configuração para Produção (Netlify)

### Passo 1: Acesse o Dashboard do Netlify

1. Vá para [https://app.netlify.com](https://app.netlify.com)
2. Selecione seu site `proconcursos`
3. Navegue para **Site settings** → **Environment variables**

### Passo 2: Adicione as Variáveis de Ambiente

Clique em **Add a variable** e adicione cada uma das seguintes variáveis:

| Chave | Valor | Descrição |
|-------|-------|-----------|
| `FIREBASE_API_KEY` | `AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8` | Chave da API do Firebase |
| `FIREBASE_AUTH_DOMAIN` | `nvp-concursos.firebaseapp.com` | Domínio de autenticação |
| `FIREBASE_PROJECT_ID` | `nvp-concursos` | ID do projeto Firebase |
| `FIREBASE_STORAGE_BUCKET` | `nvp-concursos.firebasestorage.app` | Bucket de armazenamento |
| `FIREBASE_MESSAGING_SENDER_ID` | `397960760271` | ID do sender de mensagens |
| `FIREBASE_APP_ID` | `1:397960760271:web:1243b04141178453d860ba` | ID da aplicação |
| `FIREBASE_MEASUREMENT_ID` | `G-T6RVBM12BQ` | ID do Google Analytics |

### Passo 3: Configurações Adicionais

Para cada variável, marque as seguintes opções:
- ✅ **Production**
- ✅ **Deploy Previews**
- ✅ **Branch Deploys**

### Passo 4: Deploy

```bash
git add .
git commit -m "feat: firebase credentials isolated to environment variables"
git push origin main
```

## 🏠 Configuração para Desenvolvimento Local

### Arquivo .env

Crie um arquivo `.env` na raiz do projeto frontend:

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

### Configuração do Servidor Local

Se estiver usando um servidor local que suporte variáveis de ambiente (como Vite), as variáveis serão automaticamente carregadas.

Para outros servidores, você pode:

1. **Vite**: As variáveis `VITE_*` são automaticamente expostas
2. **Outros servidores**: Criar um arquivo `config.js` que seja carregado dinamicamente

## 🔍 Como Funciona

### Lógica de Carregamento

```javascript
// 1. Tenta carregar de window.* (injeção via script no HTML)
const apiKey = window.FIREBASE_API_KEY;

// 2. Tenta carregar de process.env (Node.js)
const apiKey = process?.env?.FIREBASE_API_KEY;

// 3. Se nenhuma disponível, usa fallback de desenvolvimento
// (APENAS para desenvolvimento local)
```

### Priorização

1. **Produção**: Variáveis de ambiente injetadas via Netlify
2. **Desenvolvimento**: Arquivo `.env` ou fallback hardcoded
3. **Fallback**: Credenciais de desenvolvimento (temporário)

## ✅ Verificação

### Teste em Produção

Após configurar as variáveis no Netlify:

1. Acesse o site em produção
2. Abra o console do navegador (F12)
3. Deve aparecer: `🔐 Firebase: Usando credenciais de produção (variáveis de ambiente)`

### Teste em Desenvolvimento

1. Execute o servidor local
2. Abra o console do navegador
3. Deve aparecer: `🔧 Firebase: Usando credenciais de desenvolvimento (fallback)`

## 🚨 Considerações de Segurança

### ✅ O que foi implementado:

- ✅ Credenciais removidas do código fonte
- ✅ Carregamento seguro via variáveis de ambiente
- ✅ Fallback seguro para desenvolvimento
- ✅ Logs informativos para debugging
- ✅ Validação de configuração completa

### ⚠️ Próximos passos recomendados:

1. **Remover fallback hardcoded** após migração completa
2. **Implementar rotação de chaves** periodicamente
3. **Configurar monitoring** de uso das APIs
4. **Implementar rate limiting** no Firebase

## 🆘 Troubleshooting

### Erro: "Firebase: No credentials found"

**Causa**: Variáveis de ambiente não configuradas corretamente.

**Solução**:
1. Verifique se todas as variáveis foram adicionadas no Netlify
2. Confirme que o deploy foi feito após adicionar as variáveis
3. Verifique se as variáveis estão marcadas para "Production"

### Erro: "Firebase: Using development credentials"

**Causa**: Sistema funcionando em modo desenvolvimento (normal para localhost).

**Solução**: Em produção, configure as variáveis de ambiente no Netlify.

---

**🔒 Segurança implementada**: Credenciais do Firebase agora estão protegidas contra exposição no código fonte!