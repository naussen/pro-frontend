# Regras de Segurança do Firestore para Pagamentos

Para que o sistema de pagamento funcione corretamente, você precisa configurar as regras de segurança do Firestore.

## 📋 Configuração Necessária

### 1. Acesse o Firebase Console

1. Vá para https://console.firebase.google.com
2. Selecione o projeto `nvp-concursos`
3. Vá em "Firestore Database" > "Rules"

### 2. Atualize as Regras

Cole o seguinte código nas regras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function para verificar autenticação
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function para verificar se é o próprio usuário
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Coleção de usuários
    match /users/{userId} {
      // Leitura: usuário autenticado pode ler seu próprio documento
      allow read: if isOwner(userId);
      
      // Criação: apenas durante registro (com autenticação)
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Atualização: apenas o próprio usuário ou sistema (via Admin SDK)
      allow update: if isOwner(userId) || request.auth == null;
      
      // Permissões para campos específicos
      match /subscriptions/{subscriptionId} {
        allow read: if isOwner(userId);
        allow write: if isOwner(userId) || request.auth == null;
      }
    }
    
    // Coleção de pagamentos (logs/histórico)
    match /payments/{paymentId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Apenas criação
    }
    
    // Coleção de assinaturas
    match /subscriptions/{subscriptionId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      allow delete: if false; // Assinaturas não devem ser deletadas
    }
  }
}
```

### 3. Publicar Regras

Clique em "Publish" para aplicar as alterações.

## 🔐 Considerações de Segurança

### Autenticação Obrigatória

Todas as operações relacionadas a usuários exigem autenticação:
- Usuário deve estar logado
- Apenas o próprio usuário pode acessar seus dados

### Campos Sensíveis

Os seguintes campos são protegidos:
- `payment_id`: ID do pagamento do Mercado Pago
- `subscription_amount`: Valor da assinatura
- `last_payment_date`: Data do último pagamento

### Atualização de Assinatura

A atualização de `is_subscriber` pode ser feita:
- Pelo próprio usuário após retorno do pagamento
- Pelo sistema via Admin SDK (webhooks)

## 🧪 Teste das Regras

### Teste de Leitura

```javascript
// Deve funcionar: usuário lendo seu próprio documento
firebase.firestore()
  .collection('users')
  .doc(user.uid)
  .get();

// Deve falhar: usuário tentando ler documento de outro
firebase.firestore()
  .collection('users')
  .doc('outro-usuario-id')
  .get();
```

### Teste de Atualização

```javascript
// Deve funcionar: usuário atualizando sua própria assinatura
firebase.firestore()
  .collection('users')
  .doc(user.uid)
  .update({
    is_subscriber: true
  });

// Deve falhar: usuário tentando atualizar documento de outro
firebase.firestore()
  .collection('users')
  .doc('outro-usuario-id')
  .update({
    is_subscriber: true
  });
```

## 🚨 Modo de Desenvolvimento (Desabilitar Segurança)

⚠️ **NUNCA use em produção!**

Para desenvolvimento/teste local:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📝 Estrutura de Dados

### Documento de Usuário

```javascript
{
  email: "usuario@example.com",
  role: "user",
  hasPersonalized: true,
  createdAt: timestamp,
  
  // Dados de assinatura
  is_subscriber: true,
  subscription_start: timestamp,
  subscription_plan: "monthly",
  subscription_amount: 29.90,
  payment_id: "1234567890",
  last_payment_date: timestamp
}
```

### Documento de Pagamento (histórico)

```javascript
{
  user_id: "user-id",
  email: "usuario@example.com",
  amount: 29.90,
  status: "approved",
  payment_id: "1234567890",
  created_at: timestamp,
  processed_at: timestamp
}
```

## 🔄 Sincronização com Webhooks

Se você implementar webhooks do Mercado Pago usando Firebase Admin SDK:

```javascript
const admin = require('firebase-admin');
admin.initializeApp();

// Atualizar assinatura após pagamento aprovado
await admin.firestore()
  .collection('users')
  .doc(userId)
  .update({
    is_subscriber: true,
    subscription_start: admin.firestore.FieldValue.serverTimestamp()
  });
```

Isso funcionará porque `request.auth == null` em operações do Admin SDK.

## 📚 Recursos Adicionais

- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Writing Conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
- [Testing Rules](https://firebase.google.com/docs/rules/unit-tests)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do Firebase Console
3. Use o Firebase Rules Simulator para testar regras
4. Consulte a documentação oficial

