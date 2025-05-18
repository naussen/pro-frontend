// questoe_injector.js
(function() {
    console.log('[QI] Iniciando injeção de questoes-injector.js');

    // Evita múltiplas injeções
    if (window.__QUESTOES_APP_INJECTED_V2__) {
        console.log('[QI] Script já injetado anteriormente, retornando.');
        return; 
    }
    window.__QUESTOES_APP_INJECTED_V2__ = true;
    console.log('[QI] Flag de injeção definida: __QUESTOES_APP_INJECTED_V2__');

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
    console.log('[QI] Iframe criado com src:', iframe.src);
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
    console.log('[QI] Container e iframe adicionados ao DOM');

    // Função para abrir/fechar o painel de questões
    function toggleQuestoesAppVisibility() {
        const isOpen = container.style.display === 'flex';
        container.style.display = isOpen ? 'none' : 'flex';
        console.log('[QI] Painel de questões ' + (isOpen ? 'fechado' : 'aberto'));
        
        if (!isOpen) {
            // Ao abrir o painel, tenta enviar os dados atuais
            console.log('[QI] Tentando enviar dados atuais ao abrir painel');
            setTimeout(sendCurrentLessonDataToIframe, 300);
        }
    }
    closeBtnInternal.onclick = toggleQuestoesAppVisibility; // Botão de fechar interno

    // Torna a função de toggle acessível globalmente
    window.toggleQuestoesAppGlobal = toggleQuestoesAppVisibility;
    console.log('[QI] Função toggleQuestoesAppGlobal definida globalmente');

    // Fecha ao clicar fora da caixa do app (no overlay escuro)
    container.addEventListener('click', function(e) {
        if (e.target === container) {
            toggleQuestoesAppVisibility();
        }
    });

    // Variável para controlar se o iframe está pronto
    let iframeIsReady = false;

    // Listener para mensagens do iframe
    console.log('[QI] Adicionando listener de mensagens de window');
    window.addEventListener('message', function(event) {
        console.log('[QI] Mensagem recebida de origem:', event.origin, 'dados:', event.data);
        
        // Verifica a origem da mensagem por segurança
        // Permite localhost:5173 para desenvolvimento local
        /*
        if (event.origin !== 'https://app-questoes.netlify.app' && event.origin !== 'http://localhost:5173') {
            console.warn('[QI] Mensagem ignorada de origem desconhecida:', event.origin);
            return;
        }
        */

        // Verifica se a mensagem indica que o iframe está pronto
        if (event.data === 'iframeReady') {
            console.log('[QI] Mensagem iframeReady recebida do iframe.');
            iframeIsReady = true;
            // Envia os dados da aula atual para o iframe assim que ele estiver pronto
            sendCurrentLessonDataToIframe();
        } 
        else if (event.data === 'getSubtopicId') {
            console.log('[QI] Recebida solicitação getSubtopicId do iframe, enviando dados...');
            // Responde com os mesmos dados que enviaria com o evento loadQuestions
            const questoesIframe = document.getElementById('questoes-app-iframe');
            if (questoesIframe && questoesIframe.contentWindow) {
                const activeLink = document.querySelector('.subtopic-link.active');
                if (activeLink && activeLink.getAttribute('data-subtopic-id')) {
                    const subtopicId = activeLink.getAttribute('data-subtopic-id');
                    console.log('[QI] Enviando subtopicId:', subtopicId, 'e userId:', window.userId);
                    questoesIframe.contentWindow.postMessage({
                        type: 'subtopicIdResponse',
                        subtopicId: subtopicId,
                        userId: window.userId
                    }, '*');
                } else {
                    console.log('[QI] Nenhum link ativo ou sem subtopicId para enviar');
                    questoesIframe.contentWindow.postMessage({
                        type: 'subtopicIdResponse',
                        subtopicId: null,
                        userId: window.userId,
                        error: 'No active subtopic'
                    }, '*');
                }
            }
        }
        else if (event.data && event.data.type === 'closeQuestionsApp') {
            console.log('[QI] Recebida solicitação para fechar painel de questões');
            toggleQuestoesAppVisibility(); // Fecha o painel
        }
    });

    // Função para enviar os dados da aula atual para o iframe
    function sendCurrentLessonDataToIframe() {
        const questoesIframe = document.getElementById('questoes-app-iframe');
        console.log('[QI] Tentando enviar dados para o iframe. Estado: iframeIsReady=', iframeIsReady, 
                    'iframe existe=', !!questoesIframe, 
                    'contentWindow existe=', !!(questoesIframe && questoesIframe.contentWindow),
                    'window.userId=', window.userId);
        
        // Verifica se o iframe está pronto e se temos os dados da aula e userId
        if (iframeIsReady && questoesIframe && questoesIframe.contentWindow) {
            if (!window.userId) {
                console.warn('[QI] window.userId não está definido!');
                if (typeof userId !== 'undefined') {
                    console.log('[QI] Variável local userId encontrada:', userId);
                    window.userId = userId;
                    console.log('[QI] Copiada para window.userId:', window.userId);
                }
            }
            
            const activeLink = document.querySelector('.subtopic-link.active');
            if (activeLink) {
                const subtopicIdFromLink = activeLink.getAttribute('data-subtopic-id');
                console.log('[QI] Link ativo encontrado com subtopicId:', subtopicIdFromLink);
                
                if (subtopicIdFromLink && subtopicIdFromLink.trim() !== '') {
                    // Envia a mensagem 'loadQuestions' com os dados
                    const messageData = {
                        type: 'loadQuestions',
                        subtopicId: subtopicIdFromLink,
                        userId: window.userId // userId deve estar disponível globalmente
                    };
                    console.log('[QI] Enviando mensagem para app-questoes.netlify.app:', JSON.stringify(messageData));
                    questoesIframe.contentWindow.postMessage(messageData, 'https://app-questoes.netlify.app');
                    
                    console.log('[QI] Enviando mensagem para localhost:5173:', JSON.stringify(messageData));
                    questoesIframe.contentWindow.postMessage(messageData, 'http://localhost:5173');
                    
                    console.log('[QI] Mensagem loadQuestions enviada para o iframe com subtopicId e userId.');
                } else {
                    console.warn("[QI] data-subtopic-id está vazio ou ausente no link ativo. Não foi possível enviar dados completos para o iframe.");
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
                 console.log('[QI] Nenhum subtopic-link ativo. Não foi possível enviar dados para o iframe.');
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
            console.log('[QI] Iframe não pronto ou userId não disponível. Não foi possível enviar dados da aula.');
        }
    }

    // Adiciona um listener para o evento 'lessonContentLoaded' (assumindo que este evento é disparado na página pai)
    console.log('[QI] Adicionando listener para evento lessonContentLoaded');
    window.addEventListener('lessonContentLoaded', function() {
        console.log('[QI] Evento lessonContentLoaded recebido! Chamando sendCurrentLessonDataToIframe');
        sendCurrentLessonDataToIframe();
    });

    console.log('[QI] questoes-injector.js carregado e inicializado com sucesso!');
})();