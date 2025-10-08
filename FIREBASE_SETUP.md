# Configuração do Firebase para PRO Concursos

## Problema Identificado

O erro "Unable to verify that the app domain is authorized" (403) ocorre porque existem duas configurações de Web App no Firebase Console, cada uma com uma API key diferente, e o domínio atual não está autorizado para a API key correta.

## API Keys Disponíveis

- **Firebase App**: `AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8` (domínio: nvp-concursos.firebaseapp.com)
- **PRO Concursos**: `AIzaSyArCRHV8jnauuETj7n_1N_IfaNV5OUQpQw` (domínio: proconcursos.com.br)

O código agora detecta automaticamente qual configuração usar baseada no domínio acessado.

## Soluções Implementadas

### 1. Configuração de Ambiente Automática
- Criado arquivo `firebase-config.js` com configurações separadas para desenvolvimento e produção
- Desenvolvimento usa `localhost` como authDomain
- Produção usa `nvp-concursos.firebaseapp.com`

### 2. Melhor Tratamento de Erros
- Adicionado tratamento específico para erros comuns do Google Auth
- Mensagens de erro mais claras para o usuário

## Configuração Necessária no Firebase Console

### Passo 1: Acessar Firebase Console
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto "nvp-concursos"

### Passo 2: Configurar Ambas as Web Apps
1. No menu lateral, clique em "Project settings" (ícone de engrenagem)
2. Vá para a aba "General" → "Your apps"
3. Você deve ver duas Web Apps configuradas:
   - **Firebase App** (API key: `AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8`)
   - **PRO Concursos** (API key: `AIzaSyArCRHV8jnauuETj7n_1N_IfaNV5OUQpQw`)

### Passo 3: Configurar Domínios Autorizados para Cada App

**IMPORTANTE:** Você deve fazer isso para **AMBAS as Web Apps** separadamente!

#### Para a Web App "PRO Concursos" (API key: `AIzaSyArCRHV8jnauuETj7n_1N_IfaNV5OUQpQw`):
1. Clique na Web App chamada "PRO Concursos"
2. Role para baixo até encontrar "Authorized domains"
3. Clique em "Add domain"
4. Adicione: `proconcursos.com.br`
5. Clique em "Add"
6. **VERIFIQUE:** O domínio `proconcursos.com.br` deve aparecer na lista

#### Para a Web App "Firebase App" (API key: `AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8`):
1. Clique na Web App chamada "Firebase App"
2. Role para baixo até encontrar "Authorized domains"
3. Adicione: `nvp-concursos.firebaseapp.com`
4. Clique em "Add"

### Passo 4: Configurar Authentication
1. No menu lateral, clique em "Authentication"
2. Vá para a aba "Sign-in method"
3. Certifique-se de que "Google" está habilitado

### Passo 3: Configurar Google Cloud Console (se necessário)
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione o projeto "nvp-concursos"
3. Vá para "APIs & Services" > "Credentials"
4. Encontre o OAuth 2.0 Client ID usado pelo Firebase
5. Em "Authorized JavaScript origins", adicione:
   - `http://localhost:8000` (para desenvolvimento)
   - Seu domínio de produção
6. Em "Authorized redirect URIs", adicione:
   - `http://localhost:8000/__/auth/handler` (desenvolvimento)
   - `https://nvp-concursos.firebaseapp.com/__/auth/handler` (produção)

## Como Usar

### Desenvolvimento Local
1. Execute `start_dev_server.bat`
2. Acesse `http://localhost:8000/cadastro.html`
3. **IMPORTANTE:** Em desenvolvimento local, todos os botões estarão desabilitados
4. Os campos de input mostrarão "Disponível apenas em produção"
5. Isso é intencional para evitar testes locais desnecessários

### Produção
- O sistema detecta automaticamente quando está em produção
- Funciona apenas em domínios autorizados (Firebase Hosting, Netlify, etc.)
- Certifique-se de que o domínio de produção está autorizado no Firebase Console

## Testando a Autenticação

### Em Desenvolvimento Local
1. Abra o console do navegador (F12)
2. Vá para a página de cadastro
3. Verifique os logs no console:
   - Deve mostrar "Modo desenvolvimento - funcionalidades desabilitadas"
   - Botões estarão desabilitados

### Em Produção
1. Abra o console do navegador (F12)
2. Vá para a página de cadastro
3. Clique em "Cadastrar com Gmail"
4. Verifique os logs no console:
   - Deve mostrar "Firebase inicializado com sucesso"
   - Ambiente: Produção
   - **Para proconcursos.com.br**: "Usando configuração PRO Concursos"
   - **Para firebaseapp.com**: "Usando configuração principal"
   - Auth Domain correto para o domínio acessado

## Possíveis Problemas e Soluções

### Erro: "handler" retornando 404
- **Causa**: Domínio não autorizado para a API key correta no Firebase Console
- **Solução**:
  1. Verifique se você adicionou `proconcursos.com.br` à Web App "PRO Concursos"
  2. Certifique-se de que está usando a API key `AIzaSyArCRHV8jnauuETj7n_1N_IfaNV5OUQpQw`
  3. Aguarde alguns minutos para que as mudanças sejam propagadas

### Erro: "auth/unauthorized-domain"
- **Causa**: Domínio não autorizado no Firebase
- **Solução**: Adicione o domínio na seção "Authorized domains" do Firebase Console

### Erro: "auth/popup-blocked"
- **Causa**: Browser bloqueando popups
- **Solução**: Permita popups para o site

### Erro: "auth/operation-not-allowed"
- **Causa**: Google Auth não habilitado no Firebase
- **Solução**: Habilite Google como provedor de autenticação no Firebase Console

## Logs de Debug

O código agora inclui logs detalhados no console:
- Status da inicialização do Firebase
- Ambiente detectado
- Auth Domain sendo usado
- Erros específicos durante autenticação

Monitore estes logs para diagnosticar problemas.

## Verificação da Configuração

### Método Rápido: Arquivo de Teste

1. **Execute o teste automático**: Abra `test_firebase_config.html` no seu navegador
2. **Verifique os resultados**: Todos os testes devem mostrar ✅ (verde)
3. **Se houver erros**: Siga as instruções específicas para cada erro

### Método Manual: Verificação Passo a Passo

1. **Acesse**: `https://proconcursos.com.br/cadastro`
2. **Abra o Console** (F12 → Console)
3. **Verifique os logs iniciais**:
   ```
   Usando configuração PRO Concursos (proconcursos.com.br)
   Firebase Config - Ambiente: Produção
   Auth Domain: proconcursos.com.br
   Firebase inicializado com sucesso
   ```
4. **Clique em "Cadastrar com Gmail"**
5. **Se funcionar**: O popup do Google deve abrir sem erros 403/404
6. **Se ainda houver erro**: Verifique novamente os domínios autorizados no Firebase Console

### Checklist de Verificação:

- [ ] Domínio `proconcursos.com.br` adicionado à Web App "PRO Concursos"
- [ ] Firebase Console mostra o domínio na lista "Authorized domains"
- [ ] Console do navegador mostra "Usando configuração PRO Concursos"
- [ ] Não há erros de rede (403/404) quando clica nos botões de autenticação
