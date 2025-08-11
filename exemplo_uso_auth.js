// Exemplo de como usar o estado de autenticação em outras páginas
// Copie este código para suas outras páginas HTML

// Estado global da aplicação (deve ser o mesmo em todas as páginas)
const AppState = {
  user: null,
  isAuthenticated: false,
  authListener: null
};

// Função para verificar se o usuário está autenticado
function checkAuthStatus() {
  return new Promise((resolve) => {
    if (AppState.authListener) {
      // Listener já configurado, retornar estado atual
      resolve(AppState.isAuthenticated);
    } else {
      // Configurar listener e aguardar primeiro resultado
      AppState.authListener = auth.onAuthStateChanged((user) => {
        if (user) {
          AppState.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL
          };
          AppState.isAuthenticated = true;
        } else {
          AppState.user = null;
          AppState.isAuthenticated = false;
        }
        resolve(AppState.isAuthenticated);
      });
    }
  });
}

// Função para proteger páginas (redirecionar se não autenticado)
async function requireAuth() {
  const isAuthenticated = await checkAuthStatus();
  if (!isAuthenticated) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'cadastro.html';
    return false;
  }
  return true;
}

// Função para verificar se o usuário tem assinatura premium
async function checkPremiumStatus() {
  if (!AppState.isAuthenticated) return false;
  
  try {
    const userDoc = await db.collection('users').doc(AppState.user.uid).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.is_subscriber === true;
    }
    return false;
  } catch (error) {
    console.error('Erro ao verificar status premium:', error);
    return false;
  }
}

// Função para obter dados do usuário
async function getUserData() {
  if (!AppState.isAuthenticated) return null;
  
  try {
    const userDoc = await db.collection('users').doc(AppState.user.uid).get();
    if (userDoc.exists) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    return null;
  }
}

// Função para atualizar dados do usuário
async function updateUserData(data) {
  if (!AppState.isAuthenticated) return false;
  
  try {
    await db.collection('users').doc(AppState.user.uid).update({
      ...data,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    return false;
  }
}

// Exemplo de uso em uma página de conteúdo premium
async function initPremiumPage() {
  // Verificar se o usuário está autenticado
  const isAuthenticated = await requireAuth();
  if (!isAuthenticated) return;
  
  // Verificar se tem assinatura premium
  const isPremium = await checkPremiumStatus();
  if (!isPremium) {
    alert('Você precisa de uma assinatura premium para acessar este conteúdo.');
    window.location.href = 'pagamento.html';
    return;
  }
  
  // Carregar conteúdo premium
  loadPremiumContent();
}

// Exemplo de uso em uma página de perfil
async function initProfilePage() {
  // Verificar se o usuário está autenticado
  const isAuthenticated = await requireAuth();
  if (!isAuthenticated) return;
  
  // Obter dados do usuário
  const userData = await getUserData();
  if (userData) {
    // Preencher formulário de perfil
    document.getElementById('nome').value = userData.nome || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('concurso_atual').value = userData.concurso_atual || '';
    // ... outros campos
  }
}

// Exemplo de uso em uma página de configurações
async function saveUserSettings() {
  const isAuthenticated = await checkAuthStatus();
  if (!isAuthenticated) {
    alert('Você precisa estar logado para salvar configurações.');
    return;
  }
  
  const settings = {
    tema_preferido: document.getElementById('tema').value,
    notificacoes: document.getElementById('notificacoes').checked,
    // ... outras configurações
  };
  
  const success = await updateUserData(settings);
  if (success) {
    alert('Configurações salvas com sucesso!');
  } else {
    alert('Erro ao salvar configurações.');
  }
}

// Exemplo de uso em uma página de progresso
async function loadUserProgress() {
  const isAuthenticated = await checkAuthStatus();
  if (!isAuthenticated) {
    // Mostrar conteúdo público ou redirecionar
    showPublicContent();
    return;
  }
  
  // Carregar progresso personalizado do usuário
  try {
    const progressDoc = await db.collection('users')
      .doc(AppState.user.uid)
      .collection('progress')
      .doc('current')
      .get();
    
    if (progressDoc.exists) {
      const progress = progressDoc.data();
      displayUserProgress(progress);
    } else {
      // Criar progresso inicial
      const initialProgress = {
        aulas_completadas: 0,
        questoes_respondidas: 0,
        tempo_estudo: 0,
        ultima_atividade: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users')
        .doc(AppState.user.uid)
        .collection('progress')
        .doc('current')
        .set(initialProgress);
      
      displayUserProgress(initialProgress);
    }
  } catch (error) {
    console.error('Erro ao carregar progresso:', error);
  }
}

// Exemplo de uso em uma página de questões
async function saveQuestionAnswer(questionId, answer, isCorrect) {
  const isAuthenticated = await checkAuthStatus();
  if (!isAuthenticated) {
    // Salvar apenas localmente ou mostrar mensagem
    console.log('Resposta salva localmente (usuário não autenticado)');
    return;
  }
  
  try {
    await db.collection('users')
      .doc(AppState.user.uid)
      .collection('answers')
      .doc(questionId)
      .set({
        answer: answer,
        isCorrect: isCorrect,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    
    // Atualizar estatísticas do usuário
    const userRef = db.collection('users').doc(AppState.user.uid);
    await userRef.update({
      total_questions: firebase.firestore.FieldValue.increment(1),
      correct_answers: firebase.firestore.FieldValue.increment(isCorrect ? 1 : 0)
    });
    
    console.log('Resposta salva no banco de dados');
  } catch (error) {
    console.error('Erro ao salvar resposta:', error);
  }
}

// Exemplo de uso em uma página de dashboard
async function initDashboard() {
  const isAuthenticated = await checkAuthStatus();
  
  if (isAuthenticated) {
    // Mostrar dashboard personalizado
    showPersonalizedDashboard();
    
    // Carregar dados do usuário
    const userData = await getUserData();
    if (userData) {
      displayUserStats(userData);
    }
  } else {
    // Mostrar dashboard público
    showPublicDashboard();
  }
}

// Funções auxiliares (implementar conforme necessário)
function loadPremiumContent() {
  console.log('Carregando conteúdo premium...');
  // Implementar carregamento de conteúdo premium
}

function displayUserProgress(progress) {
  console.log('Exibindo progresso do usuário:', progress);
  // Implementar exibição do progresso
}

function showPublicContent() {
  console.log('Exibindo conteúdo público...');
  // Implementar conteúdo público
}

function showPersonalizedDashboard() {
  console.log('Exibindo dashboard personalizado...');
  // Implementar dashboard personalizado
}

function showPublicDashboard() {
  console.log('Exibindo dashboard público...');
  // Implementar dashboard público
}

function displayUserStats(userData) {
  console.log('Exibindo estatísticas do usuário:', userData);
  // Implementar exibição de estatísticas
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
  // Exemplo: inicializar dashboard
  initDashboard();
  
  // Exemplo: inicializar página de progresso
  // loadUserProgress();
  
  // Exemplo: inicializar página premium
  // initPremiumPage();
  
  // Exemplo: inicializar página de perfil
  // initProfilePage();
});

// Exportar funções para uso global (se necessário)
window.AuthUtils = {
  checkAuthStatus,
  requireAuth,
  checkPremiumStatus,
  getUserData,
  updateUserData,
  saveQuestionAnswer
}; 