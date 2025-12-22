// Serverless function to handle Mercado Pago webhook notifications
exports.handler = async (event, context) => {
  // Processar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Responder a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Obter o Access Token do Mercado Pago
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    
    if (!ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Configuração de webhook não disponível' })
      };
    }

    // Parse do corpo da requisição
    const notificationData = JSON.parse(event.body);
    console.log('Webhook recebido:', JSON.stringify(notificationData, null, 2));

    // Verificar o tipo de notificação
    if (notificationData.type === 'payment') {
      const paymentId = notificationData.data?.id;
      
      if (!paymentId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'ID de pagamento não encontrado' })
        };
      }

      // Obter informações detalhadas do pagamento
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        console.error('Erro ao obter dados do pagamento:', paymentData);
        return {
          statusCode: paymentResponse.status,
          headers,
          body: JSON.stringify({ error: 'Erro ao obter dados do pagamento' })
        };
      }

      // Processar o pagamento
      const { status, status_detail, external_reference, transaction_amount, payer } = paymentData;
      
      console.log('Status do pagamento:', status);
      console.log('External reference (user ID):', external_reference);
      console.log('Email do pagador:', payer?.email);

      // Verificação de segurança: em produção, você deve validar o status e o valor
      
      // Atualizar o status da assinatura no Firestore
      if (external_reference && (status === 'approved' || status === 'authorized')) {
        console.log('Pagamento aprovado. User ID:', external_reference);
        console.log('Valor pago:', transaction_amount);
        
        /* 
        NOTA: Para atualizar o Firestore aqui, você deve:
        1. Instalar firebase-admin: npm install firebase-admin
        2. Configurar as credenciais do Firebase (Service Account)
        
        Exemplo de implementação:
        
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
          });
        }
        const db = admin.firestore();
        
        await db.collection('users').doc(external_reference).update({
          is_subscriber: true,
          subscription_start: admin.firestore.FieldValue.serverTimestamp(),
          subscription_plan: 'monthly',
          subscription_amount: transaction_amount,
          last_payment_date: admin.firestore.FieldValue.serverTimestamp(),
          payment_id: paymentId
        });
        */
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Webhook processado com sucesso',
            status: 'approved',
            user_id: external_reference
          })
        };
      } else if (status === 'rejected') {
        console.log('Pagamento rejeitado:', status_detail);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Webhook processado',
            status: 'rejected',
            reason: status_detail
          })
        };
      } else {
        console.log('Pagamento pendente:', status);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            message: 'Webhook processado',
            status: 'pending'
          })
        };
      }
    } else if (notificationData.type === 'subscription') {
      // Processar notificações de assinatura recorrente
      console.log('Notificação de assinatura:', notificationData.data);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Webhook de assinatura processado' })
      };
    } else {
      console.log('Tipo de notificação desconhecido:', notificationData.type);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Webhook recebido mas não processado' })
      };
    }

  } catch (error) {
    console.error('Erro ao processar webhook do Mercado Pago:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};

