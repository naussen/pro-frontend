// questoe_injector.js
(function() {
    // Evita múltiplas injeções
    if (window.__QUESTOES_APP_INJECTED_V2__) return; // Use uma nova flag para garantir que esta versão seja carregada
    window.__QUESTOES_APP_INJECTED_V2__ = true;

    // Cria container do app React (mantém esta parte)
    const container = document.createElement('div');
    container.id = 'questoes-app-container'; // O ID que o seu botão verde pode usar para controlar
    Object.assign(container.style, {
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.18)',
        zIndex: 9998, // Z-index um pouco menor que o botão original, se necessário
        justifyContent: 'center',
        alignItems: 'center',
    });

    const appBox = document.createElement('div');
    Object.assign(appBox.style, {
        position: 'relative',
        width: 'min(117.6vw, 1404px)',
        height: 'min(90.25vh, 864.5px)',
        background: '#fff', // Cor de fundo da caixa do app
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    });

    const closeBtnInternal = document.createElement('button');
    closeBtnInternal.innerHTML = '✖';
    Object.assign(closeBtnInternal.style, {
        position: 'absolute',
        top: '12px',
        right: '18px',
        background: 'transparent',
        border: 'none',
        fontSize: '1.6em',
        color: '#888',
        cursor: 'pointer',
        zIndex: 10001, // Acima do iframe
    });
    appBox.appendChild(closeBtnInternal);

    const iframe = document.createElement('iframe');
    iframe.id = 'questoes-app-iframe';
    iframe.src = 'https://app-questoes.netlify.app'; // URL do seu app de questões
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px', // Arredondamento interno se a appBox não tiver overflow:hidden
        background: 'transparent', // Para a sombra da appBox aparecer
        flex: '1 1 auto',
    });
    appBox.appendChild(iframe);
    container.appendChild(appBox);
    document.body.appendChild(container);

    // Função para abrir/fechar o painel de questões
    function toggleQuestoesAppVisibility() {
        const isOpen = container.style.display === 'flex';
        container.style.display = isOpen ? 'none' : 'flex';
    }
    closeBtnInternal.onclick = toggleQuestoesAppVisibility; // Botão de fechar interno

    // Torna a função de toggle acessível globalmente
    window.toggleQuestoesAppGlobal = toggleQuestoesAppVisibility;

    // Fecha ao clicar fora da caixa do app (no overlay escuro)
    container.addEventListener('click', function(e) {
        if (e.target === container) {
            toggleQuestoesAppVisibility();
        }
    });

    // Variável para controlar se o iframe está pronto
    let iframeIsReady = false;

    // Listener para mensagens do iframe
    window.addEventListener('message', function(event) {
        // Verifica a origem da mensagem por segurança
        // Permite localhost:5173 para desenvolvimento local
        if (event.origin !== 'https://app-questoes.netlify.app' && event.origin !== 'http://localhost:5173') {
            console.warn('Mensagem ignorada de origem desconhecida:', event.origin);
            return;
        }

        // Verifica se a mensagem indica que o iframe está pronto
        if (event.data === 'iframeReady') {
            console.log('Mensagem iframeReady recebida do iframe.');
            iframeIsReady = true;
            // Envia os dados da aula atual para o iframe assim que ele estiver pronto
            sendCurrentLessonDataToIframe();
        }
    });

    // Função para enviar os dados da aula atual para o iframe
    function sendCurrentLessonDataToIframe() {
        const questoesIframe = document.getElementById('questoes-app-iframe');
        // Verifica se o iframe está pronto e se temos os dados da aula e userId
        if (iframeIsReady && questoesIframe && questoesIframe.contentWindow && window.userId) {
            const activeLink = document.querySelector('.subtopic-link.active');
            if (activeLink) {
                const subtopicIdFromLink = activeLink.getAttribute('data-subtopic-id');
                if (subtopicIdFromLink && subtopicIdFromLink.trim() !== '') {
                    // Envia a mensagem 'loadQuestions' com os dados
                    questoesIframe.contentWindow.postMessage({
                        type: 'loadQuestions',
                        subtopicId: subtopicIdFromLink,
                        userId: window.userId // userId deve estar disponível globalmente
                    }, 'https://app-questoes.netlify.app');
                    // Também envia para localhost para desenvolvimento local
                     questoesIframe.contentWindow.postMessage({
                        type: 'loadQuestions',
                        subtopicId: subtopicIdFromLink,
                        userId: window.userId
                    }, 'http://localhost:5173');
                    console.log('Mensagem loadQuestions enviada para o iframe com subtopicId e userId.');
                } else {
                    console.warn("data-subtopic-id está vazio ou ausente no link ativo. Não foi possível enviar dados para o iframe.");
                     questoesIframe.contentWindow.postMessage({
                        type: 'loadQuestions',
                        subtopicId: null,
                        userId: window.userId,
                        error: "subtopicId missing or empty on active link"
                    }, 'https://app-questoes.netlify.app');
                     questoesIframe.contentWindow.postMessage({
                        type: 'loadQuestions',
                        subtopicId: null,
                        userId: window.userId,
                        error: "subtopicId missing or empty on active link"
                    }, 'http://localhost:5173');
                }
            } else {
                 console.log('Nenhum subtopic-link ativo. Não foi possível enviar dados para o iframe.');
                 questoesIframe.contentWindow.postMessage({
                    type: 'loadQuestions',
                    subtopicId: null,
                    userId: window.userId,
                    error: "No active subtopic"
                }, 'https://app-questoes.netlify.app');
                 questoesIframe.contentWindow.postMessage({
                    type: 'loadQuestions',
                    subtopicId: null,
                    userId: window.userId,
                    error: "No active subtopic"
                }, 'http://localhost:5173');
            }
        } else {
            console.log('Iframe não pronto ou userId não disponível. Não foi possível enviar dados da aula.');
        }
    }

    // Adiciona um listener para o evento 'lessonContentLoaded' (assumindo que este evento é disparado na página pai)
    // Este listener garantirá que os dados da aula sejam enviados sempre que uma nova aula for carregada.
    // Você precisará adicionar um evento personalizado 'lessonContentLoaded' na página saladeestudos.html
    // onde o conteúdo da aula é carregado (por exemplo, após lessonContentDiv.innerHTML = htmlContent;).
    window.addEventListener('lessonContentLoaded', sendCurrentLessonDataToIframe);
    console.log('Listener para lessonContentLoaded adicionado.');

})();