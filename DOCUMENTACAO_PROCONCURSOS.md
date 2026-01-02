# PRO Concursos - Documentação Técnica

## Visão Geral

**PRO Concursos** é uma plataforma completa de estudos online especializada em concursos públicos, desenvolvida como uma Progressive Web App (PWA) responsiva.

## Arquitetura

### Frontend
- **Tecnologias**: HTML5, CSS3 (Inter Font), JavaScript ES6+
- **Framework**: Vanilla JavaScript com classes modulares
- **PWA**: Manifest.json, Service Worker (desabilitado para evitar conflitos CORS)
- **Hospedagem**: Netlify
- **Build**: Vite

### Backend
- **Tecnologias**: Node.js + Express.js
- **Banco de dados**: MongoDB + Firebase Firestore
- **Autenticação**: Firebase Auth
- **Pagamentos**: MercadoPago + PayPal
- **Hospedagem**: Heroku
- **Segurança**: Helmet, Rate Limiting, CORS

## Funcionalidades Principais

### 1. Sistema de Cadastro e Login
- **Cadastro**: Formulário com validação (email, senha, confirmação)
- **Login**: Autenticação via Firebase Auth
- **Redirecionamento**: Após login, usuários são direcionados para personalização ou sala de estudos
- **Rate Limiting**: Proteção contra tentativas excessivas (5/min login, 3/h cadastro)

### 2. Plataforma de Estudos
- **Sala de Estudos**: Interface personalizável com sidebar de navegação
- **Cursos Organizados**: Filtros por categoria (Policial, Tribunais, Fiscal, Básicos)
- **Materiais**: Cursos de Direito Constitucional, Administrativo, Penal, Tributário, etc.
- **Conteúdo Dinâmico**: Carregamento de cursos via JavaScript

### 3. Sistema de Pagamentos
- **MercadoPago**: Integração completa com webhooks
- **PayPal**: Suporte para assinaturas recorrentes
- **Planos**: Mensal (R$ 49,90) e Anual (R$ 299,00)
- **Webhooks**: Atualização automática do status de assinatura no Firestore

### 4. Área Administrativa
- **Acesso Restrito**: Login especial para administradores
- **Dashboard**: Gerenciamento de usuários e pagamentos
- **Relatórios**: Logs de auditoria e monitoramento

### 5. Personalização de Estudos
- **Configurações**: Horários, dias de estudo, objetivos de concurso
- **Sala Personalizável**: Cores, layout, música, técnica Pomodoro
- **Perfil**: Dados pessoais (CPF, endereço, telefone)

### 6. Progressive Web App (PWA)
- **Instalável**: Manifest configurado para instalação
- **Offline**: Service Worker preparado (atualmente desabilitado)
- **Responsivo**: Design mobile-first com breakpoints
- **Tema**: Suporte a modo escuro/claro

## Estrutura de Dados

### Usuario (MongoDB)
```javascript
{
  userId: String (Firebase UID),
  nome: String,
  apelido: String,
  cpf: String,
  emailPrincipal: String,
  emailSecundario: String,
  endereco: String,
  telefone: String,
  diasEstudo: [String],
  horasEstudo: Number,
  concurso: String
}
```

### Sala (MongoDB)
```javascript
{
  userId: String (Firebase UID),
  color: String,
  layout: String,
  music: String,
  pomodoro: Number,
  createdAt: Date
}
```

### Users (Firestore)
```javascript
{
  role: 'user' | 'admin',
  is_subscriber: Boolean,
  hasPersonalized: Boolean,
  email: String,
  name: String,
  subscription_start: Date,
  payment_method: String,
  [payment_provider]_id: String
}
```

## Endpoints da API

### Usuário
- `POST /api/usuario/cadastro` - Cadastro de usuário
- `POST /api/usuario/login` - Login de usuário
- `GET /api/usuario/:id` - Obter dados do usuário
- `PUT /api/usuario/:id` - Atualizar usuário

### Pagamentos
- `POST /api/pagamentos/create-mercadopago-preference` - Criar preferência MercadoPago
- `POST /api/pagamentos/approve-paypal-subscription` - Aprovar assinatura PayPal
- `POST /api/pagamentos/mercadopago-webhook` - Webhook MercadoPago

### Sala
- `POST /api/sala` - Criar configuração da sala
- `GET /api/sala/:userId` - Obter configuração da sala
- `PUT /api/sala/:userId` - Atualizar configuração da sala

## Funcionalidades Técnicas

### Segurança
- **Rate Limiting**: Proteção contra ataques de força bruta
- **Helmet**: Headers de segurança HTTP
- **CORS**: Controle de origens permitidas
- **Logs de Auditoria**: Rastreamento de todas as requisições

### Performance
- **Lazy Loading**: Carregamento sob demanda de imagens e conteúdo
- **Code Splitting**: Scripts modulares
- **Caching**: Headers apropriados para recursos estáticos
- **CDN**: Recursos do Firebase hospedados em CDN

### UX/UI
- **Acessibilidade**: Skip links, ARIA labels, navegação por teclado
- **Responsividade**: Mobile-first com breakpoints progressivos
- **Animações**: Transições suaves, skeleton loading
- **Feedback Visual**: Estados de loading, mensagens de erro

## Fluxo de Usuário

1. **Acesso Inicial**: Landing page com apresentação da plataforma
2. **Cadastro**: Formulário de registro → Verificação de email
3. **Personalização**: Configuração de perfil e objetivos de estudo
4. **Pagamento**: Escolha do plano → Processamento via MercadoPago/PayPal
5. **Sala de Estudos**: Acesso aos cursos e materiais de estudo
6. **Estudos**: Navegação por cursos, filtros por categoria

## Implantação

### Frontend (Netlify)
```bash
npm run build
npm run deploy
```

### Backend (Heroku)
```bash
git push heroku main
```

### Variáveis de Ambiente
- `MONGODB_URI`: String de conexão MongoDB
- `FIREBASE_SERVICE_ACCOUNT`: Chave privada Firebase (JSON)
- `MERCADO_PAGO_ACCESS_TOKEN`: Token MercadoPago
- `PAYPAL_CLIENT_ID/SECRET`: Credenciais PayPal
- `FRONTEND_URL/BACKEND_URL`: URLs dos serviços

## Monitoramento

- **Logs**: Console logging estruturado
- **Auditoria**: Logs de segurança e acesso
- **Firebase**: Monitoramento de autenticação e database
- **Netlify**: Analytics e performance do frontend
