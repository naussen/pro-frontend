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
        // A mensagem vem do iframe, cuja origem é https://app-questoes.netlify.app
        if (event.origin !== 'https://app-questoes.netlify.app') { // CORRIGIDO: Deve ser ===
             // Ignora mensagens de origens inesperadas por segurança - Manter o log para depuração
             console.warn('Mensagem ignorada de origem desconhecida:', event.origin);
            return;
        }
        if (event.data === 'getSubtopicId') {
            let questionsKeyForApp = null;
            const activeLink = document.querySelector('.subtopic-link.active');
            if (activeLink) {
                // O link ativo deve ter o subtopicId no atributo data-subtopic-id
                const subtopicIdFromLink = activeLink.getAttribute('data-subtopic-id');
                // Também precisamos enviar o userId da página pai
                const userIdFromPage = window.userId; // Assumindo que userId está disponível globalmente na página pai

                if (subtopicIdFromLink && subtopicIdFromLink.trim() !== '') {
                    // Envia a resposta de volta para o iframe, incluindo o userId
                    // O targetOrigin deve ser a origem do iframe
                    event.source.postMessage({ subtopicId: subtopicIdFromLink, userId: userIdFromPage, type: 'subtopicIdResponse' }, event.origin); // Usar event.source e event.origin
                    console.log('Enviando subtopicId', subtopicIdFromLink, 'e userId', userIdFromPage, 'para app-questoes.');
                } else {
                    console.warn("data-subtopic-id está vazio ou ausente no link ativo.", activeLink);
                    // Envia uma resposta de erro
                    event.source.postMessage({ subtopicId: null, userId: userIdFromPage, error: "subtopicId missing or empty on active link", type: 'subtopicIdResponse' }, event.origin);
                }
            } else {
                console.log('Nenhum subtopic-link ativo. Enviando null para app-questoes.');
                // Envia uma resposta indicando que não há subtopic ativo
                event.source.postMessage({ subtopicId: null, userId: window.userId, error: "No active subtopic", type: 'subtopicIdResponse' }, event.origin);
            }
        }
    });

})();