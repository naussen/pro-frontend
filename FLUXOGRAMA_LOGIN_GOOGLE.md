# 🔄 FLUXOGRAMA - Login com Google

## 📊 FLUXO ATUAL (COM PROBLEMA)

```
┌─────────────────────────────────────────────────────────────┐
│                    index.html carrega                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │  Inicializar Firebase          │
        │  (pode demorar 100-500ms)      │
        └────────────┬───────────────────┘
                     │
                     ├─────────────────┐
                     │                 │
                     ▼                 ▼
        ┌─────────────────┐   ┌──────────────────┐
        │ Carregar        │   │ Firebase emite   │
        │ header.html     │   │ evento          │
        │ (assíncrono)    │   │ "firebaseReady"  │
        └────────┬────────┘   └────────┬─────────┘
                 │                     │
                 ▼                     ▼
        ┌──────────────────┐   ┌──────────────────┐
        │ Header carrega   │   │ Listener tenta   │
        │ com botões       │   │ chamar função    │
        │ desabilitados    │   │ que não existe   │
        └────────┬─────────┘   └────────┬─────────┘
                 │                      │
                 ▼                      ▼
        ┌───────────────────┐   ┌─────────────────┐
        │ initGoogleAuth    │   │ ❌ ERRO:        │
        │ Buttons() cria    │   │ enableGoogle    │
        │ função local      │   │ Buttons não     │
        │ não acessível     │   │ encontrado      │
        └───────────────────┘   └─────────────────┘
                 │
                 ▼
        ┌───────────────────┐
        │ ❌ RESULTADO:     │
        │ Botões ficam      │
        │ desabilitados     │
        │ permanentemente   │
        └───────────────────┘
```

## ✅ FLUXO CORRIGIDO

```
┌─────────────────────────────────────────────────────────────┐
│                    index.html carrega                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  1. Inicializar Firebase PRIMEIRO  │
        │     await initializeFirebase()     │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  2. Emitir evento "firebaseReady"  │
        │     window.firebaseReady = true    │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  3. Aguardar um frame              │
        │     (garante evento foi processado)│
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  4. Carregar header.html DEPOIS    │
        │     await loadHeader()             │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  5. Header carrega com botões      │
        │     initGoogleAuthButtons()        │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  6. Criar googleButtonsInitializer │
        │     (variável GLOBAL)              │
        └────────────┬───────────────────────┘
                     │
                     ▼
        ┌────────────────────────────────────┐
        │  7. Verificar se Firebase ready    │
        │     if (window.firebaseReady)      │
        └────────────┬───────────────────────┘
                     │
                     ├─────────── SIM ────────┐
                     │                        │
                     ▼                        ▼
        ┌────────────────────┐    ┌──────────────────┐
        │ 8a. Habilitar      │    │ 8b. Aguardar     │
        │     botões agora   │    │     evento       │
        └────────────────────┘    └─────────┬────────┘
                 │                          │
                 │              ┌───────────▼─────────┐
                 │              │ Evento firebaseReady│
                 │              │ dispara            │
                 │              └────────┬────────────┘
                 │                       │
                 │              ┌────────▼────────────┐
                 │              │ Chamar global      │
                 │              │ Initializer()      │
                 │              └────────┬────────────┘
                 │                       │
                 └───────────────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │ ✅ RESULTADO:         │
                 │ Botões habilitados    │
                 │ e funcionando         │
                 └───────────────────────┘
```

## 🔄 CICLO DE VIDA DO BOTÃO GOOGLE

```
ESTADO 1: INICIAL
┌──────────────────────────┐
│ Botão não existe         │
│ (HTML não carregado)     │
└──────────────────────────┘
            │
            ▼
ESTADO 2: CARREGADO MAS DESABILITADO
┌──────────────────────────┐
│ <button disabled         │
│   style="opacity: 0.6"   │
│   title="Aguarde...">    │
└──────────────────────────┘
            │
            ▼ (quando Firebase ready)
ESTADO 3: HABILITADO
┌──────────────────────────┐
│ <button enabled          │
│   style="opacity: 1"     │
│   title="Login Google">  │
└──────────────────────────┘
            │
            ▼ (quando clicado)
ESTADO 4: PROCESSANDO
┌──────────────────────────┐
│ <button disabled         │
│   innerHTML=             │
│   "Processando...">      │
└──────────────────────────┘
            │
            ├─── Sucesso ───┐
            │               │
            ▼               ▼
ESTADO 5a: SUCESSO    ESTADO 5b: ERRO
┌─────────────────┐   ┌──────────────────┐
│ Redirecionando  │   │ Restaurar botão  │
│ para dashboard  │   │ para estado 3    │
└─────────────────┘   └──────────────────┘
```

## 🎯 PONTOS DE FALHA E SOLUÇÕES

```
PROBLEMA 1: Race Condition
┌────────────────────────────────────────┐
│ Header carrega antes do Firebase      │
├────────────────────────────────────────┤
│ SOLUÇÃO:                               │
│ • Aguardar Firebase inicializar        │
│ • Só então carregar header             │
└────────────────────────────────────────┘

PROBLEMA 2: Escopo de Função
┌────────────────────────────────────────┐
│ enableGoogleButtons() não acessível    │
├────────────────────────────────────────┤
│ SOLUÇÃO:                               │
│ • Criar variável global                │
│ • googleButtonsInitializer = function  │
└────────────────────────────────────────┘

PROBLEMA 3: Evento Perdido
┌────────────────────────────────────────┐
│ firebaseReady dispara antes do listener│
├────────────────────────────────────────┤
│ SOLUÇÃO:                               │
│ • Verificar window.firebaseReady       │
│ • Habilitar imediatamente se true      │
└────────────────────────────────────────┘

PROBLEMA 4: Domínio Não Autorizado
┌────────────────────────────────────────┐
│ auth/unauthorized-domain               │
├────────────────────────────────────────┤
│ SOLUÇÃO:                               │
│ • Adicionar domínio no Firebase Console│
│ • localhost, 127.0.0.1, produção       │
└────────────────────────────────────────┘
```

## 📈 SEQUÊNCIA DE INICIALIZAÇÃO IDEAL

```
┌──────────────────────────────────────────────────────────┐
│                    TEMPO (ms)                            │
└──────────────────────────────────────────────────────────┘
    0ms ▼ DOM Ready
        ├─ ProConcursosApp.init()
        │
  100ms ├─ initializeFirebase()
        │  ├─ firebase.initializeApp()
        │  ├─ auth = firebase.auth()
        │  └─ db = firebase.firestore()
        │
  300ms ├─ ✅ Firebase ready
        │  └─ Emitir evento "firebaseReady"
        │
  310ms ├─ requestAnimationFrame (aguardar)
        │
  320ms ├─ loadHeader()
        │  ├─ fetch('header.html')
        │  └─ Inserir HTML
        │
  500ms ├─ Header carregado
        │  └─ Evento "headerLoaded"
        │
  510ms ├─ initGoogleAuthButtons()
        │  ├─ Encontrar botões
        │  ├─ Adicionar listeners
        │  ├─ Criar googleButtonsInitializer
        │  └─ Verificar window.firebaseReady
        │
  520ms ├─ ✅ Habilitar botões
        │
  ∞     └─ Aguardar interação do usuário
        
USUÁRIO CLICA ▼
        │
    0ms ├─ Evento click
        ├─ preventDefault()
        └─ loginWithGoogle()
            │
   10ms ├─ Verificações
        │  ├─ Firebase SDK?
        │  ├─ Auth disponível?
        │  └─ DB disponível?
        │
   20ms ├─ Criar GoogleAuthProvider
        ├─ Configurar scopes
        └─ signInWithPopup()
        │
  500ms ├─ Popup Google abre
        │
    ∞   └─ Aguardar usuário selecionar conta
        
USUÁRIO SELECIONA CONTA ▼
        │
  100ms ├─ ✅ Resultado recebido
        ├─ Verificar userDoc
        ├─ Criar/atualizar Firestore
        └─ Redirecionar
```

## 🧩 DEPENDÊNCIAS

```
┌─────────────────────────────────────────────┐
│              Firebase SDK                   │
│  (firebase-app, firebase-auth, firestore)   │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Firebase Config (API Key)           │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│       FirebaseManager (ProApp)              │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Evento "firebaseReady"              │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│            header.html                      │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      initGoogleAuthButtons()                │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│    googleButtonsInitializer (global)        │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Botões Habilitados ✅               │
└─────────────────────────────────────────────┘
```

## 🎨 ESTADOS VISUAIS DO BOTÃO

```
ESTADO: CARREGANDO
┌────────────────────────────────────┐
│ [   ]  Aguarde, inicializando...  │
│  ↳ disabled=true, opacity=0.6     │
└────────────────────────────────────┘

ESTADO: PRONTO
┌────────────────────────────────────┐
│ [ G ]  Continuar com Google        │
│  ↳ enabled, opacity=1, cursor=ptr  │
└────────────────────────────────────┘

ESTADO: PROCESSANDO
┌────────────────────────────────────┐
│ [⟳]  Processando...                │
│  ↳ disabled=true, spinner visível  │
└────────────────────────────────────┘

ESTADO: ERRO
┌────────────────────────────────────┐
│ [⚠]  Erro. Tente novamente.        │
│  ↳ enabled, cor vermelha           │
└────────────────────────────────────┘
```

---

**Legenda:**
- `▼` = Próximo passo
- `├─` = Ramificação
- `✅` = Sucesso
- `❌` = Erro
- `⟳` = Processando
- `⚠` = Aviso

---

**Este fluxograma deve ser lido em conjunto com:**
- `PLANO_CORRECAO_LOGIN_GOOGLE.md` (detalhes técnicos)
- `RESUMO_CORRECAO_LOGIN.md` (passos práticos)

