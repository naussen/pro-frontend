// scripts.js
const firebaseConfig = {
    apiKey: "AIzaSyD103GQaVxUfLuH-ySnCxu7rl0xE8noaJM",
    authDomain: "nvp-concursos.firebaseapp.com",
    projectId: "nvp-concursos",
    storageBucket: "nvp-concursos.firebasestorage.app",
    messagingSenderId: "397960760271",
    appId: "1:397960760271:web:1550ff01910ae927d860ba"
};

let auth, db;
try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    console.log("Firebase inicializado e serviços acessados.");
} catch (e) {
    console.error("Erro CRÍTICO na inicialização do Firebase:", e);
    alert("Falha grave ao inicializar o sistema. Verifique o console.");
}

document.addEventListener('DOMContentLoaded', () => {
    // Tema Claro/Escuro (comum a todas as páginas)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const bodyElement = document.body;
    const sunIcon = themeToggleBtn?.querySelector('.theme-icon-light');
    const moonIcon = themeToggleBtn?.querySelector('.theme-icon-dark');

    function applyTheme(theme) {
        if (theme === 'dark') {
            bodyElement.classList.add('dark-mode');
            if (sunIcon) sunIcon.style.display = 'none';
            if (moonIcon) moonIcon.style.display = 'inline';
        } else {
            bodyElement.classList.remove('dark-mode');
            if (sunIcon) sunIcon.style.display = 'inline';
            if (moonIcon) moonIcon.style.display = 'none';
        }
    }

    if (themeToggleBtn) {
        const savedTheme = localStorage.getItem('theme');
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        let currentTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
        applyTheme(currentTheme);

        themeToggleBtn.addEventListener('click', () => {
            let newTheme = bodyElement.classList.contains('dark-mode') ? 'light' : 'dark';
            applyTheme(newTheme);
            localStorage.setItem('theme', newTheme);
        });

        prefersDarkScheme.addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Lógica Dropdown Login (para index.html)
    const loginBtn = document.getElementById('login-btn');
    const loginDropdown = document.getElementById('login-dropdown');

    if (loginBtn && loginDropdown) {
        loginBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            loginDropdown.classList.toggle('active');
            loginDropdown.style.display = loginDropdown.classList.contains('active') ? 'block' : 'none';
        });

        document.addEventListener('click', (event) => {
            if (!loginDropdown.contains(event.target) && !loginBtn.contains(event.target)) {
                loginDropdown.classList.remove('active');
                loginDropdown.style.display = 'none';
            }
        });

        loginDropdown.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    } else if (!loginBtn || !loginDropdown) {
        console.warn("Botão de Login (#login-btn) ou Dropdown (#login-dropdown) não encontrado no HTML.");
    }

    // Lógica Formulário de Login (para index.html)
    const loginForm = document.getElementById('login-form');
    if (loginForm && auth && db) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email');
            const passwordInput = document.getElementById('login-password');
            const email = emailInput?.value;
            const password = passwordInput?.value;
            const loginButton = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                alert('Por favor, preencha email e senha.');
                return;
            }

            loginButton.disabled = true;
            loginButton.textContent = 'Entrando...';

            auth.signInWithEmailAndPassword(email, password)
                .then(userCredential => db.collection('users').doc(userCredential.user.uid).get())
                .then(doc => {
                    if (doc.exists && doc.data().role === 'admin') {
                        window.location.href = '/admin/dashboard.html';
                    } else if (doc.exists && doc.data().hasPersonalized === true) {
                        window.location.href = 'saladeestudos.html';
                    } else {
                        window.location.href = 'personalizar.html';
                    }
                })
                .catch(error => {
                    console.error("Erro no login ou busca Firestore:", error);
                    let friendlyMessage = 'Erro no login. Verifique suas credenciais.';
                    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                        friendlyMessage = 'Email ou senha inválidos.';
                    } else if (error.code === 'auth/invalid-email') {
                        friendlyMessage = 'Formato de email inválido.';
                    }
                    alert(friendlyMessage);
                    loginButton.disabled = false;
                    loginButton.textContent = 'Entrar';
                });
        });
    } else if (loginForm) {
        console.warn("Formulário de login encontrado, mas serviços Firebase (auth/db) não estão prontos.");
        const loginButton = loginForm.querySelector('button[type="submit"]');
        if (loginButton) {
            loginButton.disabled = true;
            loginButton.textContent = 'Erro Init';
            loginButton.style.backgroundColor = 'grey';
        }
    }

    // Lógica Dropdown Navegação (para páginas internas como saladeestudos.html)
    const navItems = document.querySelectorAll('.nav-item');
    if (navItems.length > 0) {
        navItems.forEach(item => {
            const btn = item.querySelector('.nav-btn');
            const dropdown = item.querySelector('.dropdown-content');

            if (btn && dropdown) {
                const toggleDropdown = () => {
                    const isVisible = dropdown.style.display === 'block';
                    document.querySelectorAll('.dropdown-content').forEach(dd => {
                        dd.style.display = 'none';
                        dd.classList.remove('active');
                    });
                    if (!isVisible) {
                        dropdown.style.display = 'block';
                        dropdown.classList.add('active');
                    }
                };

                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleDropdown();
                });

                btn.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDropdown();
                    }
                });
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-item')) {
                document.querySelectorAll('.dropdown-content').forEach(dd => {
                    dd.style.display = 'none';
                    dd.classList.remove('active');
                });
            }
        });
    }

    // Logout (para páginas internas)
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            auth.signOut().then(() => {
                console.log('Logout bem-sucedido');
                window.location.href = 'index.html';
            }).catch(error => {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout: ' + error.message);
            });
        });
    }

    // Mudar Cor de Fundo (para páginas internas)
    const colorPickerBtn = document.getElementById('color-picker-btn');
    if (colorPickerBtn) {
        colorPickerBtn.addEventListener('click', () => {
            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.value = document.body.style.backgroundColor || '#ffffff';
            colorInput.addEventListener('change', () => {
                const color = colorInput.value;
                document.body.style.backgroundColor = color;
                // Removida a chamada a saveSalaConfig até que a API esteja configurada
                console.log('Cor alterada localmente:', color);
            });
            colorInput.click();
        });
    }

    // Ano no Rodapé (comum a todas as páginas)
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});