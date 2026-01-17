        'use strict';

        // === COMPORTAMENTO DO MENU ===
        // O menu de cursos, mÃ³dulos e aulas SEMPRE Ã© apresentado no estado RECOLHIDO
        // Independentemente da Ãºltima visualizaÃ§Ã£o do usuÃ¡rio, ele deve clicar para expandir:
        // 1. Clique no curso para ver os mÃ³dulos
        // 2. Clique no mÃ³dulo para ver as aulas
        // 3. Clique na aula para carregar o conteÃºdo
        // 
        // O indicador de scroll (â†“) aparece quando hÃ¡ mais conteÃºdo abaixo no menu

        // === CONFIGURAÃ‡ÃƒO E INICIALIZAÃ‡ÃƒO ===
        // Importar DOMPurify para sanitização XSS
        let DOMPurify = null;
        try {
            // Tentar importar DOMPurify se disponível
            if (typeof window !== 'undefined' && window.DOMPurify) {
                DOMPurify = window.DOMPurify;
            }
        } catch (e) {
            console.warn('DOMPurify não disponível, usando sanitização básica');
        }

        class StudyRoomApp {
            constructor() {
                this.isInitialized = false;
                this.userId = null;
                this.db = null;
                this.storage = null;
                this.auth = null;
                
                // Cache para otimizaÃ§Ã£o
                this.contentCache = new Map();
                this.coursesCache = null;
                this.cacheTTL = 5 * 60 * 1000; // 5 minutos
                
                // Estado da aplicaÃ§Ã£o
                this.sidebarCollapsed = false;
                this.currentContent = null;
                this.loadedCourses = [];
                
                // Elementos DOM
                this.elements = {};
                
                // Configuração do Firebase - Credenciais isoladas para segurança
                this.firebaseConfig = this.loadFirebaseConfig();

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
                    
                    // Configura indicador de scroll apÃ³s elementos estarem prontos
                    this.setupScrollIndicator();
                    
                    // Aplica tema salvo
                    this.applyTheme();
                    
                    // Configura autenticaÃ§Ã£o
                    this.setupAuth();
                    
                    this.isInitialized = true;
                    // Verificar configuração do Firebase
                    this.verifyFirebaseConfig();

                    console.log('âœ… StudyRoomApp inicializado com sucesso');
                } catch (error) {
                    console.error('âŒ Erro na inicializaÃ§Ã£o:', error);
                    this.showNotification('Erro na inicializaÃ§Ã£o da aplicaÃ§Ã£o', 'error');
                }
            }

            async loadHeader() {
                try {
                    const response = await fetch('header_saladeestudos.html');
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const headerHTML = await response.text();
                    
                    // Criar um documento temporÃ¡rio para extrair apenas o header e estilos
                    const tempDoc = document.createElement('div');
                    tempDoc.innerHTML = headerHTML;
                    
                    // Extrair apenas o header principal e o painel pomodoro
                    const mainHeader = tempDoc.querySelector('#mainHeader');
                    const pomodoroPanel = tempDoc.querySelector('#pomodoroTimerPanel');
                    const headerStyles = tempDoc.querySelector('style');
                    
                    if (!mainHeader) {
                        throw new Error('Header principal nÃ£o encontrado no arquivo');
                    }
                    
                    const headerPlaceholder = document.getElementById('header-placeholder');
                    
                    // Limpar placeholder e remover botÃµes duplicados
                    headerPlaceholder.innerHTML = '';
                    
                    // Remover botÃµes duplicados que possam existir
                    const existingButtons = document.querySelectorAll('#showAllCoursesBtn, #themeToggleBtn, #pomodoro-btn');
                    existingButtons.forEach(btn => {
                        if (btn.parentNode) {
                            btn.parentNode.removeChild(btn);
                        }
                    });
                    
                    // Adicionar estilos ao head se nÃ£o existirem
                    if (headerStyles && !document.querySelector('style[data-header-styles]')) {
                        const styleElement = document.createElement('style');
                        styleElement.setAttribute('data-header-styles', 'true');
                        styleElement.textContent = headerStyles.textContent;
                        document.head.appendChild(styleElement);
                    }
                    
                    // Inserir header principal
                    headerPlaceholder.appendChild(mainHeader.cloneNode(true));
                    
                    // Inserir painel pomodoro (se existir)
                    if (pomodoroPanel) {
                        headerPlaceholder.appendChild(pomodoroPanel.cloneNode(true));
                    }
                    
                    // Scripts do header sÃ£o ignorados - botÃµes configurados manualmente
                    console.log('ðŸ“‹ Scripts do header ignorados para evitar conflitos');
                    
                    console.log('âœ… Header carregado com sucesso');
                    
                    // Aplicar tema imediatamente
                    this.applyThemeToHeader();
                    
                    // Inicializar eventos do header apÃ³s carregamento dinÃ¢mico
                    setTimeout(() => {
                        console.log('ðŸ”§ Configurando botÃµes do header manualmente...');
                        this.setupHeaderButtons();
                        console.log('âœ… BotÃµes do header configurados com sucesso');
                    }, 300);
                    
                } catch (error) {
                    console.warn('âš ï¸ Falha ao carregar header:', error);
                    // Fallback: criar header mÃ­nimo
                    this.createFallbackHeader();
                }
            }

            createFallbackHeader() {
                const headerPlaceholder = document.getElementById('header-placeholder'🌙'#sidebarToggleBtn');
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
                
                console.log('âœ… Header fallback criado');
            }

            setupHeaderButtons() {
                const headerPlaceholder = document.getElementById('header-placeholder');
                if (!headerPlaceholder) return;

                // BotÃ£o showAllCoursesBtn
                const showAllBtn = headerPlaceholder.querySelector('#showAllCoursesBtn');
                if (showAllBtn) {
                    showAllBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ Show All Courses clicked');
                        this.loadAllCourses();
                    };
                    console.log('âœ… showAllCoursesBtn configurado');
                } else {
                    console.warn('âŒ showAllCoursesBtn nÃ£o encontrado');
                }

                // BotÃ£o themeToggleBtn
                const themeBtn = headerPlaceholder.querySelector('#themeToggleBtn');
                if (themeBtn) {
                    themeBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ Theme Toggle clicked');
                        const body = document.body;
                        const isDark = body.classList.toggle('dark-mode');

                        // ForÃ§ar atualizaÃ§Ã£o das variÃ¡veis CSS do sidebar
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
                    };
                    console.log('âœ… themeToggleBtn configurado');
                } else {
                    console.warn('âŒ themeToggleBtn nÃ£o encontrado');
                }

                // BotÃ£o pomodoro-btn
                const pomodoroBtn = headerPlaceholder.querySelector('#pomodoro-btn');
                if (pomodoroBtn) {
                    pomodoroBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ Pomodoro clicked');
                        
                        const pomodoroPanel = headerPlaceholder.querySelector('#pomodoroTimerPanel');
                        if (pomodoroPanel) {
                            const isVisible = pomodoroPanel.style.display === 'flex';
                            pomodoroPanel.style.display = isVisible ? 'none' : 'flex';
                            console.log('ðŸ… Painel pomodoro', isVisible ? 'fechado' : 'aberto');
                        } else {
                            console.warn('âŒ Painel pomodoro nÃ£o encontrado');
                        }
                    };
                    console.log('âœ… pomodoro-btn configurado');
                } else {
                    console.warn('âŒ pomodoro-btn nÃ£o encontrado');
                }

                // BotÃ£o sidebarToggleBtn
                const sidebarBtn = headerPlaceholder.querySelector('#sidebarToggleBtn');
                if (sidebarBtn) {
                    sidebarBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ Sidebar Toggle clicked');
                        this.toggleSidebar();
                    };
                    console.log('âœ… sidebarToggleBtn configurado');
                } else {
                    console.warn('âŒ sidebarToggleBtn nÃ£o encontrado');
                }

                // BotÃ£o logout-btn
                const logoutBtn = headerPlaceholder.querySelector('#logout-btn');
                if (logoutBtn) {
                    logoutBtn.onclick = (e) => {
                        e.preventDefault();
                        console.log('ðŸ”§ Logout clicked');
                        localStorage.removeItem('masterAdmin');
                        if (this.auth) {
                            this.auth.signOut().then(() => {
                                window.location.href = 'index.html';
                            }).catch(err => {
                                console.error('Erro no logout:', err);
                                window.location.href = 'index.html';
                            });
                        } else {
                            window.location.href = 'index.html';
                        }
                    };
                    console.log('âœ… logout-btn configurado');
                }

                // === CONFIGURAÃ‡ÃƒO DOS MENUS DROPDOWN ===
                this.setupDropdownMenus(headerPlaceholder);
            }

            setupDropdownMenus(headerContainer) {
                console.log('ðŸ”§ Configurando menus dropdown...');
                
                if (!headerContainer) {
                    console.warn('âŒ Container do header nÃ£o fornecido');
                    return false;
                }

                // Configurar botÃ£o CURSOS
                const cursosBtn = headerContainer.querySelector('#cursosMenuBtn');
                const cursosMenu = headerContainer.querySelector('#cursos-menu');
                
                console.log('ðŸ” Elementos CURSOS:', {
                    button: cursosBtn ? 'Encontrado' : 'NÃ£o encontrado',
                    menu: cursosMenu ? 'Encontrado' : 'NÃ£o encontrado'
                });
                
                if (cursosBtn && cursosMenu) {
                    cursosBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ BotÃ£o CURSOS clicado - toggling menu');
                        this.toggleDropdownMenu(cursosMenu, cursosBtn);
                    };
                    console.log('âœ… Menu CURSOS configurado com sucesso');
                } else {
                    console.warn('âŒ Elementos do menu CURSOS nÃ£o encontrados');
                }

                // Configurar botÃ£o FLASHCARDS
                const flashcardsBtn = headerContainer.querySelector('#flashcardsMenuBtn');
                const flashcardsMenu = headerContainer.querySelector('#flashcards-menu');
                
                console.log('ðŸ” Elementos FLASHCARDS:', {
                    button: flashcardsBtn ? 'Encontrado' : 'NÃ£o encontrado',
                    menu: flashcardsMenu ? 'Encontrado' : 'NÃ£o encontrado'
                });
                
                if (flashcardsBtn && flashcardsMenu) {
                    flashcardsBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ BotÃ£o FLASHCARDS clicado - toggling menu');
                        this.toggleDropdownMenu(flashcardsMenu, flashcardsBtn);
                    };
                    console.log('âœ… Menu FLASHCARDS configurado com sucesso');
                } else {
                    console.warn('âŒ Elementos do menu FLASHCARDS nÃ£o encontrados');
                }

                // Configurar botÃ£o QUESTÃ•ES
                const questoesBtn = headerContainer.querySelector('#questoesMenuBtn');
                const questoesMenu = headerContainer.querySelector('#questoes-menu');

                console.log('ðŸ” Elementos QUESTÃ•ES:', {
                    button: questoesBtn ? 'Encontrado' : 'NÃ£o encontrado',
                    menu: questoesMenu ? 'Encontrado' : 'NÃ£o encontrado'
                });

                if (questoesBtn && questoesMenu) {
                    questoesBtn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('ðŸ”§ BotÃ£o QUESTÃ•ES clicado - toggling menu');
                        this.toggleDropdownMenu(questoesMenu, questoesBtn);
                    };
                    console.log('âœ… Menu QUESTÃ•ES configurado com sucesso');
                } else {
                    console.warn('âŒ Elementos do menu QUESTÃ•ES nÃ£o encontrados');
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
                    console.log('âœ… Handler de fechamento global configurado');
                }

                return true;
            }

            toggleDropdownMenu(menu, button) {
                console.log('ðŸ”„ Toggle menu:', menu.id);
                
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
                console.log('ðŸ“‚ Menu aberto:', menu.id);
            }

            closeDropdownMenu(menu) {
                menu.classList.remove('show');
                const button = document.querySelector(`[data-target="${menu.id}"]`);
                if (button) {
                    button.setAttribute('aria-expanded', 'false');
                }
                console.log('ðŸ“ Menu fechado:', menu.id);
            }

            applyThemeToHeader() {
                const savedTheme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

                // Aplicar tema ao body
                document.body.classList.toggle('dark-mode', isDark);

                // ForÃ§ar atualizaÃ§Ã£o das variÃ¡veis CSS para garantir que o sidebar seja atualizado
                if (isDark) {
                    document.documentElement.style.setProperty('--sidebar-bg', '#1a202c');
                    document.documentElement.style.setProperty('--sidebar-border', '#2d3748');
                } else {
                    document.documentElement.style.setProperty('--sidebar-bg', '#f8fafc');
                    document.documentElement.style.setProperty('--sidebar-border', '#e2e8f0');
                }

                // Atualizar Ã­cone do tema no header
                const headerPlaceholder = document.getElementById('header-placeholder');
                if (headerPlaceholder) {
                    const themeIcon = headerPlaceholder.querySelector('#themeIcon');
                    if (themeIcon) {
                        themeIcon.textContent = isDark ? '☀️' : '🌙';
                        console.log('âœ… Tema aplicado ao header:', isDark ? 'escuro' : 'claro');
                    }
                }
            }

            /**
             * Carrega configuração do Firebase de forma segura
             * APENAS variáveis de ambiente - NÃO usa credenciais hardcoded
             */
            loadFirebaseConfig() {
                // Carregar APENAS das variáveis de ambiente (produção/Netlify)
                const envConfig = {
                    apiKey: window.FIREBASE_API_KEY || process?.env?.FIREBASE_API_KEY,
                    authDomain: window.FIREBASE_AUTH_DOMAIN || process?.env?.FIREBASE_AUTH_DOMAIN,
                    projectId: window.FIREBASE_PROJECT_ID || process?.env?.FIREBASE_PROJECT_ID,
                    storageBucket: window.FIREBASE_STORAGE_BUCKET || process?.env?.FIREBASE_STORAGE_BUCKET,
                    messagingSenderId: window.FIREBASE_MESSAGING_SENDER_ID || process?.env?.FIREBASE_MESSAGING_SENDER_ID,
                    appId: window.FIREBASE_APP_ID || process?.env?.FIREBASE_APP_ID,
                    measurementId: window.FIREBASE_MEASUREMENT_ID || process?.env?.FIREBASE_MEASUREMENT_ID
                };

                // Verifica se todas as credenciais essenciais estão disponíveis via variáveis de ambiente
                const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
                const hasAllEnvCredentials = requiredFields.every(field => envConfig[field]);

                if (hasAllEnvCredentials) {
                    console.log('🔐 Firebase: Credenciais carregadas com sucesso das variáveis de ambiente');
                    return envConfig;
                }

                // NÃO há mais fallback hardcoded por questões de segurança
                console.error('❌ Firebase: Credenciais não encontradas!');
                console.error('Configure as seguintes variáveis de ambiente no Netlify:');
                console.error('- FIREBASE_API_KEY');
                console.error('- FIREBASE_AUTH_DOMAIN');
                console.error('- FIREBASE_PROJECT_ID');
                console.error('- FIREBASE_STORAGE_BUCKET');
                console.error('- FIREBASE_MESSAGING_SENDER_ID');
                console.error('- FIREBASE_APP_ID');
                console.error('- FIREBASE_MEASUREMENT_ID (opcional)');

                // Lança erro em vez de usar credenciais hardcoded
                throw new Error('Credenciais do Firebase não configuradas. Configure as variáveis de ambiente.');
            }

            /**
             * Verifica se a configuração do Firebase foi carregada corretamente
             */
            verifyFirebaseConfig() {
                const config = this.firebaseConfig;
                const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

                const missingFields = requiredFields.filter(field => !config[field]);

                if (missingFields.length > 0) {
                    console.error('❌ Firebase Config: Campos obrigatórios faltando:', missingFields);
                    this.showNotification('Erro de configuração do Firebase. Entre em contato com o suporte.', 'error');
                    return false;
                }

                // Todas as credenciais agora vêm de variáveis de ambiente
                console.log('✅ Firebase: Usando configuração baseada em variáveis de ambiente');

                console.log('✅ Firebase Config: Todas as credenciais carregadas corretamente');
                return true;
            }

            initFirebase() {
                if (!firebase.apps.length) {
                    firebase.initializeApp(this.firebaseConfig);
                }
                
                this.auth = firebase.auth();
                this.db = firebase.firestore();
                this.storage = firebase.storage();
                
                // ConfiguraÃ§Ãµes de performance com nova API
                try {
                    // Nova API recomendada (Firebase v9+) com merge para evitar override warning
                    this.db.settings({
                        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                    });
                    console.log('âœ… Firebase inicializado com persistÃªncia moderna');
                } catch (error) {
                    // Fallback para API antiga se a nova nÃ£o estiver disponÃ­vel
                    try {
                        this.db.enablePersistence({ synchronizeTabs: true });
                        console.log('âœ… Firebase inicializado com persistÃªncia legada');
                    } catch (persistenceError) {
                        // Modo silencioso - nÃ£o mostrar warning desnecessÃ¡rio
                        if (this.isDevelopment()) {
                            console.warn('PersistÃªncia offline nÃ£o disponÃ­vel:', persistenceError);
                        }
                        console.log('âœ… Firebase inicializado sem persistÃªncia');
                    }
                }
                
                console.log('âœ… Firebase inicializado');
            }

            // FunÃ§Ã£o auxiliar para detectar ambiente de desenvolvimento
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
                
                // Event listener para Ã­cone expandido (Ã  direita)
                if (sidebarIconExpanded) {
                    sidebarIconExpanded.addEventListener('click', () => {
                        console.log('ðŸ“š Sidebar icon expandido clicado - recolhendo menu lateral');
                        this.toggleSidebar();
                    });
                    sidebarIconExpanded.title = 'Clique para recolher menu lateral';
                }
                
                // Event listener para Ã­cone recolhido (centralizado)
                if (sidebarIconCollapsed) {
                    sidebarIconCollapsed.addEventListener('click', () => {
                        console.log('ðŸ“š Sidebar icon recolhido clicado - expandindo menu lateral');
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
                
                // Configurar indicador de scroll para a sidebar (serÃ¡ chamado apÃ³s inicializaÃ§Ã£o)
                // this.setupScrollIndicator();
                
                console.log('âœ… Event listeners configurados');
            }

            setupAuth() {
                this.auth.onAuthStateChanged(async user => {
                    if (!user) {
                        // Verificar se Ã© o admin master simulado (via localStorage para persistÃªncia de sessÃ£o simulada)
                        const masterAdmin = localStorage.getItem('masterAdmin');
                        if (masterAdmin === 'true') {
                            this.userId = 'admin-master-id';
                            console.log('âœ… Administrador Mestre detectado via persistÃªncia local');
                            this.loadUserCourses();
                            return;
                        }
                        
                        console.log('âŒ UsuÃ¡rio nÃ£o autenticado, redirecionando...');
                        window.location.href = 'index.html';
                        return;
                    }
                    
                    this.userId = user.uid;
                    console.log('âœ… UsuÃ¡rio autenticado:', this.userId);
                    
                    // Se for o admin-master-id (simulado), pular verificaÃ§Ã£o de Firestore
                    if (this.userId === 'admin-master-id') {
                        console.log('âœ… Acesso concedido: Administrador Mestre');
                        localStorage.setItem('masterAdmin', 'true');
                        this.loadUserCourses();
                        return;
                    }
                    
                    // Carregar cursos após autenticação
                    console.log('âœ… Usuário autenticado, carregando cursos...');
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
                    // HÃ¡ conteÃºdo para scroll
                    if (nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 10) {
                        // PrÃ³ximo do final - oculta indicador
                        indicator.classList.remove('visible');
                    } else {
                        // Mostra indicador
                        indicator.classList.add('visible');
                    }
                } else {
                    // NÃ£o hÃ¡ scroll necessÃ¡rio - oculta indicador
                    indicator.classList.remove('visible');
                }
            }

            setupScrollIndicator() {
                if (!this.elements.scrollIndicator || !this.elements.courseNav) return;
                
                const checkScrollIndicator = () => {
                    const nav = this.elements.courseNav;
                    const indicator = this.elements.scrollIndicator;
                    
                    if (nav.scrollHeight > nav.clientHeight) {
                        // HÃ¡ conteÃºdo para scroll
                        if (nav.scrollTop + nav.clientHeight >= nav.scrollHeight - 10) {
                            // PrÃ³ximo do final - oculta indicador
                            indicator.classList.remove('visible');
                        } else {
                            // Mostra indicador
                            indicator.classList.add('visible');
                        }
                    } else {
                        // NÃ£o hÃ¡ scroll necessÃ¡rio - oculta indicador
                        indicator.classList.remove('visible');
                    }
                };
                
                // Verificar ao carregar conteÃºdo
                this.elements.courseNav.addEventListener('scroll', checkScrollIndicator);
                
                // Verificar inicialmente
                setTimeout(checkScrollIndicator, 100);
                
                console.log('âœ… Indicador de scroll configurado');
            }

            // === GERENCIAMENTO DE TEMA ===
            applyTheme() {
                // Restaura estado da sidebar
                const sidebarState = localStorage.getItem('sidebarCollapsed') === 'true';
                if (sidebarState && window.innerWidth > 768) {
                    this.sidebarCollapsed = true;
                    this.elements.sidebar.classList.add('collapsed');
                }

                // Aplicar tema salvo Ã s variÃ¡veis CSS do sidebar
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

            // === GERENCIAMENTO DO BOTÃƒO DINÃ‚MICO DE QUESTÃ•ES ===
            updateDynamicQuestoesButton(meta) {
                const button = document.getElementById('dynamic-questoes-btn');
                if (!button) return;

                if (meta && meta.course && meta.module) {
                    // Exibir botÃ£o quando houver contexto de aula
                    button.classList.add('visible');
                    button.title = `QuestÃµes: ${meta.course} > ${meta.module}`;
                    
                    // Remover event listener anterior
                    button.onclick = null;
                    
                    // Adicionar novo event listener
                    button.onclick = () => {
                        this.openQuestoesForCurrentModule(meta);
                    };
                    
                    console.log('âœ… BotÃ£o dinÃ¢mico ativado para:', meta.course, '>', meta.module);
                } else {
                    // Ocultar botÃ£o quando nÃ£o hÃ¡ contexto
                    button.classList.remove('visible');
                    button.onclick = null;
                    console.log('âšª BotÃ£o dinÃ¢mico oculto - sem contexto');
                }
            }

            openQuestoesForCurrentModule(meta) {
                console.log('ðŸŽ¯ Abrindo questÃµes para mÃ³dulo atual:', meta);
                
                try {
                    // Se a integraÃ§Ã£o estiver presente, usar contexto especÃ­fico
                    if (window.QuestoesIntegration && typeof window.QuestoesIntegration.openQuestions === 'function') {
                        console.log('ðŸ”— Usando integraÃ§Ã£o QuestoesIntegration com contexto especÃ­fico');
                        // Criar um contexto personalizado para a integraÃ§Ã£o
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
                    console.warn('IntegraÃ§Ã£o QuestoesIntegration indisponÃ­vel, usando fallback');
                }

                // Fallback: abrir com parÃ¢metros especÃ­ficos
                let url;
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    // URL direta para servidor de desenvolvimento
                    url = 'http://localhost:8001/pro-questoes.html';
                } else {
                    // SubdomÃ­nio para produÃ§Ã£o
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
                
                console.log('ðŸŒ Abrindo URL especÃ­fica do mÃ³dulo:', url);
                window.open(url, '_blank');
            }

            normalizeCourseId(courseName) {
                return courseName.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[Ã¡Ã Ã¢Ã£]/g, 'a')
                    .replace(/[Ã©Ã¨Ãª]/g, 'e')
                    .replace(/[Ã­Ã¬Ã®]/g, 'i')
                    .replace(/[Ã³Ã²Ã´Ãµ]/g, 'o')
                    .replace(/[ÃºÃ¹Ã»]/g, 'u')
                    .replace(/Ã§/g, 'c')
                    .replace(/[^\w-]/g, '');
            }

            normalizeModuleId(moduleName) {
                return moduleName.toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[Ã¡Ã Ã¢Ã£]/g, 'a')
                    .replace(/[Ã©Ã¨Ãª]/g, 'e')
                    .replace(/[Ã­Ã¬Ã®]/g, 'i')
                    .replace(/[Ã³Ã²Ã´Ãµ]/g, 'o')
                    .replace(/[ÃºÃ¹Ã»]/g, 'u')
                    .replace(/Ã§/g, 'c')
                    .replace(/[^\w-]/g, '');
            }

            // === CARREGAMENTO DE CURSOS ===
            async loadUserCourses() {
                if (!this.userId) return;
                
                this.showLoading('Carregando seus cursos...');
                
                try {
                    // Verifica cache primeiro
                    if (this.coursesCache && this.isCacheValid(this.coursesCache.timestamp)) {
                        console.log('ðŸ“‹ Usando cursos do cache');
                        this.renderCourses(this.coursesCache.data);
                        return;
                    }
                    
                    const userDoc = await this.db.collection('users').doc(this.userId).get();
                    
                    if (userDoc.exists && userDoc.data().hasPersonalized) {
                        const userData = userDoc.data();
                        console.log('ðŸ‘¤ Carregando cursos personalizados');
                        
                        // Nova estrutura com selectedModules
                        if (userData.selectedModules?.length > 0) {
                            const courses = await this.loadSelectedModules(userData.selectedModules);
                            this.cacheCourses(courses);
                            this.renderCourses(courses);
                            console.log('âœ… Cursos personalizados carregados em modo recolhido');
                        } 
                        // Para usuÃ¡rios antigos, carrega todos os cursos
                        else {
                            console.log('ðŸ“š UsuÃ¡rio sem personalizaÃ§Ã£o - carregando todos os cursos');
                            await this.loadAllCourses();
                        }
                    } else {
                        console.log('ðŸ“š Carregando todos os cursos');
                        await this.loadAllCourses();
                    }
                    
                } catch (error) {
                    console.error('âŒ Erro ao carregar cursos:', error);
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
                        
                        // Carregar dados do mÃ³dulo e suas aulas
                        const moduleDoc = await this.db.collection('courses')
                            .doc(courseId).collection('modules').doc(moduleId).get();
                            
                        if (moduleDoc.exists) {
                            const moduleData = moduleDoc.data();
                            const course = coursesMap.get(courseId);
                            
                            // Carregar todas as aulas do mÃ³dulo de forma unificada
                            const aulas = await this.loadAulasFromModule(courseId, moduleId);
                            
                            // Adiciona mÃ³dulo com suas aulas
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
                        console.warn(`âš ï¸ Erro ao carregar mÃ³dulo ${moduleId}:`, error);
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
                            
                            // Carregar todas as aulas do mÃ³dulo de forma unificada
                            const aulas = await this.loadAulasFromModule(courseDoc.id, moduleDoc.id);
                            
                            // Adiciona mÃ³dulo com suas aulas
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
                    console.error('âŒ Erro ao carregar todos os cursos:', error);
                    this.showError('Falha ao carregar cursos');
                }
            }

            // === NOVA FUNÃ‡ÃƒO UNIFICADA PARA CARREGAR AULAS ===
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
                    console.warn(`âš ï¸ Erro ao carregar aulas do mÃ³dulo ${moduleId}:`, error);
                    return [];
                }
            }

            // === RENDERIZAÃ‡ÃƒO === 
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
                                <span class="toggle-icon">â–¶</span>
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
                                                <span class="module-toggle">â–¶</span>
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
                
                // Auto-seleciona primeiro conteÃºdo SEM expandir menu
                this.autoSelectFirstContent();
                
                // Atualizar indicador de scroll apÃ³s renderizar
                setTimeout(() => this.updateScrollIndicator(), 200);
                
                console.log(`âœ… ${courses.length} cursos renderizados em modo recolhido`);
            }

            attachCourseEvents() {
                // Course headers (toggle) - SEMPRE comeÃ§a recolhido
                this.elements.courseNav.querySelectorAll('.course-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const moduleList = header.nextElementSibling;
                        const toggleIcon = header.querySelector('.toggle-icon');
                        const isVisible = moduleList.classList.contains('visible');
                        
                        // Toggle visibilidade dos mÃ³dulos
                        moduleList.classList.toggle('visible', !isVisible);
                        toggleIcon.classList.toggle('expanded', !isVisible);
                        toggleIcon.textContent = isVisible ? 'â–¶' : 'â–¼';
                        
                        // Atualizar indicador de scroll apÃ³s expandir/recolher
                        setTimeout(() => this.updateScrollIndicator(), 100);
                    });
                });

                // Module items (toggle aulas) - SEMPRE comeÃ§a recolhido
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
                        toggleIcon.textContent = isVisible ? 'â–¶' : 'â–¼';
                        
                        // Atualizar indicador de scroll apÃ³s expandir/recolher
                        setTimeout(() => this.updateScrollIndicator(), 100);
                    });
                });

                // Aula items (load content)
                this.elements.courseNav.querySelectorAll('.aula-item').forEach(item => {
                    item.addEventListener('click', () => {
                        // Remove seleÃ§Ã£o anterior
                        this.elements.courseNav.querySelectorAll('.aula-item.active')
                            .forEach(el => el.classList.remove('active'));
                        
                        // Marca como ativo
                        item.classList.add('active');
                        
                        // Carrega conteÃºdo da aula
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
                    
                    // SEMPRE mantÃ©m menu recolhido - usuÃ¡rio deve clicar para expandir
                    // Apenas seleciona primeira aula sem expandir nada
                    setTimeout(() => {
                        const firstAulaItem = this.elements.courseNav.querySelector('.aula-item');
                        
                        if (firstAulaItem && firstAula) {
                            // Seleciona primeira aula sem expandir curso/mÃ³dulo
                            firstAulaItem.classList.add('active');
                            this.loadAulaContent(firstCourse.id, firstModule.id, firstAula.id);
                        }
                    }, 100);
                }
            }

            // === CARREGAMENTO DE CONTEÃšDO DE AULAS ===
            async loadAulaContent(courseId, moduleId, aulaId) {
                try {
                    const cacheKey = `${courseId}-${moduleId}-${aulaId}`;
                    
                    // Verifica cache primeiro
                    if (this.contentCache.has(cacheKey)) {
                        const cached = this.contentCache.get(cacheKey);
                        if (this.isCacheValid(cached.timestamp)) {
                            console.log('ðŸ“‹ Usando conteÃºdo do cache');
                            this.displayContent(cached.data);
                            return;
                        }
                    }
                    
                    this.showContentLoading();
                    
                    const course = this.loadedCourses.find(c => c.id === courseId);
                    const module = course?.modules.find(m => m.id === moduleId);
                    const aula = module?.aulas.find(a => a.id === aulaId);

                    if (!aula) {
                        throw new Error('Aula nÃ£o encontrada');
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

                    // Cache do conteÃºdo
                    this.contentCache.set(cacheKey, {
                        data: contentData,
                        timestamp: Date.now()
                    });

                    this.displayContent(contentData);

                } catch (error) {
                    console.error('âŒ Erro ao carregar conteÃºdo da aula:', error);
                    this.showContentError(error.message);
                }
            }

            // === SANITIZAÃ‡ÃƒO MELHORADA DE HTML ===
            async fetchHTMLContent(contentUrl) {
                try {
                    console.log('ðŸ”— Carregando conteÃºdo de:', contentUrl);
                    let url = contentUrl;
                    
                    // Se Ã© referÃªncia do Firebase Storage
                    if (url.startsWith('gs://')) {
                        try {
                            const storageRef = this.storage.refFromURL(url);
                            url = await storageRef.getDownloadURL();
                            console.log('âœ… URL do Firebase Storage obtida:', url);
                        } catch (storageError) {
                            console.warn('âš ï¸ Erro ao obter URL do Storage:', storageError.message);
                            console.warn('ðŸ”„ Tentando construir URL pÃºblica...');
                            
                            // Fallback mais robusto para URL pÃºblica
                            const gsPath = url.replace('gs://', '').split('/');
                            const bucketName = gsPath[0];
                            const filePath = gsPath.slice(1).join('/');
                            const encodedPath = encodeURIComponent(filePath);
                            
                            url = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodedPath}?alt=media`;
                            console.log('ðŸ”„ URL pÃºblica construÃ­da:', url);
                        }
                    }
                    
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    let rawHtml = await response.text();

                    // === SANITIZAÃ‡ÃƒO ROBUSTA DO CONTEÃšDO HTML ===
                    return this.sanitizeHTML(rawHtml);
                    
                } catch (error) {
                    console.error('âŒ Erro ao buscar conteÃºdo HTML:', error);
                    throw new Error('Falha ao carregar conteÃºdo: ' + error.message);
                }
            }

            sanitizeHTML(rawHtml) {
                // Usar DOMPurify para sanitização robusta (XSS Prevention)
                if (typeof DOMPurify !== 'undefined') {
                    return DOMPurify.sanitize(rawHtml, {
                        ALLOWED_TAGS: [
                            'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike',
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'ul', 'ol', 'li',
                            'table', 'thead', 'tbody', 'tr', 'th', 'td',
                            'blockquote', 'code', 'pre',
                            'a', 'img', 'span', 'div'
                        ],
                        ALLOWED_ATTR: [
                            'href', 'target', 'rel', 'alt', 'src', 'title',
                            'class', 'id', 'style'
                        ],
                        ALLOW_DATA_ATTR: false,
                        FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
                        FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'],
                        SANITIZE_DOM: true,
                        KEEP_CONTENT: true
                    });
                }

                // Fallback para sanitização manual se DOMPurify não estiver disponível
                console.warn('DOMPurify não disponível, usando sanitização básica');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = rawHtml;

                // Remove elementos perigosos
                const dangerousElements = [
                    'iframe', 'object', 'embed',
                    'form', 'input', 'button', 'textarea', 'select',
                    'applet', 'audio', 'video', 'source', 'track',
                    'script', 'style'
                ];

                dangerousElements.forEach(tag => {
                    tempDiv.querySelectorAll(tag).forEach(el => el.remove());
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

                return tempDiv.innerHTML;
            }

            displayContent(contentData) {
                this.currentContent = contentData;
                
                // Atualiza corpo do conteÃºdo
                const lessonContentDiv = document.createElement('div');
                lessonContentDiv.className = 'lesson-content';
                lessonContentDiv.innerHTML = contentData.content; // JÃ¡ sanitizado
                
                this.elements.contentBody.innerHTML = '';
                this.elements.contentBody.appendChild(lessonContentDiv);
                
                // Scroll para o topo
                this.elements.contentBody.scrollTop = 0;
                
                // Atualizar botÃ£o dinÃ¢mico de questÃµes
                this.updateDynamicQuestoesButton(contentData.meta);
                
                console.log('âœ… ConteÃºdo exibido:', contentData.title);
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
                        <p>Carregando conteÃºdo...</p>
                    </div>
                `;
            }

            showEmptyState() {
                this.elements.courseNav.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">ðŸ“š</div>
                        <h3>Nenhum curso encontrado</h3>
                        <p>Configure sua personalizaÃ§Ã£o ou use "Todos os Cursos".</p>
                    </div>
                `;
            }

            showError(message) {
                this.elements.courseNav.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">âŒ</div>
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
                        <div class="empty-state-icon">âš ï¸</div>
                        <h3>Erro ao carregar conteÃºdo</h3>
                        <p>${this.escapeHtml(message)}</p>
                        <p style="font-size: 0.9em; margin-top: 1rem; opacity: 0.8;">
                            Verifique sua conexÃ£o e tente novamente.
                        </p>
                    </div>
                `;
            }

            // === NOTIFICAÃ‡Ã•ES ===
            showNotification(message, type = 'info') {
                const notification = document.createElement('div');
                notification.className = `notification ${type}`;
                notification.textContent = message;
                
                document.body.appendChild(notification);
                
                // Anima entrada
                setTimeout(() => notification.classList.add('show'), 100);
                
                // Remove apÃ³s 3 segundos
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => notification.remove(), 300);
                }, 3000);
            }

            // === UTILITÃRIOS ===
            getCourseIcon(courseName) {
                const name = courseName.toLowerCase();
                if (name.includes('direito')) return 'âš–ï¸';
                if (name.includes('matemÃ¡tica') || name.includes('matematica')) return 'ðŸ”¢';
                if (name.includes('portuguÃªs') || name.includes('portugues')) return 'ðŸ“';
                if (name.includes('informÃ¡tica') || name.includes('informatica')) return 'ðŸ’»';
                if (name.includes('contabilidade')) return 'ðŸ“Š';
                if (name.includes('administraÃ§Ã£o') || name.includes('administracao')) return 'ðŸ›ï¸';
                return 'ðŸ“š';
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

            // === FUNÃ‡ÃƒO DE ESCAPE HTML PARA SEGURANÃ‡A ===
            escapeHtml(text) {
                if (typeof text !== 'string') return text;
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }

            // === API PÃšBLICA ===
            clearCache() {
                this.contentCache.clear();
                this.coursesCache = null;
                this.showNotification('Cache limpo', 'success');
            }

            refresh() {
                this.clearCache();
                this.loadUserCourses();
            }
        }

        // === INICIALIZAÃ‡ÃƒO GLOBAL ===
        let studyApp;

        // Configurar API bÃ¡sica imediatamente para o header
        window.studyApp = {
            toggleSidebar: () => {
                console.log('toggleSidebar chamado via header (early)');
                if (studyApp && studyApp.toggleSidebar) {
                    return studyApp.toggleSidebar();
                } else {
                    console.warn('studyApp.toggleSidebar nÃ£o disponÃ­vel ainda');
                }
            },
            loadAllCourses: () => {
                console.log('loadAllCourses chamado via header (early)');
                if (studyApp && studyApp.loadAllCourses) {
                    return studyApp.loadAllCourses();
                } else {
                    console.warn('studyApp.loadAllCourses nÃ£o disponÃ­vel ainda');
                }
            },
            showNotification: (message, type) => {
                console.log('showNotification chamado via header (early):', message, type);
                if (studyApp && studyApp.showNotification) {
                    return studyApp.showNotification(message, type);
                } else {
                    console.log('NotificaÃ§Ã£o (fallback):', message);
                }
            }
        };

        document.addEventListener('DOMContentLoaded', () => {
            console.log('StudyApp DOM carregado');
            studyApp = new StudyRoomApp();
            
            // Atualizar mÃ©todos com referÃªncia real
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
            
            console.log('window.studyApp atualizado com referÃªncias reais');
            
            // Expor para debug em desenvolvimento
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                window.studyApp.debug = studyApp;
            }
        });

        // Service Worker para cache offline
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('âœ… Service Worker registrado'))
                    .catch(error => {
                        // Service Worker nÃ£o crÃ­tico - aplicaÃ§Ã£o funciona sem ele
                        if (console.debug) console.debug('Service Worker nÃ£o disponÃ­vel:', error.message);
                    });
            });
        }

        // Suprimir erros comuns de extensÃµes do navegador
        window.addEventListener('error', (e) => {
            if (e.message.includes('message channel closed') || 
                e.message.includes('asynchronous response')) {
                e.preventDefault();
                return false;
            }
        });
