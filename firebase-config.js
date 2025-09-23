// Configuração do Firebase para diferentes ambientes
const firebaseConfigs = {
  development: {
    apiKey: "AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8",
    authDomain: "localhost",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1243b04141178453d860ba",
    measurementId: "G-T6RVBM12BQ"
  },
  production: {
    apiKey: "AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8",
    authDomain: "nvp-concursos.firebaseapp.com",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1243b04141178453d860ba",
    measurementId: "G-T6RVBM12BQ"
  }
};

// Detectar ambiente
const isLocalhost = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';

// Usar configuração baseada no ambiente
const firebaseConfig = isLocalhost ? firebaseConfigs.development : firebaseConfigs.production;

console.log('Firebase Config - Ambiente:', isLocalhost ? 'Desenvolvimento' : 'Produção');
console.log('Auth Domain:', firebaseConfig.authDomain);

export default firebaseConfig;
