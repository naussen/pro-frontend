// Adiciona botão fixo QUESTÕES e container do app React de questões
(function() {
    // Evita múltiplas injeções
    if (window.__QUESTOES_APP_INJECTED__) return;
    window.__QUESTOES_APP_INJECTED__ = true;

    // Cria botão fixo
    const btn = document.createElement('button');
    btn.id = 'questoes-fab';
    btn.innerHTML = 'QUESTÕES';
    Object.assign(btn.style, {
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 9999,
        background: '#D4AC0D',
        color: '#222',
        border: 'none',
        borderRadius: '30px',
        padding: '16px 28px',
        fontWeight: 'bold',
        fontSize: '1.1em',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        cursor: 'pointer',
        transition: 'background 0.2s',
    });
    btn.onmouseenter = () => btn.style.background = '#b3910b';
    btn.onmouseleave = () => btn.style.background = '#D4AC0D';

    // Cria container do app React
    const container = document.createElement('div');
    container.id = 'questoes-app-container';
    Object.assign(container.style, {
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.18)',
        zIndex: 9998,
        justifyContent: 'center',
        alignItems: 'center',
    });

    // Caixa central do app
    const appBox = document.createElement('div');
    Object.assign(appBox.style, {
        position: 'relative',
        width: 'min(95vw, 900px)',
        height: 'min(90vh, 700px)',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    });

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✖';
    Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '12px',
        right: '18px',
        background: 'transparent',
        border: 'none',
        fontSize: '1.6em',
        color: '#888',
        cursor: 'pointer',
        zIndex: 2,
    });
    closeBtn.onclick = toggleQuestoesApp;
    appBox.appendChild(closeBtn);

    // Iframe do app React
    const iframe = document.createElement('iframe');
    iframe.id = 'questoes-app-iframe';
    iframe.src = 'https://app-questoes.netlify.app';
    Object.assign(iframe.style, {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '16px',
        background: 'transparent',
        flex: '1 1 auto',
    });
    appBox.appendChild(iframe);
    container.appendChild(appBox);

    // Função para abrir/fechar
    function toggleQuestoesApp() {
        const isOpen = container.style.display === 'flex';
        container.style.display = isOpen ? 'none' : 'flex';
        btn.style.background = isOpen ? '#D4AC0D' : '#b3910b';
    }
    btn.onclick = toggleQuestoesApp;

    // Adiciona ao body
    document.body.appendChild(btn);
    document.body.appendChild(container);

    // Fecha ao clicar fora da caixa
    container.addEventListener('click', function(e) {
        if (e.target === container) toggleQuestoesApp();
    });

    // Passa subtopicId para o app React via postMessage
    window.addEventListener('message', function(event) {
        // O app React pode pedir o subtopicId
        if (event.data === 'getSubtopicId') {
            // Tenta obter subtopicId do DOM (ajuste conforme sua lógica)
            let subtopicId = null;
            const active = document.querySelector('.subtopic-link.active');
            if (active) subtopicId = active.getAttribute('data-subtopic-id');
            iframe.contentWindow.postMessage({ subtopicId }, '*');
        }
    });
})(); 