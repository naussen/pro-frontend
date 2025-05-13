function renderHeader() {
    const header = document.createElement('header');
    header.className = 'w3s-header';
    header.id = 'mainHeader';

	// Logo
	const logoArea = document.createElement('div');
	logoArea.className = 'w3s-logo-area';
	logoArea.innerHTML = `
		<a href="index.html" title="Página Inicial" class="logo-link">
			<svg class="w3s-logo-placeholder" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
				<circle cx="20" cy="20" r="18" fill="#007bff"/>
				<text x="50%" y="53%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-weight="bold" dy="1">P</text>
			</svg>
			<span class="logo-text">PRO Concursos</span>
		</a>
	`;
	header.appendChild(logoArea);

    // Menu Topo Esquerdo (Cursos, Questões, Flashcards)
    const navMenu = document.createElement('nav');
    navMenu.className = 'w3s-nav-menu';
    navMenu.innerHTML = `
        <div class="nav-item">
            <button class="nav-btn">Cursos ▼</button>
            <div class="dropdown-content">
                <a href="saladeestudos.html">Meus Cursos</a>
                <a href="personalizar.html">Personalizar Cursos</a>
            </div>
        </div>
        <div class="nav-item">
            <button class="nav-btn">Questões ▼</button>
            <div class="dropdown-content">
                <a href="saladeestudos.html#questionsPanel">Praticar Questões</a>
            </div>
        </div>
        <div class="nav-item">
            <button class="nav-btn">Flashcards ▼</button>
            <div class="dropdown-content">
                <a href="saladeestudos.html#flashcardsPanel">Revisar Flashcards</a>
            </div>
        </div>
    `;
    header.appendChild(navMenu);

    // Menu Direito
    const rightGroup = document.createElement('div');
    rightGroup.className = 'w3s-header-right-group';
    rightGroup.innerHTML = `
        <div class="w3s-header-actions">
            <button id="theme-toggle" title="Alternar Tema Claro/Escuro">
                <span class="icon theme-icon-light">☀️</span>
                <span class="icon theme-icon-dark" style="display: none;">🌙</span>
            </button>
            <button id="color-picker-btn" title="Mudar Cor de Fundo"><span class="icon">🎨</span> <span class="link-text">Cor</span></button>
            <a href="alterar-cadastro.html" title="Meu Cadastro"><span class="icon">⚙️</span> <span class="link-text">Meu Cadastro</span></a>
			<a href="personalizar.html" title="Personalizar Cursos" style="margin-left: 10px;"> <span class="icon">⚙️</span>
            <a href="guia.html" title="Guia do Método"><span class="icon">📖</span> <span class="link-text">Guia</span></a> <span class="link-text">Personalizar</span>
            <button id="logout-btn" title="Logout"><span class="icon">🚪</span> <span class="link-text">Logout</span></button>
        </div>
    `;
    header.appendChild(rightGroup);

    document.body.prepend(header);

	const navItems = document.querySelectorAll('.nav-item');
	navItems.forEach(item => {
		const btn = item.querySelector('.nav-btn');
		const dropdown = item.querySelector('.dropdown-content');

		const toggleDropdown = () => {
			const isVisible = dropdown.style.display === 'block';
			// Fecha todos os dropdowns
			document.querySelectorAll('.dropdown-content').forEach(dd => {
				dd.style.display = 'none';
				dd.classList.remove('active');
			});
			// Alterna o dropdown clicado
			if (!isVisible) {
				dropdown.style.display = 'block';
				dropdown.classList.add('active');
			}
		};

		// Clique no botão
		btn.addEventListener('click', (e) => {
			e.stopPropagation(); // Evita que o clique propague e feche imediatamente
			toggleDropdown();
		});

		// Suporte a teclado (Enter ou Espaço)
		btn.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				toggleDropdown();
			}
		});
	});

// Fechar dropdowns ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.dropdown-content').forEach(dd => {
            dd.style.display = 'none';
            dd.classList.remove('active');
        });
    }
});



    // Tema Claro/Escuro
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = themeToggleBtn.querySelector('.theme-icon-light');
    const moonIcon = themeToggleBtn.querySelector('.theme-icon-dark');

    function applyTheme(theme) {
        document.body.classList.toggle('dark-mode', theme === 'dark');
        sunIcon.style.display = theme === 'dark' ? 'none' : 'inline';
        moonIcon.style.display = theme === 'dark' ? 'inline' : 'none';
    }

    const savedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    let currentTheme = savedTheme || (prefersDarkScheme.matches ? 'dark' : 'light');
    applyTheme(currentTheme);

    themeToggleBtn.addEventListener('click', () => {
        let newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        firebase.auth().signOut().then(() => {
            console.log('Logout bem-sucedido');
            window.location.href = 'index.html';
        }).catch(error => {
            console.error('Erro ao fazer logout:', error);
            alert('Erro ao fazer logout: ' + error.message);
        });
    });

    // Mudar Cor de Fundo
    const colorPickerBtn = document.getElementById('color-picker-btn');
    colorPickerBtn.addEventListener('click', () => {
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = document.body.style.backgroundColor || '#ffffff';
        colorInput.addEventListener('change', () => {
            const color = colorInput.value;
            document.body.style.backgroundColor = color;
            saveSalaConfig({ color });
        });
        colorInput.click();
    });

    // Configuração da Sala (Usando o backend)
    const apiUrl = "https://api.proconcursos.com.br/api/sala";
    let userId = null; // Este userId é local para header.js

    async function saveSalaConfig(config) {
        if (!userId) return; // Precisa do userId do Firebase auth
        try {
            const response = await fetch(`${apiUrl}/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
            const result = await response.json();
            console.log('Configurações salvas:', result);
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
        }
    }

    // Autenticação (header.js tem sua própria escuta de auth state)
    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            userId = user.uid; // Define o userId local para saveSalaConfig
        } else {
            userId = null;
        }
    });

    // Adicionando funcionalidade para o botão Pomodoro
    let pomodoroInterval = null;
    let timeRemaining = 25 * 60;
    let isBreak = false;
    let initialFocusTime = 25 * 60;

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function startPomodoro() {
        if (pomodoroInterval) return;
        const select = document.getElementById('pomodoroTimeHeader');
        const timer = document.getElementById('pomodoroTimerHeader');
        const status = document.getElementById('pomodoroStatusHeader');
        const selectedTime = parseInt(select.value) * 60;
        timeRemaining = selectedTime;
        initialFocusTime = selectedTime;
        isBreak = select.value !== '25';
        status.textContent = isBreak ? 'Pausa' : 'Foco';
        timer.textContent = formatTime(timeRemaining);
        pomodoroInterval = setInterval(updatePomodoroTimer, 1000);
    }

    function updatePomodoroTimer() {
        const timer = document.getElementById('pomodoroTimerHeader');
        const status = document.getElementById('pomodoroStatusHeader');
        if (timeRemaining <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            status.textContent = 'Concluído!';
            setTimeout(() => {
                timeRemaining = initialFocusTime;
                timer.textContent = formatTime(timeRemaining);
                status.textContent = isBreak ? 'Pausa' : 'Foco';
            }, 2000);
            return;
        }
        timeRemaining--;
        timer.textContent = formatTime(timeRemaining);
    }

    function stopPomodoro() {
        clearInterval(pomodoroInterval);
        pomodoroInterval = null;
        const select = document.getElementById('pomodoroTimeHeader');
        const timer = document.getElementById('pomodoroTimerHeader');
        const status = document.getElementById('pomodoroStatusHeader');
        timeRemaining = parseInt(select.value) * 60;
        timer.textContent = formatTime(timeRemaining);
        status.textContent = 'Foco';
    }

    // Configurando o evento de clique para expandir/recolher o dropdown do Pomodoro
    const pomodoroBtn = document.getElementById('pomodoro-header-btn');
    const pomodoroDropdown = document.getElementById('pomodoro-header-dropdown');

    if (pomodoroBtn && pomodoroDropdown) {
        pomodoroBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isVisible = pomodoroDropdown.style.display === 'block';
            pomodoroDropdown.style.display = isVisible ? 'none' : 'block';
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('#pomodoro-header-dropdown') && !e.target.closest('#pomodoro-header-btn')) {
            pomodoroDropdown.style.display = 'none';
        }
    });
}

// Se este script for incluído numa página, renderHeader() precisaria ser chamada,
// por exemplo:
// if (document.readyState === 'loading') {
//    document.addEventListener('DOMContentLoaded', renderHeader);
// } else {
//    renderHeader();
// }