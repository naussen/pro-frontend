// ===================================================================
// CONFIGURAÇÃO FIREBASE - ÚNICA FONTE DE VERDADE PARA O PROJETO
// ===================================================================
// IMPORTANTE: 
// - authDomain DEVE ser sempre "nvp-concursos.firebaseapp.com"
// - Funciona em qualquer domínio (localhost, Netlify, Firebase Hosting, etc)
// - O Firebase gerencia automaticamente o redirecionamento após autenticação
// ===================================================================
const firebaseConfig = {
  apiKey: "AIzaSyArCRHV8jnauuETj7n_1N_IfaNV5OUQpQw",
  authDomain: "nvp-concursos.firebaseapp.com",
  projectId: "nvp-concursos",
  storageBucket: "nvp-concursos.firebasestorage.app",
  messagingSenderId: "397960760271",
  appId: "1:397960760271:web:1243b04141178453d860ba",
  measurementId: "G-T6RVBM12BQ"
};

// Exportar para uso global
window.firebaseConfig = firebaseConfig;

// Log para debug (remover em produção se necessário)
console.log('🔧 Firebase Config carregado');
console.log('📍 Auth Domain:', firebaseConfig.authDomain);
console.log('🆔 Project ID:', firebaseConfig.projectId);
