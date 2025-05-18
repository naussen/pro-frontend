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
    iframe.src = 'https://app-questoes.netlify.app'; // URL do seu app de questões (revertido)
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
        // Verifica a origem da mensagem por segurança
        // Adicione a origem de desenvolvimento local se aplicável
        if (event.origin !== 'https://questoes.proconcursos.com.br' && event.origin !== 'http://localhost:5173') { // Corrigida a origem
             console.warn('Mensagem ignorada de origem desconhecida:', event.origin);
            return;
        }
        // A lógica de recebimento de mensagens foi movida para App.jsx
        // Este listener em questoes-injector.js não é mais necessário para passar o subtopicId para o App.jsx
        // A comunicação agora é direta de saladeestudos.html para o iframe (App.jsx)
        console.log('Mensagem recebida no questoes-injector.js (listener antigo):', event.data); // Log para depuração
    });

})();