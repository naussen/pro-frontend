document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('login-btn');
    const loginDropdownPanel = document.getElementById('login-dropdown');
    const signupDropdownPanel = document.getElementById('signup-dropdown');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    // const loginForm = document.getElementById('login-form'); // Definido abaixo
    // const signupForm = document.getElementById('signup-form'); // Definido abaixo

    const pomodoroBtnHeader = document.getElementById('pomodoro-header-btn');
    const pomodoroDropdownHeader = document.getElementById('pomodoro-header-dropdown');
    const startPomodoroBtnHeader = document.getElementById('startPomodoroHeaderBtn');
    const stopPomodoroBtnHeader = document.getElementById('stopPomodoroHeaderBtn');
    const pomodoroTimeSelectHeader = document.getElementById('pomodoroTimeHeader');
    const pomodoroTimerDisplayHeader = document.getElementById('pomodoroTimerHeader');
    const pomodoroStatusDisplayHeader = document.getElementById('pomodoroStatusHeader');

    const musicBtnHeader = document.getElementById('music-header-btn');
    const musicDropdownHeader = document.getElementById('music-header-dropdown');
    const playMusicHeaderBtn = document.getElementById('playMusicHeaderBtn');
    const pauseMusicHeaderBtn = document.getElementById('pauseMusicHeaderBtn');
    const audioPlayerHeader = document.getElementById('audioPlayerHeader');

    let pomodoroIntervalInstanceHeader = null;
    let timeRemainingValueHeader;
    let isBreakStateHeader = false;
    let initialFocusDurationHeader;
    let isMusicPlayingHeader = false;

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

    // --- Pomodoro do Header ---
    if (pomodoroTimeSelectHeader && pomodoroTimerDisplayHeader) {
        try {
            timeRemainingValueHeader = parseInt(pomodoroTimeSelectHeader.value) * 60;
            initialFocusDurationHeader = timeRemainingValueHeader;
            pomodoroTimerDisplayHeader.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
            if (pomodoroStatusDisplayHeader) pomodoroStatusDisplayHeader.textContent = "Foco";
        } catch (e) {
            console.error("Pomodoro (Header): Erro na inicialização dos valores de tempo.", e);
            timeRemainingValueHeader = 25 * 60; initialFocusDurationHeader = 25 * 60;
            if(pomodoroTimerDisplayHeader) pomodoroTimerDisplayHeader.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
        }
    } else {
        console.warn("Pomodoro (Header): Elementos de display/select não encontrados na inicialização.");
    }

    if (pomodoroBtnHeader && pomodoroDropdownHeader) {
        pomodoroBtnHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = pomodoroDropdownHeader.style.display === 'block';
            closeAllHeaderDropdowns();
            if (!isVisible) pomodoroDropdownHeader.style.display = 'block';
        });
    }
    if (startPomodoroBtnHeader) startPomodoroBtnHeader.addEventListener('click', handleStartPomodoroHeader);
    if (stopPomodoroBtnHeader) stopPomodoroBtnHeader.addEventListener('click', handleStopPomodoroHeader);
    if (pomodoroTimeSelectHeader) {
        pomodoroTimeSelectHeader.addEventListener('change', () => {
            if (!pomodoroIntervalInstanceHeader) {
                if (!pomodoroTimeSelectHeader || !pomodoroTimerDisplayHeader || !pomodoroStatusDisplayHeader) return;
                timeRemainingValueHeader = parseInt(pomodoroTimeSelectHeader.value) * 60;
                initialFocusDurationHeader = timeRemainingValueHeader;
                isBreakStateHeader = pomodoroTimeSelectHeader.value !== '25';
                pomodoroTimerDisplayHeader.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
                pomodoroStatusDisplayHeader.textContent = isBreakStateHeader ? 'Pausa' : 'Foco';
            }
        });
    }

    function formatTimeHeaderInternal(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    function handleStartPomodoroHeader() {
        if (pomodoroIntervalInstanceHeader) return;
        const sel = document.getElementById('pomodoroTimeHeader'), disp = document.getElementById('pomodoroTimerHeader'), stat = document.getElementById('pomodoroStatusHeader');
        if (!sel || !disp || !stat) { console.error("Pomodoro (Header): Elementos não encontrados para iniciar."); return; }
        timeRemainingValueHeader = parseInt(sel.value) * 60; initialFocusDurationHeader = timeRemainingValueHeader;
        isBreakStateHeader = sel.value !== '25';
        stat.textContent = isBreakStateHeader ? 'Pausa' : 'Foco';
        disp.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
        pomodoroIntervalInstanceHeader = setInterval(handleUpdatePomodoroTimerHeader, 1000);
    }
    function handleUpdatePomodoroTimerHeader() {
        const disp = document.getElementById('pomodoroTimerHeader'), stat = document.getElementById('pomodoroStatusHeader');
        if (!disp || !stat) { clearInterval(pomodoroIntervalInstanceHeader); pomodoroIntervalInstanceHeader = null; return; }
        if (timeRemainingValueHeader <= 0) {
            clearInterval(pomodoroIntervalInstanceHeader); pomodoroIntervalInstanceHeader = null;
            stat.textContent = 'Concluído!';
            setTimeout(() => {
                timeRemainingValueHeader = initialFocusDurationHeader;
                disp.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
                stat.textContent = isBreakStateHeader ? 'Pausa' : 'Foco';
            }, 3000); return;
        }
        timeRemainingValueHeader--;
        disp.textContent = formatTimeHeaderInternal(timeRemainingValueHeader);
    }
    function handleStopPomodoroHeader() {
        clearInterval(pomodoroIntervalInstanceHeader); pomodoroIntervalInstanceHeader = null;
        const sel = document.getElementById('pomodoroTimeHeader'), disp = document.getElementById('pomodoroTimerHeader'), stat = document.getElementById('pomodoroStatusHeader');
        if (sel && disp) { timeRemainingValueHeader = parseInt(sel.value) * 60; disp.textContent = formatTimeHeaderInternal(timeRemainingValueHeader); }
        if (stat) stat.textContent = 'Foco';
    }

    // --- Music Logic (Header) ---
    if (musicBtnHeader && musicDropdownHeader) {
        musicBtnHeader.addEventListener('click', function(e) {
            e.stopPropagation();
            const isVisible = musicDropdownHeader.style.display === 'block';
            closeAllHeaderDropdowns();
            if (!isVisible) musicDropdownHeader.style.display = 'block';
        });
    }
    if (playMusicHeaderBtn) playMusicHeaderBtn.addEventListener('click', playMusicHeaderInternal);
    if (pauseMusicHeaderBtn) pauseMusicHeaderBtn.addEventListener('click', pauseMusicHeaderInternal);

    function playMusicHeaderInternal() {
        if (!isMusicPlayingHeader && audioPlayerHeader) {
            audioPlayerHeader.play().catch(e => console.error("Música (Header): Erro ao tocar", e));
            isMusicPlayingHeader = true;
        }
    }
    function pauseMusicHeaderInternal() {
        if (isMusicPlayingHeader && audioPlayerHeader) {
            audioPlayerHeader.pause();
            isMusicPlayingHeader = false;
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
            pomodoroBtnHeader, pomodoroDropdownHeader,
            musicBtnHeader, musicDropdownHeader
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