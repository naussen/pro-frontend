// Namespace isolado para o Pomodoro Timer
window.PomodoroTimerApp = (function() {
    'use strict';

    // Variáveis privadas
    let timerState = {
        workDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        pomodorosBeforeLongBreak: 4,
        currentTime: 25 * 60,
        timerInterval: null,
        isTimerRunning: false,
        currentSession: 'work',
        pomodoroCount: 0
    };

    let elements = {};
    let isInitialized = false;
    let lastListeners = {};

    // Função para buscar elementos DOM de forma segura
    function initializeElements() {
        const elementIds = {
            pomodoroBtn: 'pomodoro-btn',
            pomodoroPanel: 'pomodoroTimerPanel',
            pomodoroCloseBtn: 'pomodoroTimerCloseBtn',
            pomodoroTimeDisplay: 'pomodoroTimerTime',
            pomodoroStartBtn: 'pomodoroTimerStartBtn',
            pomodoroPauseBtn: 'pomodoroTimerPauseBtn',
            pomodoroResetBtn: 'pomodoroTimerResetBtn',
            pomodoroSessionStatus: 'pomodoroTimerSessionStatus',
            pomodoroCyclesDisplay: 'pomodoroTimerCycles'
        };

        let allElementsFound = true;

        // Buscar elementos primeiro no header-placeholder, depois globalmente
        const headerContainer = document.getElementById('header-placeholder') || document.getElementById('mainHeader') || document;

        for (let key in elementIds) {
            elements[key] = headerContainer.querySelector ?
                headerContainer.querySelector('#' + elementIds[key]) :
                document.getElementById(elementIds[key]);

            if (!elements[key]) {
                console.warn(`Elemento ${elementIds[key]} não encontrado no header, buscando globalmente...`);
                elements[key] = document.getElementById(elementIds[key]);
            }

            if (!elements[key]) {
                console.error(`Elemento ${elementIds[key]} não encontrado`);
                allElementsFound = false;
            }
        }

        return allElementsFound;
    }

    // Remove listeners antigos para evitar duplicação
    function removeOldListeners() {
        if (lastListeners.pomodoroBtn && elements.pomodoroBtn) {
            elements.pomodoroBtn.removeEventListener('click', lastListeners.pomodoroBtn);
        }
        if (lastListeners.pomodoroCloseBtn && elements.pomodoroCloseBtn) {
            elements.pomodoroCloseBtn.removeEventListener('click', lastListeners.pomodoroCloseBtn);
        }
        if (lastListeners.pomodoroStartBtn && elements.pomodoroStartBtn) {
            elements.pomodoroStartBtn.removeEventListener('click', lastListeners.pomodoroStartBtn);
        }
        if (lastListeners.pomodoroPauseBtn && elements.pomodoroPauseBtn) {
            elements.pomodoroPauseBtn.removeEventListener('click', lastListeners.pomodoroPauseBtn);
        }
        if (lastListeners.pomodoroResetBtn && elements.pomodoroResetBtn) {
            elements.pomodoroResetBtn.removeEventListener('click', lastListeners.pomodoroResetBtn);
        }
    }

    // Função para atualizar o display
    function updateDisplay() {
        if (!elements.pomodoroTimeDisplay) return;

        const minutes = Math.floor(timerState.currentTime / 60);
        const seconds = timerState.currentTime % 60;
        elements.pomodoroTimeDisplay.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Função para iniciar o timer
    function startTimer() {
        if (timerState.isTimerRunning) return;

        timerState.isTimerRunning = true;
        elements.pomodoroStartBtn.style.display = 'none';
        elements.pomodoroPauseBtn.style.display = 'inline-block';

        timerState.timerInterval = setInterval(function() {
            timerState.currentTime--;
            updateDisplay();

            if (timerState.currentTime < 0) {
                clearInterval(timerState.timerInterval);
                switchSession();
            }
        }, 1000);
    }

    // Função para pausar o timer
    function pauseTimer() {
        timerState.isTimerRunning = false;
        elements.pomodoroStartBtn.style.display = 'inline-block';
        elements.pomodoroPauseBtn.style.display = 'none';
        clearInterval(timerState.timerInterval);
    }

    // Função para resetar o timer
    function resetTimer(resetCycles) {
        clearInterval(timerState.timerInterval);
        timerState.isTimerRunning = false;
        timerState.currentSession = 'work';
        timerState.currentTime = timerState.workDuration;

        if (resetCycles) {
            timerState.pomodoroCount = 0;
        }

        updateDisplay();
        elements.pomodoroSessionStatus.textContent = 'Sessão de Trabalho';
        elements.pomodoroCyclesDisplay.textContent = timerState.pomodoroCount;
        elements.pomodoroStartBtn.style.display = 'inline-block';
        elements.pomodoroPauseBtn.style.display = 'none';
    }

    // Função para alternar sessões
    function switchSession() {
        if (timerState.currentSession === 'work') {
            timerState.pomodoroCount++;
            elements.pomodoroCyclesDisplay.textContent = timerState.pomodoroCount;

            if (timerState.pomodoroCount % timerState.pomodorosBeforeLongBreak === 0) {
                timerState.currentSession = 'longBreak';
                timerState.currentTime = timerState.longBreakDuration;
                elements.pomodoroSessionStatus.textContent = 'Pausa Longa';
            } else {
                timerState.currentSession = 'shortBreak';
                timerState.currentTime = timerState.shortBreakDuration;
                elements.pomodoroSessionStatus.textContent = 'Pausa Curta';
            }
        } else {
            timerState.currentSession = 'work';
            timerState.currentTime = timerState.workDuration;
            elements.pomodoroSessionStatus.textContent = 'Sessão de Trabalho';
        }

        updateDisplay();

        // Tentar notificação
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🍅 Pomodoro Timer', {
                    body: `Hora da ${elements.pomodoroSessionStatus.textContent}!`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
                });
            }
        } catch (e) {
            console.log('Notificações não disponíveis');
        }

        startTimer();
    }

    // Função para mostrar/esconder painel
    function togglePanel(forceOpen) {
        if (!elements.pomodoroPanel) return;
        const isVisible = elements.pomodoroPanel.style.display === 'flex';
        if (forceOpen === true) {
            elements.pomodoroPanel.style.display = 'flex';
        } else if (forceOpen === false) {
            elements.pomodoroPanel.style.display = 'none';
        } else {
            elements.pomodoroPanel.style.display = isVisible ? 'none' : 'flex';
        }
    }

    // Função para fechar painel
    function closePanel() {
        if (elements.pomodoroPanel) {
            elements.pomodoroPanel.style.display = 'none';
        }
    }

    // Função para configurar event listeners
    function setupEventListeners() {
        if (!isInitialized) return;
        removeOldListeners();

        // Botão principal do pomodoro
        lastListeners.pomodoroBtn = function(e) {
            e.preventDefault();
            e.stopPropagation();
            togglePanel();
        };
        elements.pomodoroBtn.addEventListener('click', lastListeners.pomodoroBtn);

        // Botão fechar
        lastListeners.pomodoroCloseBtn = closePanel;
        elements.pomodoroCloseBtn.addEventListener('click', lastListeners.pomodoroCloseBtn);

        // Controles do timer
        lastListeners.pomodoroStartBtn = startTimer;
        elements.pomodoroStartBtn.addEventListener('click', lastListeners.pomodoroStartBtn);
        lastListeners.pomodoroPauseBtn = pauseTimer;
        elements.pomodoroPauseBtn.addEventListener('click', lastListeners.pomodoroPauseBtn);
        lastListeners.pomodoroResetBtn = function() { resetTimer(true); };
        elements.pomodoroResetBtn.addEventListener('click', lastListeners.pomodoroResetBtn);

        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (elements.pomodoroPanel &&
                elements.pomodoroPanel.style.display === 'flex' &&
                !elements.pomodoroPanel.contains(e.target) &&
                !elements.pomodoroBtn.contains(e.target)) {
                closePanel();
            }
        });

        // Solicitar permissão para notificações
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
            }
        } catch (e) {
            console.log('Notificações não suportadas');
        }
    }

    // Função de inicialização principal
    function init() {
        if (isInitialized) {
            // Permite reinicializar se header for recarregado
            removeOldListeners();
        }

        if (!initializeElements()) {
            console.error('❌ Falha ao inicializar elementos do Pomodoro');
            return;
        }

        setupEventListeners();

        // Estado inicial
        updateDisplay();
        elements.pomodoroPauseBtn.style.display = 'none';

        isInitialized = true;
        console.log('✅ Pomodoro Timer inicializado com sucesso!');
    }

    // Função para tentar inicializar múltiplas vezes
    function tryInitialize() {
        let attempts = 0;
        const maxAttempts = 10;
        const interval = setInterval(function() {
            attempts++;
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
                init();
                if (isInitialized) {
                    clearInterval(interval);
                    return;
                }
            }
            if (attempts >= maxAttempts) {
                clearInterval(interval);
                console.error('❌ Falha ao inicializar Pomodoro após múltiplas tentativas');
            }
        }, 500);
    }

    // API pública
    return {
        init: init,
        tryInitialize: tryInitialize,
        isInitialized: function() { return isInitialized; },
        openPanel: function() { togglePanel(true); },
        closePanel: function() { togglePanel(false); },
        togglePanel: togglePanel
    };
})();

// Inicialização automática com múltiplas estratégias
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.PomodoroTimerApp.tryInitialize);
} else {
    window.PomodoroTimerApp.tryInitialize();
}

// Fallback adicional
window.addEventListener('load', function() {
    if (!window.PomodoroTimerApp.isInitialized()) {
        window.PomodoroTimerApp.tryInitialize();
    }
});

// Integração com sidebar toggle (se existir no contexto pai)
document.addEventListener('click', function(e) {
    console.log('🖱️ Clique detectado em:', e.target.id, e.target.className);

    // Sidebar toggle
    if (e.target.id === 'sidebarToggleBtn' && window.studyApp) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 Sidebar toggle clicado via delegação');
        window.studyApp.toggleSidebar();
        return;
    }

    // Botão "Todos os Cursos" - melhor detecção
    const isShowAllCoursesBtn = e.target.id === 'showAllCoursesBtn' ||
                              e.target.closest('#showAllCoursesBtn') ||
                              e.target.parentElement?.id === 'showAllCoursesBtn' ||
                              (e.target.tagName === 'SPAN' && e.target.parentElement?.id === 'showAllCoursesBtn');

    if (isShowAllCoursesBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 Botão "Todos os Cursos" clicado via delegação');
        if (window.studyApp && window.studyApp.loadAllCourses) {
            window.studyApp.loadAllCourses();
        } else {
            console.warn('⚠️ studyApp.loadAllCourses não disponível');
            // Retry após delay
            setTimeout(() => {
                if (window.studyApp && window.studyApp.loadAllCourses) {
                    console.log('🔄 Retry: Chamando loadAllCourses após delay');
                    window.studyApp.loadAllCourses();
                }
            }, 1000);
        }
        return;
    }

    // Botão de alternância de tema - melhor detecção
    const isThemeToggleBtn = e.target.id === 'themeToggleBtn' ||
                           e.target.closest('#themeToggleBtn') ||
                           e.target.parentElement?.id === 'themeToggleBtn' ||
                           e.target.id === 'themeIcon' ||
                           (e.target.tagName === 'SPAN' && e.target.parentElement?.id === 'themeToggleBtn');

    if (isThemeToggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 Botão de tema clicado via delegação');
        toggleTheme();
        return;
    }
});

// Event listeners diretos para garantir funcionamento
function setupDirectEventListeners() {
    console.log('🔧 Configurando event listeners diretos...');
    const header = document.getElementById('mainHeader') || document.querySelector('.w3s-header');
    if (!header) return;

    // Theme toggle button
    const themeBtn = header.querySelector('#themeToggleBtn');
    if (themeBtn) {
        themeBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Theme button clicked directly');
            toggleTheme();
        };
        console.log('✅ Event listener direto configurado para themeToggleBtn');
    } else {
        console.warn('❌ themeToggleBtn não encontrado para event listener direto');
    }

    // Botão QUESTÕES
    const questoesBtn = header.querySelector('#questoesOpenBtn');
    if (questoesBtn) {
        questoesBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Botão QUESTÕES clicado');
            tryOpenQuestoes();
        };
        console.log('✅ Event listener direto configurado para questoesOpenBtn');
    } else {
        console.warn('❌ questoesOpenBtn não encontrado para event listener direto');
    }

    // Show all courses button
    const showAllBtn = header.querySelector('#showAllCoursesBtn');
    if (showAllBtn) {
        showAllBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Show all courses button clicked directly');
            if (window.studyApp && window.studyApp.loadAllCourses) {
                window.studyApp.loadAllCourses();
            } else {
                console.warn('⚠️ studyApp.loadAllCourses não disponível');
                setTimeout(() => {
                    if (window.studyApp && window.studyApp.loadAllCourses) {
                        console.log('🔄 Retry: Chamando loadAllCourses após delay');
                        window.studyApp.loadAllCourses();
                    }
                }, 1000);
            }
        };
        console.log('✅ Event listener direto configurado para showAllCoursesBtn');
    } else {
        console.warn('❌ showAllCoursesBtn não encontrado para event listener direto');
    }

    // Sidebar toggle button
    const sidebarBtn = header.querySelector('#sidebarToggleBtn');
    if (sidebarBtn) {
        sidebarBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Sidebar toggle clicked directly');
            if (window.studyApp && window.studyApp.toggleSidebar) {
                window.studyApp.toggleSidebar();
            }
        };
        console.log('✅ Event listener direto configurado para sidebarToggleBtn');
    } else {
        console.warn('❌ sidebarToggleBtn não encontrado para event listener direto');
    }

    // Pomodoro button
    const pomodoroBtn = header.querySelector('#pomodoro-btn');
    if (pomodoroBtn) {
        pomodoroBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Pomodoro button clicked directly');
            if (window.PomodoroTimerApp && window.PomodoroTimerApp.togglePanel) {
                window.PomodoroTimerApp.togglePanel();
            } else {
                console.warn('⚠️ PomodoroTimerApp.togglePanel não disponível');
                // Retry após delay
                setTimeout(() => {
                    if (window.PomodoroTimerApp && window.PomodoroTimerApp.togglePanel) {
                        console.log('🔄 Retry: Chamando togglePanel após delay');
                        window.PomodoroTimerApp.togglePanel();
                    }
                }, 500);
            }
        };
        console.log('✅ Event listener direto configurado para pomodoro-btn');
    } else {
        console.warn('❌ pomodoro-btn não encontrado para event listener direto');
    }
}

// Função para alternar tema
function toggleTheme() {
    console.log('toggleTheme chamada');
    try {
        const body = document.body;
        const isDark = body.classList.toggle('dark-mode');
        console.log('Modo escuro:', isDark);

        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.textContent = isDark ? '☀️' : '🌙';
            console.log('Ícone atualizado para:', themeIcon.textContent);
        } else {
            console.warn('Elemento themeIcon não encontrado');
        }

        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        console.log('Tema salvo no localStorage:', isDark ? 'dark' : 'light');

        // Notificar o app principal se disponível
        if (window.studyApp && window.studyApp.showNotification) {
            window.studyApp.showNotification(`Tema ${isDark ? 'escuro' : 'claro'} ativado`, 'success');

            // Aplicar tema ao conteúdo da aula atual
            if (window.studyApp.currentContent && window.studyApp.applyCurrentThemeToLesson) {
                const lessonContent = document.querySelector('.lesson-content');
                if (lessonContent) {
                    console.log('🎨 Aplicando tema ao conteúdo da aula...');
                    window.studyApp.applyCurrentThemeToLesson(lessonContent);
                }
            }
        } else {
            console.log(`Tema ${isDark ? 'escuro' : 'claro'} ativado (sem notificação)`);
        }
    } catch (error) {
        console.error('Erro ao alternar tema:', error);
    }
}

// Aplicar tema salvo na inicialização
function applyTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    document.body.classList.toggle('dark-mode', isDark);

    // Buscar themeIcon no header primeiro, depois globalmente
    const headerContainer = document.getElementById('header-placeholder') || document.getElementById('mainHeader') || document;
    let themeIcon = headerContainer.querySelector ? headerContainer.querySelector('#themeIcon') : null;

    if (!themeIcon) {
        themeIcon = document.getElementById('themeIcon');
    }

    if (themeIcon) {
        themeIcon.textContent = isDark ? '☀️' : '🌙';
        console.log('✅ Ícone do tema atualizado:', themeIcon.textContent);
    } else {
        console.warn('⚠️ themeIcon não encontrado');
    }
}

// Aplicar tema quando o header for carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Header DOM carregado');
    applyTheme();
    setupDirectEventListeners();
});

window.addEventListener('load', function() {
    console.log('Header window load');
    applyTheme();
    setupDirectEventListeners();
});

// Configurar event listeners quando elementos estiverem disponíveis
function trySetupEventListeners() {
    let attempts = 0;
    const maxAttempts = 10;

    const interval = setInterval(() => {
        attempts++;
        console.log(`Tentativa ${attempts} de configurar event listeners`);

        if (document.getElementById('themeToggleBtn') && document.getElementById('showAllCoursesBtn')) {
            setupDirectEventListeners();
            clearInterval(interval);
            console.log('Event listeners configurados com sucesso');
        } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            console.warn('Falha ao configurar event listeners após múltiplas tentativas');
        }
    }, 500);
}

// Função global para inicialização após carregamento dinâmico
window.initializeHeaderEvents = function() {
    console.log('🔧 Inicializando eventos do header dinamicamente...');

    // Sempre buscar elementos apenas dentro do header-placeholder ou mainHeader
    const headerContainer = document.getElementById('header-placeholder') || document.getElementById('mainHeader') || document.querySelector('.w3s-header');
    if (!headerContainer) {
        console.error('❌ Container do header não encontrado');
        return;
    }

    // Diagnóstico dos elementos dentro do header
    const themeBtn = headerContainer.querySelector('#themeToggleBtn');
    const showAllBtn = headerContainer.querySelector('#showAllCoursesBtn');
    const sidebarBtn = headerContainer.querySelector('#sidebarToggleBtn');
    const pomodoroBtn = headerContainer.querySelector('#pomodoro-btn');
    const cursosBtn = headerContainer.querySelector('#cursosMenuBtn');
    const flashcardsBtn = headerContainer.querySelector('#flashcardsMenuBtn');

    console.log('🔍 Diagnóstico dos elementos no header:');
    console.log('  - themeToggleBtn:', themeBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('  - showAllCoursesBtn:', showAllBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('  - sidebarToggleBtn:', sidebarBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('  - pomodoro-btn:', pomodoroBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('  - cursosMenuBtn:', cursosBtn ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('  - flashcardsMenuBtn:', flashcardsBtn ? '✅ Encontrado' : '❌ Não encontrado');

    applyTheme();
    setupDirectEventListeners();

    // Configurar menus dropdown com retry
    const dropdownSuccess = setupDropdownMenus();
    if (!dropdownSuccess) {
        console.log('🔄 Tentando configurar dropdowns novamente em 500ms...');
        setTimeout(() => {
            setupDropdownMenus();
        }, 500);
    }

    // Inicializar Pomodoro Timer após carregamento dinâmico
    if (window.PomodoroTimerApp) {
        setTimeout(() => {
            console.log('🍅 Inicializando Pomodoro Timer...');
            window.PomodoroTimerApp.init();
        }, 100);
    }

    // Verificar se window.studyApp está disponível
    console.log('🔍 window.studyApp:', window.studyApp ? '✅ Disponível' : '❌ Não disponível');
    if (window.studyApp) {
        console.log('  - toggleSidebar:', typeof window.studyApp.toggleSidebar);
        console.log('  - loadAllCourses:', typeof window.studyApp.loadAllCourses);
        console.log('  - showNotification:', typeof window.studyApp.showNotification);
    }
};

// === FUNCIONALIDADE DOS MENUS DROPDOWN ===
function setupDropdownMenus() {
    console.log('🔧 Configurando menus dropdown...');

    const headerContainer = document.getElementById('header-placeholder') || document.getElementById('mainHeader') || document.querySelector('.w3s-header');
    if (!headerContainer) {
        console.warn('❌ Container do header não encontrado');
        return false;
    }

    console.log('📍 Container encontrado:', headerContainer.id || headerContainer.className);

    // Configurar botão CURSOS
    const cursosBtn = headerContainer.querySelector('#cursosMenuBtn');
    const cursosMenu = headerContainer.querySelector('#cursos-menu');

    console.log('🔍 Elementos CURSOS:', {
        button: cursosBtn ? 'Encontrado' : 'Não encontrado',
        menu: cursosMenu ? 'Encontrado' : 'Não encontrado'
    });

    if (cursosBtn && cursosMenu) {
        // Limpar event listeners anteriores
        cursosBtn.onclick = null;
        cursosBtn.removeAttribute('onclick');

        // Adicionar novo event listener
        cursosBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Botão CURSOS clicado - menu será toggleado');
            toggleDropdownMenu(cursosMenu, cursosBtn);
        });
        console.log('✅ Menu CURSOS configurado com sucesso');
    } else {
        console.warn('❌ Elementos do menu CURSOS não encontrados');
        return false;
    }

    // Configurar botão FLASHCARDS
    const flashcardsBtn = headerContainer.querySelector('#flashcardsMenuBtn');
    const flashcardsMenu = headerContainer.querySelector('#flashcards-menu');

    console.log('🔍 Elementos FLASHCARDS:', {
        button: flashcardsBtn ? 'Encontrado' : 'Não encontrado',
        menu: flashcardsMenu ? 'Encontrado' : 'Não encontrado'
    });

    if (flashcardsBtn && flashcardsMenu) {
        // Limpar event listeners anteriores
        flashcardsBtn.onclick = null;
        flashcardsBtn.removeAttribute('onclick');

        // Adicionar novo event listener
        flashcardsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Botão FLASHCARDS clicado - menu será toggleado');
            toggleDropdownMenu(flashcardsMenu, flashcardsBtn);
        });
        console.log('✅ Menu FLASHCARDS configurado com sucesso');
    } else {
        console.warn('❌ Elementos do menu FLASHCARDS não encontrados');
        return false;
    }

    // Configurar botão QUESTÕES
    const questoesBtn = headerContainer.querySelector('#questoesMenuBtn');
    const questoesMenu = headerContainer.querySelector('#questoes-menu');

    console.log('🔍 Elementos QUESTÕES:', {
        button: questoesBtn ? 'Encontrado' : 'Não encontrado',
        menu: questoesMenu ? 'Encontrado' : 'Não encontrado'
    });

    if (questoesBtn && questoesMenu) {
        // Limpar event listeners anteriores
        questoesBtn.onclick = null;
        questoesBtn.removeAttribute('onclick');

        // Adicionar novo event listener
        questoesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔧 Botão QUESTÕES clicado - menu será toggleado');
            toggleDropdownMenu(questoesMenu, questoesBtn);
        });
        console.log('✅ Menu QUESTÕES configurado com sucesso');
    } else {
        console.warn('❌ Elementos do menu QUESTÕES não encontrados');
        return false;
    }

    // Configurar fechamento ao clicar fora (apenas uma vez)
    if (!window.dropdownClickHandlerAdded) {
        document.addEventListener('click', function(e) {
            const dropdowns = document.querySelectorAll('.dropdown-menu.show');
            const isClickOnNavButton = e.target.closest('.nav-button');
            const isClickInsideDropdown = e.target.closest('.dropdown-menu');

            if (!isClickOnNavButton && !isClickInsideDropdown) {
                dropdowns.forEach(dropdown => {
                    closeDropdownMenu(dropdown);
                });
            }
        });
        window.dropdownClickHandlerAdded = true;
        console.log('✅ Handler de fechamento global configurado');
    }

    return true;
}

function toggleDropdownMenu(menu, button) {
    console.log('🔄 Toggle menu:', menu.id);

    // Fechar outros menus primeiro
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    allDropdowns.forEach(dropdown => {
        if (dropdown !== menu && dropdown.classList.contains('show')) {
            closeDropdownMenu(dropdown);
        }
    });

    // Toggle do menu atual
    const isOpen = menu.classList.contains('show');

    if (isOpen) {
        closeDropdownMenu(menu);
    } else {
        openDropdownMenu(menu, button);
    }
}

function openDropdownMenu(menu, button) {
    menu.classList.add('show');
    if (button) {
        button.setAttribute('aria-expanded', 'true');
    }
    console.log('📂 Menu aberto:', menu.id);
}

function closeDropdownMenu(menu) {
    menu.classList.remove('show');
    const button = document.querySelector(`[data-target="${menu.id}"]`);
    if (button) {
        button.setAttribute('aria-expanded', 'false');
    }
    console.log('📁 Menu fechado:', menu.id);
}

// === FUNÇÕES DOS ITENS DO MENU ===
function showAllCoursesAction() {
    console.log('🔧 Ação "Ver Todos os Cursos" executada');
    if (window.studyApp && window.studyApp.loadAllCourses) {
        window.studyApp.loadAllCourses();
        // Fechar menu
        const cursosMenu = document.querySelector('#cursos-menu');
        if (cursosMenu) closeDropdownMenu(cursosMenu);
    } else {
        console.warn('⚠️ studyApp.loadAllCourses não disponível');
        alert('Funcionalidade será implementada em breve!');
    }
}

function createCustomFlashcards() {
    console.log('🔧 Ação "Criar Flashcards Personalizados" executada');
    // Fechar menu
    const flashcardsMenu = document.querySelector('#flashcards-menu');
    if (flashcardsMenu) closeDropdownMenu(flashcardsMenu);

    if (window.studyApp && window.studyApp.showNotification) {
        window.studyApp.showNotification('Funcionalidade de Flashcards em desenvolvimento!', 'info');
    } else {
        alert('Funcionalidade de Flashcards Personalizados será implementada em breve!');
    }
}

// === FUNÇÕES DO MENU QUESTÕES ===
function openQuestoesForCourse(courseName) {
    console.log('🎯 Abrindo questões para curso:', courseName);

    // Fechar menu
    const questoesMenu = document.querySelector('#questoes-menu');
    if (questoesMenu) closeDropdownMenu(questoesMenu);

    try {
        // Se a integração estiver presente, usar contexto específico
        if (window.QuestoesIntegration && typeof window.QuestoesIntegration.openQuestions === 'function') {
            console.log('🔗 Usando integração QuestoesIntegration para curso específico');
            // Usar integração se disponível
            return window.QuestoesIntegration.openQuestions('static');
        }
    } catch (e) {
        console.warn('Integração QuestoesIntegration indisponível, usando fallback');
    }

    // Fallback: abrir com parâmetro de curso
    let url;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // URL direta para servidor de desenvolvimento
        url = 'http://localhost:8001/pro-questoes.html';
    } else {
        // Subdomínio para produção
        url = 'https://questoes.proconcursos.com.br/pro-questoes.html';
    }
    url += `?curso=${courseName}`;

    console.log('🌐 Abrindo URL com curso específico:', url);
    window.open(url, '_blank');
}

// Função global para abrir questões (para compatibilidade)
window.openQuestoesForCourse = openQuestoesForCourse;
window.openAllQuestoes = openAllQuestoes;

function openAllQuestoes() {
    console.log('🎯 Abrindo todas as questões');

    // Fechar menu
    const questoesMenu = document.querySelector('#questoes-menu');
    if (questoesMenu) closeDropdownMenu(questoesMenu);

    try {
        // Se a integração estiver presente, abrir em overlay
        if (window.QuestoesIntegration && typeof window.QuestoesIntegration.openQuestions === 'function') {
            console.log('🔗 Usando integração QuestoesIntegration');
            return window.QuestoesIntegration.openQuestions('overlay');
        }
    } catch (e) {
        console.warn('Integração QuestoesIntegration indisponível, usando fallback');
    }

    // Fallback: abrir página estática
    let url;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // URL direta para servidor de desenvolvimento
        url = 'http://localhost:8001/pro-questoes.html';
    } else {
        // Subdomínio para produção
        url = 'https://questoes.proconcursos.com.br/pro-questoes.html';
    }

    console.log('🌐 Abrindo URL geral:', url);
    window.open(url, '_blank');
}

// === Abrir Sistema de Questões ===
function tryOpenQuestoes() {
    console.log('🎯 tryOpenQuestoes chamada');

    // Se a integração estiver presente, abrir em overlay
    try {
        if (window.QuestoesIntegration && typeof window.QuestoesIntegration.openQuestions === 'function') {
            console.log('🔗 Usando integração QuestoesIntegration');
            return window.QuestoesIntegration.openQuestions('overlay');
        }
    } catch (e) {
        console.warn('Integração QuestoesIntegration indisponível, usando fallback');
    }

    // Fallback: abrir página estática com contexto se possível
    const url = buildQuestoesUrlWithContext();
    console.log('🌐 Abrindo URL:', url);
    window.open(url, '_blank');
}

function buildQuestoesUrlWithContext() {
    // Usar caminho absoluto correto para o sistema de questões
    let base = 'http://localhost:8001/pro-questoes.html';

    // Se não estiver em localhost, usar caminho relativo
    if (window.location.hostname !== 'localhost') {
        base = 'https://questoes.proconcursos.com.br/pro-questoes.html';
    }

    try {
        const path = window.location.pathname;
        console.log('📍 Path atual:', path);

        // Suporta /content/{courses}/modules/{modules}/aulas/{aula}.html
        const m2 = path.match(/\/content\/([^\/]+)\/modules\/([^\/]+)\/aulas\/([^\/]+)\.html/);
        // Suporta /content/{courses}/{modules}/{aula}.html
        const m1 = path.match(/\/content\/([^\/]+)\/([^\/]+)\/([^\/]+)\.html/);
        const match = m2 || m1;

        if (match) {
            console.log('🎯 Contexto extraído:', { courses: match[1], modules: match[2], aula: match[3] });
            const params = new URLSearchParams({ courses: match[1], modules: match[2], aula: match[3] });
            const finalUrl = `${base}?${params.toString()}`;
            console.log('🔗 URL final com contexto:', finalUrl);
            return finalUrl;
        } else {
            console.log('⚠️ Nenhum contexto encontrado no path');
        }
    } catch (error) {
        console.error('❌ Erro ao extrair contexto:', error);
    }

    console.log('🔗 URL final sem contexto:', base);
    return base;
}

// Tentar configurar imediatamente e com delay
trySetupEventListeners();

// Executar inicialização se carregado dinamicamente
if (window.location.pathname.includes('saladeestudos.html')) {
    setTimeout(() => {
        if (typeof window.initializeHeaderEvents === 'function') {
            window.initializeHeaderEvents();
        }
    }, 500);
}

// Função adicional para garantir inicialização dos dropdowns
function ensureDropdownsWork() {
    console.log('🔧 Verificando elementos dropdown...');

    const cursosBtn = document.querySelector('#cursosMenuBtn');
    const flashcardsBtn = document.querySelector('#flashcardsMenuBtn');
    const questoesBtn = document.querySelector('#questoesMenuBtn');
    const cursosMenu = document.querySelector('#cursos-menu');
    const flashcardsMenu = document.querySelector('#flashcards-menu');
    const questoesMenu = document.querySelector('#questoes-menu');

    console.log('🔍 Debug dos elementos:', {
        cursosBtn: cursosBtn ? `Encontrado (${cursosBtn.tagName})` : 'Não encontrado',
        flashcardsBtn: flashcardsBtn ? `Encontrado (${flashcardsBtn.tagName})` : 'Não encontrado',
        questoesBtn: questoesBtn ? `Encontrado (${questoesBtn.tagName})` : 'Não encontrado',
        cursosMenu: cursosMenu ? `Encontrado (${cursosMenu.tagName})` : 'Não encontrado',
        flashcardsMenu: flashcardsMenu ? `Encontrado (${flashcardsMenu.tagName})` : 'Não encontrado',
        questoesMenu: questoesMenu ? `Encontrado (${questoesMenu.tagName})` : 'Não encontrado'
    });

    // Verificar se os elementos estão visíveis
    if (cursosBtn) {
        const rect = cursosBtn.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        console.log('👁️ Botão CURSOS visível:', isVisible, rect);
    }

    if (questoesBtn) {
        const rect = questoesBtn.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        console.log('👁️ Botão QUESTÕES visível:', isVisible, rect);
    }

    if (cursosBtn && flashcardsBtn && questoesBtn && cursosMenu && flashcardsMenu && questoesMenu) {
        console.log('✅ Todos os elementos encontrados, configurando...');
        const success = setupDropdownMenus();

        // Teste adicional: simular clique
        if (success) {
            console.log('🧪 Testando funcionalidade dos botões...');

            // Adicionar indicador visual de que os botões estão funcionando
            cursosBtn.style.border = '2px solid green';
            flashcardsBtn.style.border = '2px solid green';
            questoesBtn.style.border = '2px solid green';

            setTimeout(() => {
                cursosBtn.style.border = '';
                flashcardsBtn.style.border = '';
                questoesBtn.style.border = '';
            }, 2000);
        }

        return success;
    } else {
        console.log('⚠️ Nem todos os elementos foram encontrados ainda');
        return false;
    }
}

// Retry mechanism para garantir que os dropdowns funcionem
let retryCount = 0;
const maxRetries = 10;

function retryDropdownSetup() {
    if (retryCount >= maxRetries) {
        console.error('❌ Falha ao configurar dropdowns após múltiplas tentativas');
        return;
    }

    if (!ensureDropdownsWork()) {
        retryCount++;
        console.log(`🔄 Tentativa ${retryCount}/${maxRetries} de configurar dropdowns...`);
        setTimeout(retryDropdownSetup, 200);
    } else {
        console.log('✅ Dropdowns configurados com sucesso!');
    }
}

// Iniciar retry se necessário
setTimeout(retryDropdownSetup, 100);