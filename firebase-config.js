// firebase-config.js

// ALERTA DE SEGURANÇA: As chaves abaixo foram expostas publicamente.
// É altamente recomendável que você gere NOVAS chaves no seu painel do Firebase
// e substitua os valores abaixo antes de continuar.
// NUNCA compartilhe este arquivo publicamente ou o envie para o GitHub.

const firebaseConfig = {
  // POR FAVOR, SUBSTITUA ESTAS CHAVES PELAS NOVAS CHAVES GERADAS NO SEU PAINEL
  apiKey: "AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8",
  authDomain: "nvp-concursos.firebaseapp.com",
  projectId: "nvp-concursos",
  storageBucket: "nvp-concursos.firebasestorage.app",
  messagingSenderId: "397960760271",
  appId: "1:397960760271:web:1243b04141178453d860ba"
};

// Inicializa o Firebase e torna os serviços disponíveis globalmente
// Isso é aceitável para um projeto simples de HTML/JS sem módulos.
try {
  if (firebase) {
    const app = firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    console.log("Firebase inicializado com sucesso a partir de firebase-config.js.");
  } else {
    console.error("SDK do Firebase não foi carregado antes de firebase-config.js.");
    alert("Erro crítico: SDK do Firebase não encontrado.");
  }
} catch (e) {
  console.error("Erro ao inicializar o Firebase:", e);
  alert("Não foi possível inicializar a conexão com o banco de dados.");
}