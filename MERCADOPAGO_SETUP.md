# Configuração do Mercado Pago - NVP Concursos

Este documento descreve como configurar o pagamento com Mercado Pago na plataforma NVP Concursos.

## 📋 Pré-requisitos

- Conta no Mercado Pago (https://www.mercadopago.com.br)
- Ambiente de homologação/teste configurado
- Site publicado no Netlify

## 🔧 Configuração no Mercado Pago

### 1. Obter Credenciais

1. Acesse o dashboard do Mercado Pago: https://www.mercadopago.com.br/developers
2. Acesse suas credenciais na seção "Suas integrações"
3. Copie:
   - **Access Token** (Bearer Token)
   - **Public Key** (opcional, para o frontend)

### 2. Configurar Webhooks

1. No dashboard do Mercado Pago, acesse "Webhooks"
2. Adicione uma nova URL de webhook:
   ```
   https://seu-dominio.netlify.app/.netlify/functions/mercadopago-webhook
   ```
3. Selecione os eventos:
   - `payment`
   - `subscription` (se aplicável)

## 🚀 Configuração no Netlify

### 1. Configurar Variáveis de Ambiente

1. Acesse o dashboard do Netlify
2. Vá em "Site settings" > "Environment variables"
3. Adicione:
   - **Chave:** `MERCADOPAGO_ACCESS_TOKEN`
   - **Valor:** Seu Access Token do Mercado Pago
   - **Scopes:** Todos os ambientes (Production, Deploy Previews, Branch Deploys)

### 2. Re-deploy

Após adicionar as variáveis de ambiente, faça um novo deploy do site.

## 🧪 Teste em Modo Sandbox

O Mercado Pago oferece um ambiente de teste/sandbox. Para testar:

### Cartões de Teste

**Cartão Aprovado:**
- Número: 5031 7557 3453 0604
- CVV: 123
- Vencimento: 11/25
- Nome: APRO

**Cartão Recusado:**
- Número: 5031 4332 1540 6351
- CVV: 123
- Vencimento: 11/25

### Outros Dados de Teste

**Pendente:**
- Número: 5131 7557 3453 0604

**Rejeitado:**
- Número: 5031 4332 1540 6351

Use qualquer CPF válido e email de teste.

## 📝 Verificação de Funcionamento

### 1. Criar Preferência

Quando o usuário clicar em "Pagar com Mercado Pago":
- Será feita uma requisição POST para `/.netlify/functions/create-mercadopago-preference`
- A função criará uma preferência de pagamento no Mercado Pago
- O usuário será redirecionado para o checkout do Mercado Pago

### 2. Processar Pagamento

Após o pagamento:
- Mercado Pago redireciona de volta para `pagamento.html?status=success/failure/pending`
- O código verifica o status e ativa a assinatura no Firestore
- Webhook recebe notificação no servidor (backup)

### 3. Ativar Assinatura

No Firestore, será atualizado o documento do usuário:
```javascript
{
  is_subscriber: true,
  subscription_start: timestamp,
  subscription_plan: 'monthly',
  subscription_amount: 29.90,
  payment_id: 'payment_id_do_mercado_pago',
  last_payment_date: timestamp
}
```

## 🔍 Troubleshooting

### Erro: "MERCADOPAGO_ACCESS_TOKEN não configurado"

- Verifique se a variável de ambiente foi adicionada no Netlify
- Verifique se o site foi re-deployado após adicionar a variável

### Erro: "Erro ao criar preferência de pagamento"

- Verifique os logs da função no Netlify Dashboard
- Confirme que o Access Token está correto
- Verifique se está usando credenciais de produção ou sandbox apropriadas

### Webhook não funcionando

- Verifique se a URL do webhook está correta
- Verifique os logs da função webhook no Netlify
- Confirme que o webhook está habilitado no dashboard do Mercado Pago

### Assinatura não está sendo ativada

- Verifique os logs do navegador (Console)
- Confirme que o Firestore tem permissões adequadas
- Verifique se o usuário está autenticado

## 📚 Links Úteis

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs)
- [API de Preferências](https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
- [Cartões de Teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/test-cards)

## 🔒 Segurança

- **NUNCA** exponha o Access Token no frontend
- Use apenas variáveis de ambiente no Netlify
- Configure CORS adequadamente
- Valide todos os dados recebidos nos webhooks
- Use HTTPS em produção

## 🎯 Próximos Passos

1. Implementar sistema de renovação automática
2. Adicionar notificações por email
3. Criar dashboard de pagamentos
4. Implementar sistema de faturas
5. Adicionar método de assinatura recorrente

