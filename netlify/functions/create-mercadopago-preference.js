// Serverless function to create Mercado Pago payment preference
exports.handler = async (event, context) => {
  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

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

  try {
    // Obter o Access Token do Mercado Pago
    // IMPORTANTE: Configure isto como variável de ambiente no Netlify
    const ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    
    if (!ACCESS_TOKEN) {
      console.error('MERCADOPAGO_ACCESS_TOKEN não configurado');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Configuração de pagamento não disponível',
          message: 'O Access Token do Mercado Pago não foi configurado'
        })
      };
    }

    // Parse do corpo da requisição
    const requestData = JSON.parse(event.body);
    const { email, plan_type = 'monthly' } = requestData;

    // Definir o valor com base no plano (evita que o usuário altere o preço no frontend)
    let amount = 29.90; // Valor padrão para plano mensal
    if (plan_type === 'yearly') {
      amount = 299.00;
    }
    // Adicione outros planos se necessário

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email é obrigatório' })
      };
    }

    // Configurar a preferência de pagamento
    const preference = {
      items: [
        {
          title: 'Assinatura Mensal NVP Concursos',
          description: 'Plano mensal de assinatura para acesso completo à plataforma',
          quantity: 1,
          unit_price: parseFloat(amount)
        }
      ],
      payer: {
        email: email
      },
      back_urls: {
        success: requestData.success_url || `${event.headers.origin || ''}/pagamento.html?status=success`,
        failure: requestData.failure_url || `${event.headers.origin || ''}/pagamento.html?status=failure`,
        pending: requestData.pending_url || `${event.headers.origin || ''}/pagamento.html?status=pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_types: [],
        installments: 1
      },
      statement_descriptor: 'NVP CONCURSOS',
      external_reference: requestData.external_reference || '',
      metadata: {
        user_email: email,
        plan_type: plan_type,
        platform: 'nvp-concursos'
      }
    };

    // Criar preferência no Mercado Pago
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preference)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao criar preferência no Mercado Pago:', data);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: 'Erro ao criar preferência de pagamento',
          details: data.message || 'Erro desconhecido'
        })
      };
    }

    // Retornar a URL de pagamento
    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preference_id: data.id,
        init_point: data.init_point,
        sandbox_init_point: data.sandbox_init_point
      })
    };

  } catch (error) {
    console.error('Erro na função create-mercadopago-preference:', error);
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

