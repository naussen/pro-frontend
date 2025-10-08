# PLANO DE MIGRAÇÃO PARA REACT - PRO CONCURSOS

## 📋 CONTEXTO E OBJETIVOS

### Sistema Atual
- **Frontend**: HTML/CSS/JS vanilla com 2.851 linhas em arquivo único
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Estado**: Funcional em produção (proconcursos.com.br)
- **Problema**: Falta validação de assinatura, arquitetura monolítica

### Objetivos da Migração
1. **Segurança**: Implementar validação de assinatura adequada
2. **Escalabilidade**: Arquitetura componentizada e modular
3. **Manutenibilidade**: Código organizado e testável
4. **Performance**: Otimizações de carregamento e bundle

## 🚨 REGRAS CRÍTICAS PARA O AGENTE

1. **NUNCA quebrar o sistema em produção**
2. **SEMPRE manter backup funcional do código atual**
3. **Implementar mudanças incrementais e testáveis**
4. **Priorizar correções de segurança antes de refatoração**
5. **Manter compatibilidade com Firebase existente**
6. **Preservar todas as funcionalidades atuais**

## 📅 CRONOGRAMA DE EXECUÇÃO

### FASE 1: CORREÇÃO DE SEGURANÇA CRÍTICA (1-2 dias)
**Prioridade: URGENTE**

#### 1.1 Implementar Validação de Assinatura
```bash
# Arquivos a modificar:
- saladeestudos.html (linha ~1550-1565)
- Adicionar verificação is_subscriber no setupAuth()
```

**Tarefas:**
1. Modificar função `setupAuth()` para verificar `is_subscriber`
2. Adicionar redirecionamento para pagamento se não assinante
3. Implementar verificação contínua de status de assinatura
4. Testar com usuários sem assinatura

**Código a implementar:**
```javascript
// Em setupAuth(), após linha 1558
const userDoc = await this.db.collection('users').doc(user.uid).get();
const userData = userDoc.data();

if (!userData?.is_subscriber) {
    console.log('❌ Usuário sem assinatura ativa');
    window.location.href = 'pagamento.html';
    return;
}
```

#### 1.2 Proteger Rotas Sensíveis
1. Adicionar middleware de verificação em todas as funções de carregamento
2. Validar assinatura antes de `loadUserCourses()`, `loadAllCourses()`
3. Implementar timeout de sessão

### FASE 2: PREPARAÇÃO PARA REACT (3-5 dias)

#### 2.1 Estruturação do Projeto
```bash
# Criar estrutura paralela (não substituir ainda)
mkdir pro-frontend-react
cd pro-frontend-react
npx create-react-app . --template typescript
```

#### 2.2 Configuração Inicial
**Dependências necessárias:**
```json
{
  "firebase": "^10.12.2",
  "react-router-dom": "^6.0.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "styled-components": "^6.0.0",
  "react-query": "^3.39.0"
}
```

#### 2.3 Migração de Estilos
1. Converter CSS para styled-components ou CSS modules
2. Preservar variáveis CSS existentes (tema claro/escuro)
3. Manter responsividade atual

### FASE 3: COMPONENTES CORE (5-7 dias)

#### 3.1 Estrutura de Componentes
```
src/
├── components/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── PomodoroTimer.tsx
│   │   └── ThemeToggle.tsx
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── CourseTree.tsx
│   │   └── ScrollIndicator.tsx
│   ├── Content/
│   │   ├── LessonViewer.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   └── Auth/
│       ├── AuthGuard.tsx
│       └── SubscriptionGuard.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useFirebase.ts
│   └── useSubscription.ts
├── services/
│   ├── firebase.ts
│   ├── auth.service.ts
│   └── content.service.ts
└── store/
    ├── authSlice.ts
    ├── contentSlice.ts
    └── store.ts
```

#### 3.2 Migração por Componente
**Ordem de prioridade:**
1. **AuthGuard** - Validação de autenticação/assinatura
2. **Header** - Navegação e funcionalidades globais
3. **Sidebar** - Árvore de cursos e navegação
4. **LessonViewer** - Exibição de conteúdo
5. **PomodoroTimer** - Funcionalidade adicional

### FASE 4: MIGRAÇÃO DE LÓGICA (7-10 dias)

#### 4.1 Serviços Firebase
```typescript
// services/firebase.ts
export const firebaseConfig = {
  // Mover configuração para variáveis de ambiente
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  // ... outras configurações
};

// services/auth.service.ts
export class AuthService {
  async validateSubscription(uid: string): Promise<boolean> {
    // Implementar validação robusta
  }
}
```

#### 4.2 Estado Global (Redux)
```typescript
// store/authSlice.ts
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hasActiveSubscription: boolean;
  loading: boolean;
}

// store/contentSlice.ts
interface ContentState {
  courses: Course[];
  currentLesson: Lesson | null;
  loading: boolean;
  cache: Map<string, any>;
}
```

#### 4.3 Hooks Customizados
```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  // Lógica de autenticação e validação de assinatura
};

// hooks/useSubscription.ts
export const useSubscription = () => {
  // Verificação contínua de status de assinatura
};
```

### FASE 5: TESTES E VALIDAÇÃO (3-5 dias)

#### 5.1 Ambiente de Teste
1. Configurar ambiente de desenvolvimento paralelo
2. Implementar testes unitários para componentes críticos
3. Testes de integração com Firebase
4. Testes de validação de assinatura

#### 5.2 Migração de Dados
1. Verificar compatibilidade com estrutura Firestore atual
2. Testar carregamento de conteúdo do Storage
3. Validar funcionalidades do header (Pomodoro, tema, etc.)

### FASE 6: DEPLOY GRADUAL (2-3 dias)

#### 6.1 Deploy Paralelo
1. Configurar build de produção otimizado
2. Deploy em subdomínio (beta.proconcursos.com.br)
3. Testes com usuários beta

#### 6.2 Migração Final
1. Backup completo do sistema atual
2. Deploy da versão React
3. Monitoramento de erros
4. Rollback se necessário

## 🛠️ COMANDOS ESPECÍFICOS PARA O AGENTE

### Fase 1 - Correção Imediata
```bash
# 1. Backup do arquivo atual
cp saladeestudos.html saladeestudos.html.backup

# 2. Implementar validação de assinatura
# Modificar setupAuth() conforme especificado acima

# 3. Testar e commit
git add .
git commit -m "feat: adicionar validação de assinatura crítica"
git push origin main
```

### Fase 2 - Setup React
```bash
# 1. Criar projeto React em paralelo
mkdir ../pro-frontend-react
cd ../pro-frontend-react
npx create-react-app . --template typescript

# 2. Instalar dependências
npm install firebase react-router-dom @reduxjs/toolkit react-redux styled-components

# 3. Configurar estrutura de pastas
mkdir -p src/{components,hooks,services,store}
```

### Fase 3-6 - Implementação Incremental
```bash
# Para cada componente migrado:
# 1. Implementar componente
# 2. Testar funcionalidade
# 3. Commit incremental
git add .
git commit -m "feat: migrar componente [NOME_COMPONENTE]"
git push origin main
```

## 🔍 PONTOS DE ATENÇÃO CRÍTICOS

### Segurança
- [ ] Validação de assinatura implementada
- [ ] Variáveis de ambiente configuradas
- [ ] Rotas protegidas adequadamente
- [ ] Timeout de sessão implementado

### Funcionalidades
- [ ] Todas as funcionalidades atuais preservadas
- [ ] Responsividade mantida
- [ ] Performance igual ou melhor
- [ ] Compatibilidade com Firebase

### Qualidade
- [ ] Código componentizado e limpo
- [ ] Testes implementados
- [ ] Documentação atualizada
- [ ] Build otimizado

## 🚀 CRITÉRIOS DE SUCESSO

1. **Sistema atual mantido funcionando durante toda migração**
2. **Validação de assinatura implementada e testada**
3. **Aplicação React funcional com todas as features**
4. **Performance igual ou superior ao sistema atual**
5. **Código modular e manutenível**
6. **Deploy sem downtime**

## 📞 PROTOCOLO DE EMERGÊNCIA

Se algo der errado durante a migração:

1. **Parar imediatamente a operação**
2. **Restaurar backup do sistema anterior**
3. **Verificar logs de erro**
4. **Reportar problema detalhadamente**
5. **Aguardar nova instrução antes de continuar**

---

**⚠️ LEMBRETE FINAL**: Este é um sistema em produção com usuários reais. Toda mudança deve ser testada e validada antes do deploy. A segurança e estabilidade são prioridades absolutas.
