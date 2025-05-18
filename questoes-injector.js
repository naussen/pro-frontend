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
    
    // Listener para fornecer o subtopicId ao iframe (MANTÉM O AJUSTE ANTERIOR)
    window.addEventListener('message', function(event) {
        if (event.origin !== 'https://app-questoes.netlify.app') {
             // Ignora mensagens de origens inesperadas por segurança
            return;
        }
        if (event.data === 'getSubtopicId') {
            let questionsKeyForApp = null;
            const activeLink = document.querySelector('.subtopic-link.active');
            if (activeLink) {
                // O link ativo deve ter o subtopicId no atributo data-subtopic-id
                const subtopicIdFromLink = activeLink.getAttribute('data-subtopic-id');
                if (subtopicIdFromLink && subtopicIdFromLink.trim() !== '') {
                    iframe.contentWindow.postMessage({ subtopicId: subtopicIdFromLink, type: 'subtopicIdResponse' }, 'https://app-questoes.netlify.app');
                    console.log('Enviando subtopicId para app-questoes:', subtopicIdFromLink);
                } else {
                    console.warn("data-subtopic-id está vazio ou ausente no link ativo.", activeLink);
                    iframe.contentWindow.postMessage({ subtopicId: null, error: "subtopicId missing or empty on active link", type: 'subtopicIdResponse' }, 'https://app-questoes.netlify.app');
                }
            } else {
                console.log('Nenhum subtopic-link ativo. Enviando null para app-questoes.');
                iframe.contentWindow.postMessage({ subtopicId: null, error: "No active subtopic", type: 'subtopicIdResponse' }, 'https://app-questoes.netlify.app');
            }
        }
    });

})();