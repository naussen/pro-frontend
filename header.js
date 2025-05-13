document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const loginDropdownPanel = document.getElementById('login-dropdown');
    const signupDropdownPanel = document.getElementById('signup-dropdown');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    // const loginForm = document.getElementById('login-form'); // Definido abaixo
    // const signupForm = document.getElementById('signup-form'); // Definido abaixo

    
    // --- Utility para fechar dropdowns do header ---
    function closeAllHeaderDropdowns() {
        if (loginDropdownPanel) loginDropdownPanel.style.display = 'none';
        if (signupDropdownPanel) signupDropdownPanel.style.display = 'none';
        if (pomodoroDropdownHeader) pomodoroDropdownHeader.style.display = 'none';
        if (musicDropdownHeader) musicDropdownHeader.style.display = 'none';
    }
    
    // --- Login/Signup Dropdown Logic ---
    if (loginBtn && loginDropdownPanel && signupDropdownPanel) {
        loginBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = loginDropdownPanel.style.display === 'block';
            closeAllHeaderDropdowns();
            if (!isVisible) loginDropdownPanel.style.display = 'block';
        });
        if (showSignupLink) {
            showSignupLink.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                closeAllHeaderDropdowns();
                signupDropdownPanel.style.display = 'block';
            });
        }
        if (showLoginLink) {
            showLoginLink.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                closeAllHeaderDropdowns();
                loginDropdownPanel.style.display = 'block';
            });
        }
    }

    // --- Form Submissions (Placeholder) ---
    const loginFormElem = document.getElementById('login-form'); // Renomeado para evitar conflito com var loginForm
    if (loginFormElem) {
        loginFormElem.addEventListener('submit', function(e) {
            e.preventDefault();
            // const email = document.getElementById('login-email').value;
            console.log('Tentativa de Login (header)');
            if (loginDropdownPanel) loginDropdownPanel.style.display = 'none';
        });
    }
    const signupFormElem = document.getElementById('signup-form'); // Renomeado
    if (signupFormElem) {
        signupFormElem.addEventListener('submit', function(e) {
            e.preventDefault();
            // const password = document.getElementById('signup-password').value;
            // const confirmPassword = document.getElementById('confirm-password').value;
            // if (password !== confirmPassword) { alert('As senhas não coincidem!'); return; }
            console.log('Tentativa de Cadastro (header)');
            if (signupDropdownPanel) signupDropdownPanel.style.display = 'none';
        });
    }
    
    // Global click listener para fechar dropdowns do header
    document.addEventListener('click', function(e) {
        let clickedInsideADropdownOrButton = false;
        const dropdownsAndButtons = [
            loginBtn, loginDropdownPanel, signupDropdownPanel,                     
        ];
        for (const el of dropdownsAndButtons) {
            if (el && el.contains(e.target)) {
                clickedInsideADropdownOrButton = true;
                break;
            }
        }
        if (!clickedInsideADropdownOrButton) {
            closeAllHeaderDropdowns();
        }
    });
}); 