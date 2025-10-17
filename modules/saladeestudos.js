'use strict';

// === COMPORTAMENTO DO MENU ===
// O menu de cursos, módulos e aulas SEMPRE é apresentado no estado RECOLHIDO
// Independentemente da última visualização do usuário, ele deve clicar para expandir:
// 1. Clique no curso para ver os módulos
// 2. Clique no módulo para ver as aulas
// 3. Clique na aula para carregar o conteúdo
//
// O indicador de scroll (↓) aparece quando há mais conteúdo abaixo no menu

// === CONFIGURAÇÃO E INICIALIZAÇÃO ===
class StudyRoomApp {
    constructor() {
        this.isInitialized = false;
        this.userId = null;
        this.db = null;
        this.storage = null;
        this.auth = null;

        // Cache para otimização
        this.contentCache = new Map();
        this.coursesCache = null;
        this.cacheTTL = 5 * 60 * 1000; // 5 minutos

        // Estado da aplicação
        this.sidebarCollapsed = false;
        this.currentContent = null;
        this.loadedCourses = [];

        // Elementos DOM
        this.elements = {};

        // Configuração do Firebase
        this.firebaseConfig = {
            apiKey: "AIzaSyBSRxfHTLbNJWIz2k6ndi1yfVPRq9jzGq8",
            authDomain: "nvp-concursos.firebaseapp.com",
            projectId: "nvp-concursos",
            storageBucket: "nvp-concursos.firebasestorage.app",
            messagingSenderId: "397960760271",
            appId: "1:397960760271:web:1243b04141178453d860ba",
            measurementId: "G-T6RVBM12BQ"
        };

        this.init();
    }

    async init() {
        try {
            // Carrega header dinamicamente
            await this.loadHeader();

            // Inicializa Firebase
            this.initFirebase();

            // Inicializa elementos DOM
            this.initializeElements();

            // Configura event listeners
            this.setupEventListeners();

            // Configura indicador de scroll após elementos estarem prontos
            this.setupScrollIndicator();

            // Aplica tema salvo
            this.applyTheme();

            // Configura autenticação
            this.setupAuth();

            this.isInitialized = true;
            console.log('✅ StudyRoomApp inicializado com sucesso');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.showNotification('Erro na inicialização da aplicação', 'error');
        }
    }

    async loadHeader() {
        try {
            const response = await fetch('header_saladeestudos.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const headerHTML = await response.text();
            document.getElementById('header-placeholder').innerHTML = headerHTML;
            console.log('✅ Header carregado com sucesso');

            // Como o script do header agora é carregado de forma síncrona,
            // podemos inicializar os componentes imediatamente.
            if (window.PomodoroTimerApp) {
                window.PomodoroTimerApp.init();
            }
            if (window.initializeHeaderEvents) {
                window.initializeHeaderEvents();
            }

        } catch (error) {
            console.error('⚠️ Falha ao carregar header:', error);
            this.createFallbackHeader();
        }
    }

    createFallbackHeader() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        headerPlaceholder.innerHTML = `
            <header style="height: var(--header-height); background: var(--header-bg); border-bottom: 1px solid var(--header-border); display: flex; align-items: center; padding: 0 1rem; position: fixed; top: 0; left: 0; right: 0; z-index: 105;">
                <button id="sidebarToggleBtn" style="background: none; border: none; font-size: 24px; cursor: pointer; margin-right: 1rem;">☰</button>
                <h1 style="margin: 0; font-size: 1.2rem; color: var(--text-dark);">PRO Concursos - Sala de Estudos</h1>
                <div style="margin-left: auto; display: flex; gap: 0.5rem;">
                    <button id="showAllCoursesBtn" style="padding: 0.5rem 1rem; background: var(--main-color); color: white; border: none; border-radius: 4px; cursor: pointer;">📚 Todos os Cursos</button>
                    <button id="themeToggleBtn" style="padding: 0.5rem; background: var(--border-color); border: none; border-radius: 4px; cursor: pointer;">🌙</button>
                </div>
            </header>
        `;

        // Configurar event listeners para header fallback
        const sidebarBtn = headerPlaceholder.querySelector('#sidebarToggleBtn');
        const showAllBtn = headerPlaceholder.querySelector('#showAllCoursesBtn');
        const themeBtn = headerPlaceholder.querySelector('#themeToggleBtn');

        if (sidebarBtn) {
            sidebarBtn.onclick = () => this.toggleSidebar();
        }
        if (showAllBtn) {
            showAllBtn.onclick = () => this.loadAllCourses();
        }
        if (themeBtn) {
            themeBtn.onclick = () => {
                document.body.classList.toggle('dark-mode');
                const isDark = document.body.classList.contains('dark-mode');
                themeBtn.textContent = isDark ? '☀️' : '🌙';
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
            };
        }

        console.log('✅ Header fallback criado');
    }

    setupHeaderButtons() {
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) return;

        // Botão showAllCoursesBtn
        const showAllBtn = headerPlaceholder.querySelector('#showAllCoursesBtn');
        if (showAllBtn) {
            showAllBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Show All Courses clicked');
                this.loadAllCourses();
            };
            console.log('✅ showAllCoursesBtn configurado');
        } else {
            console.warn('❌ showAllCoursesBtn não encontrado');
        }

        // Botão themeToggleBtn
        const themeBtn = headerPlaceholder.querySelector('#themeToggleBtn');
        if (themeBtn) {
            themeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Theme Toggle clicked');
                const body = document.body;
                const isDark = body.classList.toggle('dark-mode');

                // Forçar atualização das variáveis CSS do sidebar
                if (isDark) {
                    document.documentElement.style.setProperty('--sidebar-bg', '#1a202c');
                    document.documentElement.style.setProperty('--sidebar-border', '#2d3748');
                } else {
                    document.documentElement.style.setProperty('--sidebar-bg', '#f8fafc');
                    document.documentElement.style.setProperty('--sidebar-border', '#e2e8f0');
                }

                const themeIcon = headerPlaceholder.querySelector('#themeIcon');
                if (themeIcon) {
                    themeIcon.textContent = isDark ? '☀️' : '🌙';
                }

                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                this.showNotification(`Tema ${isDark ? 'escuro' : 'claro'} ativado`, 'success');

                // Reprocessar gráficos Mermaid para o novo tema
                this.reprocessMermaidForTheme();
            };
            console.log('✅ themeToggleBtn configurado');
        } else {
            console.warn('❌ themeToggleBtn não encontrado');
        }

        // Botão pomodoro-btn
        const pomodoroBtn = headerPlaceholder.querySelector('#pomodoro-btn');
        if (pomodoroBtn) {
            pomodoroBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Pomodoro clicked');

                const pomodoroPanel = headerPlaceholder.querySelector('#pomodoroTimerPanel');
                if (pomodoroPanel) {
                    const isVisible = pomodoroPanel.style.display === 'flex';
                    pomodoroPanel.style.display = isVisible ? 'none' : 'flex';
                    console.log('🍅 Painel pomodoro', isVisible ? 'fechado' : 'aberto');
                } else {
                    console.warn('❌ Painel pomodoro não encontrado');
                }
            };
            console.log('✅ pomodoro-btn configurado');
        } else {
            console.warn('❌ pomodoro-btn não encontrado');
        }

        // Botão sidebarToggleBtn
        const sidebarBtn = headerPlaceholder.querySelector('#sidebarToggleBtn');
        if (sidebarBtn) {
            sidebarBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Sidebar Toggle clicked');
                this.toggleSidebar();
            };
            console.log('✅ sidebarToggleBtn configurado');
        } else {
            console.warn('❌ sidebarToggleBtn não encontrado');
        }

        // === CONFIGURAÇÃO DOS MENUS DROPDOWN ===
        this.setupDropdownMenus(headerPlaceholder);
    }

    setupDropdownMenus(headerContainer) {
        console.log('🔧 Configurando menus dropdown...');

        if (!headerContainer) {
            console.warn('❌ Container do header não fornecido');
            return false;
        }

        // Configurar botão CURSOS
        const cursosBtn = headerContainer.querySelector('#cursosMenuBtn');
        const cursosMenu = headerContainer.querySelector('#cursos-menu');

        console.log('🔍 Elementos CURSOS:', {
            button: cursosBtn ? 'Encontrado' : 'Não encontrado',
            menu: cursosMenu ? 'Encontrado' : 'Não encontrado'
        });

        if (cursosBtn && cursosMenu) {
            cursosBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Botão CURSOS clicado - toggling menu');
                this.toggleDropdownMenu(cursosMenu, cursosBtn);
            };
            console.log('✅ Menu CURSOS configurado com sucesso');
        } else {
            console.warn('❌ Elementos do menu CURSOS não encontrados');
        }

        // Configurar botão FLASHCARDS
        const flashcardsBtn = headerContainer.querySelector('#flashcardsMenuBtn');
        const flashcardsMenu = headerContainer.querySelector('#flashcards-menu');

        console.log('🔍 Elementos FLASHCARDS:', {
            button: flashcardsBtn ? 'Encontrado' : 'Não encontrado',
            menu: flashcardsMenu ? 'Encontrado' : 'Não encontrado'
        });

        if (flashcardsBtn && flashcardsMenu) {
            flashcardsBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Botão FLASHCARDS clicado - toggling menu');
                this.toggleDropdownMenu(flashcardsMenu, flashcardsBtn);
            };
            console.log('✅ Menu FLASHCARDS configurado com sucesso');
        } else {
            console.warn('❌ Elementos do menu FLASHCARDS não encontrados');
        }

        // Configurar botão QUESTÕES
        const questoesBtn = headerContainer.querySelector('#questoesMenuBtn');
        const questoesMenu = headerContainer.querySelector('#questoes-menu');

        console.log('🔍 Elementos QUESTÕES:', {
            button: questoesBtn ? 'Encontrado' : 'Não encontrado',
            menu: questoesMenu ? 'Encontrado' : 'Não encontrado'
        });

        if (questoesBtn && questoesMenu) {
            questoesBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔧 Botão QUESTÕES clicado - toggling menu');
                this.toggleDropdownMenu(questoesMenu, questoesBtn);
            };
            console.log('✅ Menu QUESTÕES configurado com sucesso');
        } else {
            console.warn('❌ Elementos do menu QUESTÕES não encontrados');
        }

        // Configurar fechamento ao clicar fora
        if (!window.dropdownClickHandlerAdded) {
            document.addEventListener('click', (e) => {
                const dropdowns = document.querySelectorAll('.dropdown-menu.show');
                const isClickOnNavButton = e.target.closest('.nav-button');
                const isClickInsideDropdown = e.target.closest('.dropdown-menu');

                if (!isClickOnNavButton && !isClickInsideDropdown) {
                    dropdowns.forEach(dropdown => {
                        this.closeDropdownMenu(dropdown);
                    });
                }
            });
            window.dropdownClickHandlerAdded = true;
            console.log('✅ Handler de fechamento global configurado');
        }

        return true;
    }

    toggleDropdownMenu(menu, button) {
        console.log('🔄 Toggle menu:', menu.id);

        // Fechar outros menus primeiro
        const allDropdowns = document.querySelectorAll('.dropdown-menu');
        allDropdowns.forEach(dropdown => {
            if (dropdown !== menu && dropdown.classList.contains('show')) {
                this.closeDropdownMenu(dropdown);
            }
        });

        // Toggle do menu atual
        const isOpen = menu.classList.contains('show');

        if (isOpen) {
            this.closeDropdownMenu(menu);
        } else {
            this.openDropdownMenu(menu, button);
        }
    }

    openDropdownMenu(menu, button) {
        menu.classList.add('show');
        if (button) {
            button.setAttribute('aria-expanded', 'true');
        }
        console.log('📂 Menu aberto:', menu.id);
    }

    closeDropdownMenu(menu) {
        menu.classList.remove('show');
        const button = document.querySelector(`[data-target="${menu.id}"]`);
        if (button) {
            button.setAttribute('aria-expanded', 'false');
        }
        console.log('📁 Menu fechado:', menu.id);
    }

    applyThemeToHeader() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        // Aplicar tema ao body
        document.body.classList.toggle('dark-mode', isDark);

        // Forçar atualização das variáveis CSS para garantir que o sidebar seja atualizado
        if (isDark) {
            document.documentElement.style.setProperty('--sidebar-bg', '#1a202c');
            document.documentElement.style.setProperty('--sidebar-border', '#2d3748');
        } else {
            document.documentElement.style.setProperty('--sidebar-bg', '#f8fafc');
            document.documentElement.style.setProperty('--sidebar-border', '#e2e8f0');
        }

        // Atualizar ícone do tema no header
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (headerPlaceholder) {
            const themeIcon = headerPlaceholder.querySelector('#themeIcon');
            if (themeIcon) {
                themeIcon.textContent = isDark ? '☀️' : '🌙';
                console.log('✅ Tema aplicado ao header:', isDark ? 'escuro' : 'claro');
            }
        }
    }

    initFirebase() {
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }

        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.storage = firebase.storage();

        // Configurações de performance com nova API
        try {
            // Nova API recomendada (Firebase v9+) com merge para evitar override warning
            this.db.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });
            console.log('✅ Firebase inicializado com persistência moderna');
        } catch (error) {
            // Fallback para API antiga se a nova não estiver disponível
            try {
                this.db.enablePersistence({ synchronizeTabs: true });
                console.log('✅ Firebase inicializado com persistência legada');
            } catch (persistenceError) {
                // Modo silencioso - não mostrar warning desnecessário
                if (this.isDevelopment()) {
                    console.warn('Persistência offline não disponível:', persistenceError);
                }
                console.log('✅ Firebase inicializado sem persistência');
            }
        }

        console.log('✅ Firebase inicializado');
    }

    // Função auxiliar para detectar ambiente de desenvolvimento
    isDevelopment() {
        return window.location.hostname === 'localhost' ||
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('localhost');
    }

    initializeElements() {
        this.elements = {
            sidebar: document.getElementById('studySidebar'),
            courseNav: document.getElementById('courseNavigation'),
            contentBody: document.getElementById('contentBody'),
            overlay: document.getElementById('sidebarOverlay'),
            scrollIndicator: document.getElementById('scrollIndicator')
        };
    }

    setupEventListeners() {
        // Overlay click (mobile)
        this.elements.overlay?.addEventListener('click', () => this.closeSidebar());

        // Sidebar icons click - expandir/recolher menu lateral
        const sidebarIconExpanded = document.querySelector('.sidebar-icon-expanded');
        const sidebarIconCollapsed = document.querySelector('.sidebar-icon-collapsed');

        // Event listener para ícone expandido (à direita)
        if (sidebarIconExpanded) {
            sidebarIconExpanded.addEventListener('click', () => {
                console.log('📚 Sidebar icon expandido clicado - recolhendo menu lateral');
                this.toggleSidebar();
            });
            sidebarIconExpanded.title = 'Clique para recolher menu lateral';
        }

        // Event listener para ícone recolhido (centralizado)
        if (sidebarIconCollapsed) {
            sidebarIconCollapsed.addEventListener('click', () => {
                console.log('📚 Sidebar icon recolhido clicado - expandindo menu lateral');
                this.toggleSidebar();
            });
            sidebarIconCollapsed.title = 'Clique para expandir menu lateral';
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
        });

        // Resize handler
        window.addEventListener('resize', () => this.handleResize());

        // Configurar indicador de scroll para a sidebar (será chamado após inicialização)
        // this.setupScrollIndicator();

        console.log('✅ Event listeners configurados');
    }

    setupAuth() {
        this.auth.onAuthStateChanged(user => {
            if (!user) {
                console.log('❌ Usuário não autenticado, redirecionando...');
                window.location.href = 'index.html';
                return;
            }

            this.userId = user.uid;
            console.log('✅ Usuário autenticado:', this.userId);

            // Carrega cursos após autenticação
            this.loadUserCourses();
        });
    }

    // === GERENCIAMENTO DE SIDEBAR ===
    toggleSidebar() {
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            this.elements.sidebar.classList.toggle('visible');
            this.elements.overlay.classList.toggle('visible');
        } else {
            this.sidebarCollapsed = !this.sidebarCollapsed;
            this.elements.sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
        }

        // Salva estado
        localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed.toString());
    }

    closeSidebar() {
        if (window.innerWidth <= 768) {
            this.elements.sidebar.classList.remove('visible');
            this.elements.overlay.classList.remove('visible');
        }
    }

    handleResize() {
        const isMobile = window.innerWidth <= 768;

        if (!isMobile && this.elements.sidebar.classList.contains('visible')) {
            this.elements.sidebar.classList.remove('visible');
            this.elements.overlay.classList.remove('visible');
        }
    }

    updateScrollIndicator() {
        if (!this.elements.scrollIndicator || !this.elements.courseNav) return;

        const nav = this.elements.courseNav;
        const indicator = this.elements.scrollIndicator;

        if (nav.scrollHeight > nav.clientHeight) {
            // Há conteúdo para scroll
            if (nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 10) {
                // Próximo do final - oculta indicador
                indicator.classList.remove('visible');
            } else {
                // Mostra indicador
                indicator.classList.add('visible');
            }
        } else {
            // Não há scroll necessário - oculta indicador
            indicator.classList.remove('visible');
        }
    }

    setupScrollIndicator() {
        if (!this.elements.scrollIndicator || !this.elements.courseNav) return;

        const checkScrollIndicator = () => {
            const nav = this.elements.courseNav;
            const indicator = this.elements.scrollIndicator;

            if (nav.scrollHeight > nav.clientHeight) {
                // Há conteúdo para scroll
                if (nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 10) {
                    // Próximo do final - oculta indicador
                    indicator.classList.remove('visible');
                } else {
                    // Mostra indicador
                    indicator.classList.add('visible');
                }
            } else {
                // Não há scroll necessário - oculta indicador
                indicator.classList.remove('visible');
            }
        };

        // Verificar ao carregar conteúdo
        this.elements.courseNav.addEventListener('scroll', checkScrollIndicator);

        // Verificar inicialmente
        setTimeout(checkScrollIndicator, 100);

        console.log('✅ Indicador de scroll configurado');
    }

    // === GERENCIAMENTO DE TEMA ===
    applyTheme() {
        // Restaura estado da sidebar
        const sidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarState && window.innerWidth > 768) {
            this.sidebarCollapsed = true;
            this.elements.sidebar.classList.add('collapsed');
        }

        // Aplicar tema salvo às variáveis CSS do sidebar
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

        if (isDark) {
            document.documentElement.style.setProperty('--sidebar-bg', '#1a202c');
            document.documentElement.style.setProperty('--sidebar-border', '#2d3748');
        } else {
            document.documentElement.style.setProperty('--sidebar-bg', '#f8fafc');
            document.documentElement.style.setProperty('--sidebar-border', '#e2e8f0');
        }
    }

    // === GERENCIAMENTO DO BOTÃO DINÂMICO DE QUESTÕES ===
    updateDynamicQuestoesButton(meta) {
        const button = document.getElementById('dynamic-questoes-btn');
        if (!button) return;

        if (meta && meta.course && meta.module) {
            // Exibir botão quando houver contexto de aula
            button.classList.add('visible');
            button.title = `Questões: ${meta.course} > ${meta.module}`;

            // Remover event listener anterior
            button.onclick = null;

            // Adicionar novo event listener
            button.onclick = () => {
                this.openQuestoesForCurrentModule(meta);
            };

            console.log('✅ Botão dinâmico ativado para:', meta.course, '>', meta.module);
        } else {
            // Ocultar botão quando não há contexto
            button.classList.remove('visible');
            button.onclick = null;
            console.log('⚪ Botão dinâmico oculto - sem contexto');
        }
    }

    openQuestoesForCurrentModule(meta) {
        console.log('🎯 Abrindo questões para módulo atual:', meta);

        try {
            // Se a integração estiver presente, usar contexto específico
            if (window.QuestoesIntegration && typeof window.QuestoesIntegration.openQuestions === 'function') {
                console.log('🔗 Usando integração QuestoesIntegration com contexto específico');
                // Criar um contexto personalizado para a integração
                const originalContext = window.QuestoesIntegration.currentContext;

                // Temporariamente definir contexto baseado na aula atual
                window.QuestoesIntegration.currentContext = {
                    type: 'content',
                    courses: this.normalizeCourseId(meta.course),
                    modules: this.normalizeModuleId(meta.module),
                    aula: meta.aula || null
                };

                // Aplicar filtros contextuais
                window.QuestoesIntegration.setContextualFilters();

                // Abrir em modo overlay
                window.QuestoesIntegration.openQuestions('overlay');

                // Restaurar contexto original
                setTimeout(() => {
                    window.QuestoesIntegration.currentContext = originalContext;
                }, 1000);

                return;
            }
        } catch (e) {
            console.warn('Integração QuestoesIntegration indisponível, usando fallback');
        }

        // Fallback: abrir com parâmetros específicos
        let url;
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // URL direta para servidor de desenvolvimento
            url = 'http://localhost:8001/pro-questoes.html';
        } else {
            // Subdomínio para produção
            url = 'https://questoes.proconcursos.com.br/pro-questoes.html';
        }

        const params = new URLSearchParams();
        const slugify = (val) => typeof val === 'string'
            ? val.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            : val;
        if (meta.course) params.append('courses', slugify(meta.course));
        if (meta.module) params.append('modules', slugify(meta.module));
        if (meta.aula) params.append('aula', slugify(meta.aula));

        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('🌐 Abrindo URL específica do módulo:', url);
        window.open(url, '_blank');
    }

    normalizeCourseId(courseName) {
        return courseName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[áàâã]/g, 'a')
            .replace(/[éèê]/g, 'e')
            .replace(/[íìî]/g, 'i')
            .replace(/[óòôõ]/g, 'o')
            .replace(/[úùû]/g, 'u')
            .replace(/ç/g, 'c')
            .replace(/[^\w-]/g, '');
    }

    normalizeModuleId(moduleName) {
        return moduleName.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[áàâã]/g, 'a')
            .replace(/[éèê]/g, 'e')
            .replace(/[íìî]/g, 'i')
            .replace(/[óòôõ]/g, 'o')
            .replace(/[úùû]/g, 'u')
            .replace(/ç/g, 'c')
            .replace(/[^\w-]/g, '');
    }

    // === CARREGAMENTO DE CURSOS ===
    async loadUserCourses() {
        if (!this.userId) return;

        this.showLoading('Carregando seus cursos...');

        try {
            // Verifica cache primeiro
            if (this.coursesCache && this.isCacheValid(this.coursesCache.timestamp)) {
                console.log('📋 Usando cursos do cache');
                this.renderCourses(this.coursesCache.data);
                return;
            }

            const userDoc = await this.db.collection('users').doc(this.userId).get();

            if (userDoc.exists && userDoc.data().hasPersonalized) {
                const userData = userDoc.data();
                console.log('👤 Carregando cursos personalizados');

                // Nova estrutura com selectedModules
                if (userData.selectedModules?.length > 0) {
                    const courses = await this.loadSelectedModules(userData.selectedModules);
                    this.cacheCourses(courses);
                    this.renderCourses(courses);
                    console.log('✅ Cursos personalizados carregados em modo recolhido');
                }
                // Para usuários antigos, carrega todos os cursos
                else {
                    console.log('📚 Usuário sem personalização - carregando todos os cursos');
                    await this.loadAllCourses();
                }
            } else {
                console.log('📚 Carregando todos os cursos');
                await this.loadAllCourses();
            }

        } catch (error) {
            console.error('❌ Erro ao carregar cursos:', error);
            this.showError('Falha ao carregar cursos. Tente novamente.');
        }
    }

    async loadSelectedModules(selectedModules) {
        const coursesMap = new Map();

        for (const { courseId, moduleId } of selectedModules) {
            try {
                // Carregar dados do curso
                if (!coursesMap.has(courseId)) {
                    const courseDoc = await this.db.collection('courses').doc(courseId).get();
                    if (courseDoc.exists) {
                        coursesMap.set(courseId, {
                            id: courseId,
                            name: courseDoc.data().name,
                            order: courseDoc.data().order || 0,
                            modules: []
                        });
                    }
                }

                // Carregar dados do módulo e suas aulas
                const moduleDoc = await this.db.collection('courses')
                    .doc(courseId).collection('modules').doc(moduleId).get();

                if (moduleDoc.exists) {
                    const moduleData = moduleDoc.data();
                    const course = coursesMap.get(courseId);

                    // Carregar todas as aulas do módulo de forma unificada
                    const aulas = await this.loadAulasFromModule(courseId, moduleId);

                    // Adiciona módulo com suas aulas
                    if (aulas.length > 0) {
                        course.modules.push({
                            id: moduleId,
                            name: moduleData.name,
                            order: moduleData.order || 0,
                            aulas: aulas,
                            type: 'aulas'
                        });
                    }
                }
            } catch (error) {
                console.warn(`⚠️ Erro ao carregar módulo ${moduleId}:`, error);
            }
        }

        return Array.from(coursesMap.values())
            .filter(course => course.modules.length > 0)
            .sort((a, b) => a.order - b.order);
    }

    async loadAllCourses() {
        this.showLoading('Carregando todos os cursos...');

        try {
            const coursesSnapshot = await this.db.collection('courses')
                .orderBy('order').get();

            const courses = [];

            for (const courseDoc of coursesSnapshot.docs) {
                const courseData = courseDoc.data();
                const modulesSnapshot = await courseDoc.ref
                    .collection('modules').orderBy('order').get();

                const modules = [];

                for (const moduleDoc of modulesSnapshot.docs) {
                    const moduleData = moduleDoc.data();

                    // Carregar todas as aulas do módulo de forma unificada
                    const aulas = await this.loadAulasFromModule(courseDoc.id, moduleDoc.id);

                    // Adiciona módulo com suas aulas
                    if (aulas.length > 0) {
                        modules.push({
                            id: moduleDoc.id,
                            name: moduleData.name,
                            order: moduleData.order || 0,
                            aulas: aulas,
                            type: 'aulas'
                        });
                    }
                }

                if (modules.length > 0) {
                    courses.push({
                        id: courseDoc.id,
                        name: courseData.name,
                        order: courseData.order || 0,
                        modules
                    });
                }
            }

            this.cacheCourses(courses);
            this.renderCourses(courses);
            this.showNotification('Todos os cursos carregados', 'success');

        } catch (error) {
            console.error('❌ Erro ao carregar todos os cursos:', error);
            this.showError('Falha ao carregar cursos');
        }
    }

    // === NOVA FUNÇÃO UNIFICADA PARA CARREGAR AULAS ===
    async loadAulasFromModule(courseId, moduleId) {
        try {
            const aulasSnapshot = await this.db.collection('courses')
                .doc(courseId).collection('modules').doc(moduleId)
                .collection('aulas').orderBy('order').get();

            const aulas = [];
            aulasSnapshot.forEach(aulaDoc => {
                const aulaData = aulaDoc.data();
                aulas.push({
                    id: aulaDoc.id,
                    name: aulaData.name,
                    order: aulaData.order || 0,
                    content_url: aulaData.content_url,
                    file_name: aulaData.file_name,
                    estimated_time: aulaData.estimated_time,
                    difficulty: aulaData.difficulty
                });
            });

            return aulas.sort((a, b) => a.order - b.order);
        } catch (error) {
            console.warn(`⚠️ Erro ao carregar aulas do módulo ${moduleId}:`, error);
            return [];
        }
    }

    // === RENDERIZAÇÃO ===
    renderCourses(courses) {
        if (!courses || courses.length === 0) {
            this.showEmptyState();
            return;
        }

        this.loadedCourses = courses;

        const html = courses.map(course => {
            const courseName = this.escapeHtml(course.name);
            const courseId = this.escapeHtml(course.id);

            return `
                <div class="course-item">
                    <div class="course-header" data-course-id="${courseId}">
                        <div class="course-icon">${this.getCourseIcon(course.name)}</div>
                        <span class="course-name">${courseName}</span>
                        <span class="toggle-icon">▶</span>
                    </div>
                    <div class="module-list" id="modules-${courseId}">
                        ${course.modules.map(module => {
                            const moduleName = this.escapeHtml(module.name);
                            const moduleId = this.escapeHtml(module.id);

                            return `
                                <div class="module-item"
                                     data-course-id="${courseId}"
                                     data-module-id="${moduleId}"
                                     data-type="${this.escapeHtml(module.type)}">
                                    <div class="module-header">
                                        <span class="module-name">${moduleName}</span>
                                        <span class="module-meta">(${module.aulas ? module.aulas.length : 0} aulas)</span>
                                        <span class="module-toggle">▶</span>
                                    </div>
                                    <div class="aulas-list" style="display: none;">
                                        ${module.aulas ? module.aulas.map(aula => {
                                            const aulaName = this.escapeHtml(aula.name);
                                            const aulaId = this.escapeHtml(aula.id);
                                            const estimatedTime = aula.estimated_time ?
                                                this.escapeHtml(aula.estimated_time.toString()) : '';

                                            return `
                                                <div class="aula-item"
                                                     data-course-id="${courseId}"
                                                     data-module-id="${moduleId}"
                                                     data-aula-id="${aulaId}">
                                                    ${aulaName}
                                                    <span class="aula-meta">${estimatedTime ? estimatedTime + 'min' : ''}</span>
                                                </div>
                                            `;
                                        }).join('') : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');

        this.elements.courseNav.innerHTML = html;
        this.attachCourseEvents();

        // Auto-seleciona primeiro conteúdo SEM expandir menu
        this.autoSelectFirstContent();

        // Atualizar indicador de scroll após renderizar
        setTimeout(() => this.updateScrollIndicator(), 200);

        console.log(`✅ ${courses.length} cursos renderizados em modo recolhido`);
    }

    attachCourseEvents() {
        // Course headers (toggle) - SEMPRE começa recolhido
        this.elements.courseNav.querySelectorAll('.course-header').forEach(header => {
            header.addEventListener('click', () => {
                const moduleList = header.nextElementSibling;
                const toggleIcon = header.querySelector('.toggle-icon');
                const isVisible = moduleList.classList.contains('visible');

                // Toggle visibilidade dos módulos
                moduleList.classList.toggle('visible', !isVisible);
                toggleIcon.classList.toggle('expanded', !isVisible);
                toggleIcon.textContent = isVisible ? '▶' : '▼';

                // Atualizar indicador de scroll após expandir/recolher
                setTimeout(() => this.updateScrollIndicator(), 100);
            });
        });

        // Module items (toggle aulas) - SEMPRE começa recolhido
        this.elements.courseNav.querySelectorAll('.module-item').forEach(item => {
            const moduleHeader = item.querySelector('.module-header');
            const aulasList = item.querySelector('.aulas-list');
            const toggleIcon = item.querySelector('.module-toggle');

            moduleHeader.addEventListener('click', (e) => {
                e.stopPropagation();

                // Toggle lista de aulas
                const isVisible = aulasList.style.display !== 'none';
                aulasList.style.display = isVisible ? 'none' : 'block';
                toggleIcon.classList.toggle('expanded', !isVisible);
                toggleIcon.textContent = isVisible ? '▶' : '▼';

                // Atualizar indicador de scroll após expandir/recolher
                setTimeout(() => this.updateScrollIndicator(), 100);
            });
        });

        // Aula items (load content)
        this.elements.courseNav.querySelectorAll('.aula-item').forEach(item => {
            item.addEventListener('click', () => {
                // Remove seleção anterior
                this.elements.courseNav.querySelectorAll('.aula-item.active')
                    .forEach(el => el.classList.remove('active'));

                // Marca como ativo
                item.classList.add('active');

                // Carrega conteúdo da aula
                const { courseId, moduleId, aulaId } = item.dataset;
                this.loadAulaContent(courseId, moduleId, aulaId);
            });
        });
    }

    autoSelectFirstContent() {
        if (this.loadedCourses.length > 0 && this.loadedCourses[0].modules.length > 0) {
            const firstCourse = this.loadedCourses[0];
            const firstModule = firstCourse.modules[0];
            const firstAula = firstModule.aulas?.[0];

            // SEMPRE mantém menu recolhido - usuário deve clicar para expandir
            // Apenas seleciona primeira aula sem expandir nada
            setTimeout(() => {
                const firstAulaItem = this.elements.courseNav.querySelector('.aula-item');

                if (firstAulaItem && firstAula) {
                    // Seleciona primeira aula sem expandir curso/módulo
                    firstAulaItem.classList.add('active');
                    this.loadAulaContent(firstCourse.id, firstModule.id, firstAula.id);
                }
            }, 100);
        }
    }

    // === CARREGAMENTO DE CONTEÚDO DE AULAS ===
    async loadAulaContent(courseId, moduleId, aulaId) {
        try {
            const cacheKey = `${courseId}-${moduleId}-${aulaId}`;

            // Verifica cache primeiro
            if (this.contentCache.has(cacheKey)) {
                const cached = this.contentCache.get(cacheKey);
                if (this.isCacheValid(cached.timestamp)) {
                    console.log('📋 Usando conteúdo do cache');
                    this.displayContent(cached.data);
                    return;
                }
            }

            this.showContentLoading();

            const course = this.loadedCourses.find(c => c.id === courseId);
            const module = course?.modules.find(m => m.id === moduleId);
            const aula = module?.aulas.find(a => a.id === aulaId);

            if (!aula) {
                throw new Error('Aula não encontrada');
            }

            const contentData = {
                title: aula.name,
                content: await this.fetchHTMLContent(aula.content_url),
                meta: {
                    course: course.name,
                    module: module.name,
                    aula: aula.name,
                    difficulty: aula.difficulty,
                    estimatedTime: aula.estimated_time
                }
            };

            // Cache do conteúdo
            this.contentCache.set(cacheKey, {
                data: contentData,
                timestamp: Date.now()
            });

            this.displayContent(contentData);

        } catch (error) {
            console.error('❌ Erro ao carregar conteúdo da aula:', error);
            this.showContentError(error.message);
        }
    }

    // === SANITIZAÇÃO MELHORADA DE HTML ===
    async fetchHTMLContent(contentUrl) {
        try {
            console.log('🔗 Carregando conteúdo de:', contentUrl);
            let url = contentUrl;

            // Se é referência do Firebase Storage
            if (url.startsWith('gs://')) {
                try {
                    const storageRef = this.storage.refFromURL(url);
                    url = await storageRef.getDownloadURL();
                    console.log('✅ URL do Firebase Storage obtida:', url);
                } catch (storageError) {
                    console.warn('⚠️ Erro ao obter URL do Storage:', storageError.message);
                    console.warn('🔄 Tentando construir URL pública...');

                    // Fallback mais robusto para URL pública
                    const gsPath = url.replace('gs://', '').split('/');
                    const bucketName = gsPath[0];
                    const filePath = gsPath.slice(1).join('/');
                    const encodedPath = encodeURIComponent(filePath);

                    url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
                    console.log('🔄 URL pública construída:', url);
                }
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            let rawHtml = await response.text();

            // === SANITIZAÇÃO ROBUSTA DO CONTEÚDO HTML ===
            return this.sanitizeHTML(rawHtml);

        } catch (error) {
            console.error('❌ Erro ao buscar conteúdo HTML:', error);
            throw new Error('Falha ao carregar conteúdo: ' + error.message);
        }
    }

    sanitizeHTML(rawHtml) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtml;

        // Remove elementos perigosos (MODIFICADO PARA PRESERVAR MERMAID)
        const dangerousElements = [
            'iframe', 'object', 'embed',
            'form', 'input', 'button', 'textarea', 'select',
            'applet', 'audio', 'video', 'source', 'track'
        ];

        // PRESERVAR: script, style (necessários para Mermaid)

        dangerousElements.forEach(tag => {
            tempDiv.querySelectorAll(tag).forEach(el => el.remove());
        });

        // Tratamento especial para scripts (preservar Mermaid)
        tempDiv.querySelectorAll('script').forEach(script => {
            // Preservar scripts Mermaid
            if (script.src && script.src.includes('mermaid')) {
                console.log('✅ Preservando script Mermaid:', script.src);
                return; // Manter script Mermaid
            }
            if (script.textContent && script.textContent.includes('mermaid')) {
                console.log('✅ Preservando script de inicialização Mermaid');
                return; // Manter script de inicialização Mermaid
            }
            // Remover outros scripts perigosos
            console.log('⚠️ Removendo script potencialmente perigoso');
            script.remove();
        });

        // Tratamento especial para estilos (preservar Mermaid)
        tempDiv.querySelectorAll('style').forEach(style => {
            // Preservar estilos Mermaid
            if (style.textContent && style.textContent.includes('mermaid')) {
                console.log('✅ Preservando estilos Mermaid');
                return; // Manter estilos Mermaid
            }
            // Preservar estilos de tabelas e gráficos
            if (style.textContent && (
                style.textContent.includes('table') ||
                style.textContent.includes('chart') ||
                style.textContent.includes('graph') ||
                style.textContent.includes('mermaid-container')
            )) {
                console.log('✅ Preservando estilos de tabelas/gráficos');
                return; // Manter estilos necessários
            }
            // Remover outros estilos potencialmente perigosos
            console.log('⚠️ Removendo estilo potencialmente perigoso');
            style.remove();
        });

        // Remove tags <html> e <body> (caso existam)
        tempDiv.querySelectorAll('html, body').forEach(el => {
            while (el.firstChild) tempDiv.appendChild(el.firstChild);
            el.remove();
        });

        // Remove atributos perigosos
        const dangerousAttributes = [
            'onclick', 'onload', 'onerror', 'onmouseover',
            'onfocus', 'onblur', 'onchange', 'onsubmit'
        ];

        tempDiv.querySelectorAll('*').forEach(el => {
            dangerousAttributes.forEach(attr => {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });

            // Sanitiza links externos
            if (el.tagName === 'A' && el.href) {
                if (!el.href.startsWith(window.location.origin)) {
                    el.setAttribute('target', '_blank');
                    el.setAttribute('rel', 'noopener noreferrer');
                }
            }
        });

        // Remove estilos inline perigosos (MELHORADO PARA MERMAID)
        tempDiv.querySelectorAll('[style]').forEach(el => {
            // Preservar elementos Mermaid e relacionados
            if (el.classList.contains('mermaid') ||
                el.classList.contains('mermaid-container') ||
                el.classList.contains('mermaid-graph') ||
                el.classList.contains('mermaid-source') ||
                el.closest('.mermaid-container')) {
                console.log('✅ Preservando estilos de elemento Mermaid');
                return; // Manter todos os estilos para elementos Mermaid
            }

            // Estilos potencialmente perigosos que podem quebrar o layout do container
            const dangerousStyles = ['position', 'z-index'];

            // Remove apenas estilos que podem quebrar o container principal
            dangerousStyles.forEach(style => {
                const styleValue = el.style.getPropertyValue(style);
                if (styleValue === 'fixed' || styleValue === 'absolute' ||
                    (style === 'z-index' && parseInt(styleValue) > 9998)) {
                    el.style.removeProperty(style);
                }
            });

            // Remove viewport units perigosos (exceto para elementos Mermaid)
            if (el.style.height && el.style.height.includes('vh')) {
                el.style.removeProperty('height');
            }
            if (el.style.width && el.style.width.includes('vw')) {
                el.style.removeProperty('width');
            }

            // Preserva estilos necessários para tabelas, cards, grids, etc.
            // Não remove: width, height, margin, padding, display, flex, grid, etc.
        });

        // Preservar elementos SVG gerados pelo Mermaid
        tempDiv.querySelectorAll('svg').forEach(svg => {
            if (svg.closest('.mermaid-container') ||
                svg.getAttribute('data-processed') === 'true' ||
                svg.classList.contains('mermaid')) {
                console.log('✅ Preservando SVG do Mermaid');
                // Garantir que o SVG tenha os atributos necessários
                if (!svg.hasAttribute('data-processed')) {
                    svg.setAttribute('data-processed', 'true');
                }
            }
        });

        console.log('✅ Conteúdo sanitizado carregado com sucesso (Mermaid preservado)');
        return tempDiv.innerHTML;
    }

    displayContent(contentData) {
        this.currentContent = contentData;

        // Atualiza corpo do conteúdo
        const lessonContentDiv = document.createElement('div');
        lessonContentDiv.className = 'lesson-content';
        lessonContentDiv.innerHTML = contentData.content; // Já sanitizado

        this.elements.contentBody.innerHTML = '';
        this.elements.contentBody.appendChild(lessonContentDiv);

        // Scroll para o topo
        this.elements.contentBody.scrollTop = 0;

        // Processar gráficos Mermaid após carregar conteúdo
        this.processMermaidGraphs();

        // Atualizar botão dinâmico de questões
        this.updateDynamicQuestoesButton(contentData.meta);

        console.log('✅ Conteúdo exibido:', contentData.title);
    }

    // === ESTADOS DE UI ===
    showLoading(message = 'Carregando...') {
        this.elements.courseNav.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
    }

    showContentLoading() {
        this.elements.contentBody.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Carregando conteúdo...</p>
            </div>
        `;
    }

    showEmptyState() {
        this.elements.courseNav.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <h3>Nenhum curso encontrado</h3>
                <p>Configure sua personalização ou use "Todos os Cursos".</p>
            </div>
        `;
    }

    showError(message) {
        this.elements.courseNav.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Erro</h3>
                <p>${this.escapeHtml(message)}</p>
                <button onclick="location.reload()"
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--error-color); color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }

    showContentError(message) {
        this.elements.contentBody.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">⚠️</div>
                <h3>Erro ao carregar conteúdo</h3>
                <p>${this.escapeHtml(message)}</p>
                <p style="font-size: 0.9em; margin-top: 1rem; opacity: 0.8;">
                    Verifique sua conexão e tente novamente.
                </p>
            </div>
        `;
    }

    // === NOTIFICAÇÕES ===
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Anima entrada
        setTimeout(() => notification.classList.add('show'), 100);

        // Remove após 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // === UTILITÁRIOS ===
    getCourseIcon(courseName) {
        const name = courseName.toLowerCase();
        if (name.includes('direito')) return '⚖️';
        if (name.includes('matemática') || name.includes('matematica')) return '🔢';
        if (name.includes('português') || name.includes('portugues')) return '📝';
        if (name.includes('informática') || name.includes('informatica')) return '💻';
        if (name.includes('contabilidade')) return '📊';
        if (name.includes('administração') || name.includes('administracao')) return '🏛️';
        return '📚';
    }

    cacheCourses(courses) {
        this.coursesCache = {
            data: courses,
            timestamp: Date.now()
        };
    }

    isCacheValid(timestamp) {
        return (Date.now() - timestamp) < this.cacheTTL;
    }

    // === FUNÇÃO DE ESCAPE HTML PARA SEGURANÇA ===
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // === API PÚBLICA ===
    clearCache() {
        this.contentCache.clear();
        this.coursesCache = null;
        this.showNotification('Cache limpo', 'success');
    }

    refresh() {
        this.clearCache();
        this.loadUserCourses();
    }

    // === PROCESSAMENTO DE GRÁFICOS MERMAID ===
    reprocessMermaidForTheme() {
        // Reprocessar gráficos Mermaid existentes quando o tema muda
        const existingGraphs = document.querySelectorAll('.mermaid-graph[id^="mermaid-graph-"]');
        if (existingGraphs.length > 0) {
            console.log(`🎨 Reprocessando ${existingGraphs.length} gráficos Mermaid para novo tema`);
            setTimeout(() => this.processMermaidGraphs(), 100);
        }
    }

    processMermaidGraphs() {
        if (typeof mermaid === 'undefined') {
            console.warn('❌ Mermaid.js não carregado');
            return;
        }

        // Configurar Mermaid com melhor contraste e tratamento de erros
        const isDarkMode = document.body.classList.contains('dark-mode');
        mermaid.initialize({
            startOnLoad: false,
            theme: isDarkMode ? 'dark' : 'default',
            themeCSS: isDarkMode ? `
                .node rect, .node circle, .node ellipse, .node polygon {
                    fill: #2d3748 !important;
                    stroke: #4a90e2 !important;
                    stroke-width: 2px !important;
                }
                .node .label, .nodeLabel {
                    color: #ffffff !important;
                    font-weight: 500 !important;
                }
                .edgePath .path {
                    stroke: #4a90e2 !important;
                    stroke-width: 2px !important;
                }
                .edgeLabel {
                    background-color: #2d3748 !important;
                    color: #ffffff !important;
                    border: 1px solid #4a90e2 !important;
                }
                .cluster rect {
                    fill: #1a202c !important;
                    stroke: #4a90e2 !important;
                }
                .cluster .label {
                    color: #ffffff !important;
                }
            ` : `
                .node rect, .node circle, .node ellipse, .node polygon {
                    fill: #ffffff !important;
                    stroke: #4a90e2 !important;
                    stroke-width: 2px !important;
                }
                .node .label, .nodeLabel {
                    color: #2d3748 !important;
                    font-weight: 500 !important;
                }
                .edgePath .path {
                    stroke: #4a90e2 !important;
                    stroke-width: 2px !important;
                }
                .edgeLabel {
                    background-color: #ffffff !important;
                    color: #2d3748 !important;
                    border: 1px solid #4a90e2 !important;
                }
            `,
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            securityLevel: 'loose',
            suppressErrorRendering: false,
            logLevel: 0,
            er: { useMaxWidth: true },
            sequence: { useMaxWidth: true },
            gantt: { useMaxWidth: true },
            journey: { useMaxWidth: true },
            pie: { useMaxWidth: true }
        });

        // Detectar blocos de código com gráficos Mermaid
        const codeBlocks = this.elements.contentBody.querySelectorAll('pre code, .codehilite pre code, .highlight pre code');
        let mermaidCounter = 0;

        codeBlocks.forEach((codeElement, index) => {
            const codeText = this.extractTextFromCode(codeElement);

            // Verificar se é um gráfico Mermaid
            if (this.isMermaidGraph(codeText)) {
                mermaidCounter++;
                const mermaidId = `mermaid-graph-${mermaidCounter}`;

                console.log(`🎨 Renderizando gráfico Mermaid ${mermaidCounter}:`, codeText.substring(0, 50) + '...');

                // Criar container para o gráfico
                const graphContainer = document.createElement('div');
                graphContainer.className = 'mermaid-container';
                graphContainer.innerHTML = `
                    <div class="mermaid-header">
                        <h4>📊 Gráfico Interativo</h4>
                        <div class="mermaid-controls">
                            <button class="mermaid-btn" onclick="this.closest('.mermaid-container').querySelector('.mermaid-source').style.display =
                                this.closest('.mermaid-container').querySelector('.mermaid-source').style.display === 'none' ? 'block' : 'none'">
                                Ver Código
                            </button>
                            <a class="mermaid-btn" href="https://mermaid.live/edit#${btoa(codeText)}" target="_blank">Editar Online</a>
                        </div>
                    </div>
                    <div class="mermaid-graph" id="${mermaidId}">${codeText}</div>
                    <div class="mermaid-source" style="display: none;">
                        <pre><code>${this.escapeHtml(codeText)}</code></pre>
                    </div>
                `;

                // Substituir o bloco de código original
                const preElement = codeElement.closest('pre') || codeElement.closest('.codehilite') || codeElement.closest('.highlight');
                if (preElement) {
                    preElement.parentNode.replaceChild(graphContainer, preElement);

                    // Renderizar o gráfico Mermaid com tratamento melhorado
                    setTimeout(() => {
                        // NOVA ABORDAGEM: Processamento mais cuidadoso
                        let preparedCode = codeText;

                        // Limpeza e normalização do código Mermaid
                        preparedCode = preparedCode
                            .replace(/<[^>]*>/g, '') // Remove HTML tags
                            .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&')
                            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
                            .replace(/\r\n/g, '\n').replace(/\r/g, '\n') // Normalizar quebras
                            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove caracteres de controle
                            .split('\n').map(line => line.trimRight()).join('\n').trim(); // Limpar espaços

                        // Debug apenas se necessário
                        if (preparedCode.length < 50) {
                            console.warn(`⚠️ Código Mermaid ${mermaidCounter} parece truncado (${preparedCode.length} chars):`, preparedCode);
                        }

                        mermaid.render(mermaidId + '-svg', preparedCode)
                            .then(({ svg }) => {
                                const graphElement = document.getElementById(mermaidId);
                                if (graphElement) {
                                    graphElement.innerHTML = svg;
                                    console.log(`✅ Gráfico Mermaid ${mermaidCounter} renderizado com sucesso`);
                                }
                            })
                            .catch(error => {
                                console.error(`❌ Erro ao renderizar gráfico Mermaid ${mermaidCounter}:`, error);
                                const graphElement = document.getElementById(mermaidId);
                                if (graphElement) {
                                    graphElement.innerHTML = `
                                        <div class="mermaid-error">
                                            <p>❌ Erro ao renderizar gráfico</p>
                                            <details>
                                                <summary>Ver detalhes</summary>
                                                <pre>${this.escapeHtml(error.toString())}</pre>
                                            </details>
                                        </div>
                                    `;
                                }
                            });
                    }, 100 * mermaidCounter); // Delay escalonado para evitar conflitos
                }
            }
        });

        // NOVO: Renderizar elementos Mermaid já existentes (gerados por Apps 9/13)
        const existingMermaidElems = this.elements.contentBody.querySelectorAll('.mermaid-container .mermaid, .mermaid');
        existingMermaidElems.forEach((elem) => {
            // Ignorar se já houver SVG renderizado
            if (elem.querySelector('svg')) return;

            // Obter código Mermaid do próprio elemento
            let codeText = '';
            const extractText = (node) => {
                let result = '';
                for (const child of node.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        result += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        if (child.tagName === 'BR') {
                            result += '\n';
                        } else {
                            result += extractText(child);
                        }
                    }
                }
                return result;
            };
            codeText = extractText(elem).replace(/\r\n/g, '\n').replace(/\r/g, '\n')
                .split('\n').map(l => l.trimRight()).join('\n').trim();

            if (!this.isMermaidGraph(codeText)) return;

            mermaidCounter++;
            const mermaidId = `mermaid-graph-${mermaidCounter}`;

            // Limpeza mínima antes do render
            let preparedCode = codeText
                .replace(/<[^>]*>/g, '')
                .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
                .replace(/&nbsp;/g, ' ')
                .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
                .split('\n').map(line => line.trimRight()).join('\n').trim();

            // Renderizar no próprio elemento
            try {
                mermaid.render(mermaidId + '-svg', preparedCode)
                    .then(({ svg }) => {
                        elem.innerHTML = svg;
                        // Marcar como processado
                        elem.setAttribute('data-processed', 'true');
                        console.log(`✅ Gráfico Mermaid existente renderizado (${mermaidId})`);
                    })
                    .catch((error) => {
                        console.warn('⚠️ Falha ao renderizar Mermaid existente:', error);
                    });
            } catch (e) {
                console.warn('⚠️ Erro inesperado ao renderizar Mermaid existente:', e);
            }
        });

        if (mermaidCounter > 0) {
            console.log(`✅ ${mermaidCounter} gráfico(s) Mermaid processado(s)`);
        } else {
            console.log('ℹ️ Nenhum gráfico Mermaid encontrado');
        }
    }

    extractTextFromCode(codeElement) {
        // SOLUÇÃO MELHORADA: Extrair texto completo sem truncamento
        let text = '';

        // Método 1: Tentar extrair o texto original completo
        if (codeElement.dataset && codeElement.dataset.originalText) {
            text = codeElement.dataset.originalText;
        } else {
            // Método 2: Extrair texto recursivamente preservando conteúdo
            const extractRecursively = (node) => {
                let result = '';
                for (const child of node.childNodes) {
                    if (child.nodeType === Node.TEXT_NODE) {
                        result += child.textContent;
                    } else if (child.nodeType === Node.ELEMENT_NODE) {
                        if (child.tagName === 'BR') {
                            result += '\n';
                        } else {
                            result += extractRecursively(child);
                        }
                    }
                }
                return result;
            };

            text = extractRecursively(codeElement);

            // Fallback: usar textContent/innerText se não conseguiu extrair
            if (!text || text.length < 10) {
                text = codeElement.textContent || codeElement.innerText || '';
            }
        }

        // Limpeza básica preservando o conteúdo completo
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        // NÃO remover linhas vazias - podem ser importantes para sintaxe Mermaid
        text = text.split('\n')
            .map(line => line.trimRight()) // Remove apenas espaços à direita
            .join('\n')
            .trim();

        return text;
    }

    isMermaidGraph(text) {
        // Detectar diferentes tipos de gráficos Mermaid
        const mermaidPatterns = [
            /graph\s+(TD|LR|BT|RL|TB)/i,
            /flowchart\s+(TD|LR|BT|RL|TB)/i,
            /sequenceDiagram/i,
            /classDiagram/i,
            /stateDiagram/i,
            /erDiagram/i,
            /journey/i,
            /gantt/i,
            /pie/i,
            /gitgraph/i,
            /mindmap/i,
            /timeline/i
        ];

        return mermaidPatterns.some(pattern => pattern.test(text));
    }
}

// === INICIALIZAÇÃO GLOBAL ===
let studyApp;

// Configurar API básica imediatamente para o header
window.studyApp = {
    toggleSidebar: () => {
        console.log('toggleSidebar chamado via header (early)');
        if (studyApp && studyApp.toggleSidebar) {
            return studyApp.toggleSidebar();
        } else {
            console.warn('studyApp.toggleSidebar não disponível ainda');
        }
    },
    loadAllCourses: () => {
        console.log('loadAllCourses chamado via header (early)');
        if (studyApp && studyApp.loadAllCourses) {
            return studyApp.loadAllCourses();
        } else {
            console.warn('studyApp.loadAllCourses não disponível ainda');
        }
    },
    showNotification: (message, type) => {
        console.log('showNotification chamado via header (early):', message, type);
        if (studyApp && studyApp.showNotification) {
            return studyApp.showNotification(message, type);
        } else {
            console.log('Notificação (fallback):', message);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('StudyApp DOM carregado');
    studyApp = new StudyRoomApp();

    // Atualizar métodos com referência real
    window.studyApp.toggleSidebar = () => {
        console.log('toggleSidebar chamado via header');
        return studyApp.toggleSidebar();
    };
    window.studyApp.loadAllCourses = () => {
        console.log('loadAllCourses chamado via header');
        return studyApp.loadAllCourses();
    };
    window.studyApp.showNotification = (message, type) => {
        console.log('showNotification chamado via header:', message, type);
        return studyApp.showNotification(message, type);
    };

    console.log('window.studyApp atualizado com referências reais');

    // Expor para debug em desenvolvimento
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.studyApp.debug = studyApp;
    }
});

// Service Worker para cache offline
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('✅ Service Worker registrado'))
            .catch(error => {
                // Service Worker não crítico - aplicação funciona sem ele
                if (console.debug) console.debug('Service Worker não disponível:', error.message);
            });
    });
}

// Suprimir erros comuns de extensões do navegador
window.addEventListener('error', (e) => {
    if (e.message.includes('message channel closed') ||
        e.message.includes('asynchronous response')) {
        e.preventDefault();
        return false;
    }
});