# 💳 Setup Rápido - Pagamento Mercado Pago

## ⚡ Início Rápido (5 minutos)

### 1️⃣ Configurar Credenciais no Netlify

1. Acesse: https://app.netlify.com
2. Selecione seu site
3. Vá em **Site settings** → **Environment variables**
4. Clique em **Add a variable**
5. Adicione:
   - **Key:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Value:** Seu Access Token do Mercado Pago
   - **Scopes:** Marque todos (Production, Deploy Previews, Branch Deploys)
6. Clique em **Save**

### 2️⃣ Obter Access Token do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta
3. Vá em **Suas integrações**
4. Clique em **Credenciais**
5. Copie o **Access Token**

### 3️⃣ Fazer Deploy

```bash
git add .
git commit -m "Integração Mercado Pago completa"
git push origin main
```

### 4️⃣ Configurar Webhook (Opcional)

1. No dashboard do Mercado Pago, vá em **Webhooks**
2. Adicione URL: `https://seu-site.netlify.app/.netlify/functions/mercadopago-webhook`
3. Eventos: `payment`

### 5️⃣ Testar

Use cartão de teste:
- **Número:** 5031 7557 3453 0604
- **CVV:** 123
- **Vencimento:** 11/25
- **CPF:** Qualquer válido
- **Email:** Qualquer válido

## ✅ Verificação de Funcionamento

Após o deploy, acesse: `https://seu-site.netlify.app/pagamento.html`

### O que deve funcionar:

1. ✅ Botão "Pagar com Mercado Pago" aparece
2. ✅ Ao clicar, redireciona para checkout
3. ✅ Após pagamento (teste), volta e mostra sucesso
4. ✅ Assinatura é ativada no Firestore

### Se algo der errado:

1. Verifique logs do Netlify: **Site settings** → **Functions** → Ver logs
2. Verifique variável de ambiente foi configurada
3. Verifique se fez re-deploy após adicionar variável
4. Verifique console do navegador (F12)

## 📁 Arquivos Criados

```
pro-frontend/
├── netlify/
│   └── functions/
│       ├── create-mercadopago-preference.js    # Cria preferência
│       └── mercadopago-webhook.js              # Recebe notificações
├── MERCADOPAGO_SETUP.md                        # Guia completo
├── FIRESTORE_SECURITY_RULES.md                 # Regras de segurança
├── CHANGELOG_MERCADOPAGO.md                    # Resumo de mudanças
├── package.json                                 # Config Node.js
└── pagamento.html                               # Página de pagamento (modificada)
```

## 🔗 Links Úteis

- **Dashboard Mercado Pago:** https://www.mercadopago.com.br/developers
- **Cartões de Teste:** https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards
- **Documentação API:** https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post
- **Netlify Dashboard:** https://app.netlify.com

## 🆘 Ajuda

**Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"**
- ✅ Adicione variável de ambiente no Netlify
- ✅ Faça re-deploy
- ✅ Verifique se o nome da variável está exatamente assim

**Erro: "Erro ao criar preferência"**
- ✅ Verifique Access Token está correto
- ✅ Verifique logs do Netlify Functions
- ✅ Teste endpoint manualmente

**Webhook não funciona**
- ✅ Verifique URL está correta
- ✅ Verifique se webhook está habilitado
- ✅ Verifique logs da função

## 📞 Próximos Passos

Após tudo funcionando:

1. ✉️ Configurar emails de confirmação
2. 🔄 Implementar renovação automática
3. 📊 Adicionar dashboard de pagamentos
4. 🔔 Notificações de status
5. 💰 Múltiplos planos/preços

---

**Pronto para começar?** Siga o passo a passo acima! 🚀

