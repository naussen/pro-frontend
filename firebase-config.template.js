const firebaseConfigs = {
  'nvp-concursos': {
    apiKey: "__API_KEY_NVP__",
    authDomain: "nvp-concursos.firebaseapp.com",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1243b04141178453d860ba",
    measurementId: "G-T6RVBM12BQ"
  },
  'pro-concursos': {
    apiKey: "__API_KEY_PRO__",
    authDomain: "proconcursos.com.br",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1243b04141178453d860ba",
    measurementId: "G-T6RVBM12BQ"
  }
};

const hostname = window.location.hostname;
let firebaseConfig;

if (hostname.includes('proconcursos.com.br')) {
  firebaseConfig = firebaseConfigs['pro-concursos'];
} else {
  firebaseConfig = firebaseConfigs['nvp-concursos'];
}

window.firebaseConfig = firebaseConfig;