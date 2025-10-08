# Plano de Migração para React: Sala de Estudos

**Objetivo:** Substituir a implementação legada da `saladeestudos.html` por uma aplicação moderna, performática e de fácil manutenção, utilizando React, Vite e TypeScript. A nova aplicação será baseada na UI e funcionalidades dos arquivos em `/backup_20251004_235415/`.

---

### Estratégia Geral

1.  **Setup do Ambiente:** Inicializar um novo projeto Vite/React/TypeScript dentro do diretório atual.
2.  **Componentização:** Quebrar a UI de `saladeestudos_original.html` e `header_saladeestudos_original.html` em componentes React reutilizáveis.
3.  **Estilização:** Migrar os estilos CSS, mantendo a identidade visual do layout original.
4.  **Lógica e Estado:** Portar a lógica de autenticação e busca de dados para o React, utilizando hooks (`useState`, `useEffect`, `useContext`) e um serviço dedicado para o Firebase.
5.  **Build:** Configurar o Vite para gerar o `saladeestudos.html` final e seus assets com o prefixo `sala-`.

---

### Passos Detalhados

**Passo 1: Configuração do Ambiente (Concluído)**

1.  `package.json` inicializado.
2.  Dependências do React e Vite instaladas.
3.  Estrutura de pastas (`src/`, `components/`, etc.) criada.
4.  Arquivos de configuração (`vite.config.ts`, `tsconfig.json`) criados.
5.  Ponto de entrada da aplicação (`vite.index.html`, `src/main.tsx`) criado.

**Passo 2: Migração da Estrutura e Estilos**

1.  **Extrair CSS:** Combinar todo o conteúdo das tags `<style>` de `saladeestudos_original.html` e `header_saladeestudos_original.html` em um único arquivo: `src/sala-styles.css`.
2.  **Criar Componentes (Estrutura):**
    *   Criar `src/components/Header.tsx`.
    *   Criar `src/components/Sidebar.tsx`.
    *   Criar `src/components/Content.tsx`.
3.  **Montar Layout Principal (`src/App.tsx`):**
    *   Substituir o conteúdo do `App.tsx` pela estrutura de layout principal de `saladeestudos_original.html`.
    *   Importar e renderizar os componentes `Header`, `Sidebar` e `Content` em seus respectivos lugares.

**Passo 3: Implementação dos Componentes Visuais**

1.  **Componente `Header`:**
    *   Copiar o HTML do corpo de `header_saladeestudos_original.html` para o `Header.tsx` e converter para JSX (ex: `class` -> `className`).
    *   Implementar a lógica de UI do header (ex: dropdowns dos menus, toggle de tema) usando o hook `useState`.
2.  **Componente `Sidebar`:**
    *   Copiar a estrutura HTML da sidebar de `saladeestudos_original.html` para `Sidebar.tsx`.
    *   Renderizar uma lista estática de cursos (mock data) para validar o layout.
3.  **Componente `Content`:**
    *   Copiar a estrutura HTML da área de conteúdo principal para `Content.tsx`.
    *   Exibir um estado inicial de "Selecione uma aula".

**Passo 4: Lógica de Dados e Firebase**

1.  **Serviço do Firebase (`src/services/firebaseService.ts`):**
    *   Criar uma classe ou objeto singleton para encapsular a comunicação com o Firebase (inicialização, `auth`, `firestore`).
    *   Manter a configuração do Firebase existente.
    *   Criar métodos para: `onAuthStateChanged`, `signOut`, `loadUserCourses`, `loadLessonContent`.
2.  **Contexto de Autenticação (`src/context/AuthContext.tsx`):**
    *   Criar um React Context para gerenciar o estado de autenticação (`currentUser`).
    *   O `AuthProvider` usará o `firebaseService` para verificar o login e prover o usuário para a aplicação.
    *   Envolver o `App` com o `AuthProvider` em `main.tsx`.
3.  **Proteger Rotas/Componentes:** Usar o `AuthContext` no `App.tsx` para redirecionar para a página de login se não houver usuário, resolvendo o problema de autenticação de forma centralizada.
4.  **Conectar `Sidebar` aos Dados:**
    *   No `Sidebar.tsx`, usar o `AuthContext` para obter o `userId`.
    *   Chamar o método `loadUserCourses` do `firebaseService` para buscar os cursos.
    *   Gerenciar o estado de `loading`, `error` e a lista de cursos com `useState` e renderizar a lista dinamicamente.
5.  **Conectar `Content` aos Dados:**
    *   O `App.tsx` manterá o estado da aula selecionada (`selectedLesson`).
    *   Quando uma aula for clicada na `Sidebar`, um callback passado via props atualizará o estado no `App`.
    *   O `Content.tsx` receberá `selectedLesson` como prop e usará o `firebaseService` para buscar e exibir o conteúdo da aula.

**Passo 5: Finalização e Build**

1.  **Ajustes Finais:** Revisar todas as funcionalidades, incluindo responsividade, tema escuro e interações do usuário, garantindo que correspondam ao comportamento do sistema original do backup.
2.  **Configurar Build Script:** Criar um script `"build:sala"` no `package.json` que executa `vite build --outDir dist/sala --base /sala/` e depois move/renomeia `dist/sala/index.html` para `saladeestudos.html` na raiz.
3.  **Executar Build:** Rodar `npm run build:sala` para gerar os arquivos finais da aplicação.
