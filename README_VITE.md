# 🚀 PRO Concursos - Frontend com Vite

Plataforma de estudos para concursos públicos desenvolvida com **Vite** para máxima performance e experiência de desenvolvimento excepcional.

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Git**

## 🛠️ Instalação e Configuração

### 1. Clone e instale dependências

```bash
# Clone o repositório
git clone <repository-url>
cd pro-frontend-copia

# Instale as dependências
npm install
```

### 2. Configuração do Firebase (Produção)

Para funcionalidades completas, configure as variáveis de ambiente:

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure suas chaves do Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Scripts Disponíveis

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento com hot reload
npm run dev

# Servidor será acessível em: http://localhost:3000
```

### Build e Produção

```bash
# Build otimizado para produção
npm run build

# Preview do build local
npm run preview

# Build + preview em sequência
npm run serve

# Análise do bundle (tamanho dos arquivos)
npm run analyze
```

### Utilitários

```bash
# Limpar build anterior
npm run clean

# Limpar e fazer build limpo
npm run clean:build
```

## 🏗️ Arquitetura do Projeto

```
pro-frontend-copia/
├── 📄 *.html                 # Páginas HTML (Multi-Page App)
├── 🎨 styles/               # CSS modular
│   ├── main.css            # Estilos globais
│   └── saladeestudos.css   # Estilos específicos
├── 📜 scripts/             # JavaScript modular
│   └── saladeestudos.js    # Lógica da sala de estudos
├── 🔧 vite.config.js       # Configuração Vite
├── 📱 manifest.json        # PWA Manifest
├── 📦 package.json         # Dependências e scripts
└── 🗂️ netlify/             # Functions serverless
    └── functions/
```

## ⚡ Funcionalidades do Vite Configurado

### 🔥 Desenvolvimento Rápido
- **Hot Module Replacement (HMR)** - Atualização instantânea
- **ES6 Modules** nativo - Sem bundling desnecessário
- **Source Maps** - Debug facilitado
- **Auto-abertura** no navegador

### 📦 Build Otimizado
- **Code Splitting** inteligente por página
- **Tree Shaking** automático
- **Minificação** com esbuild (ultrarápido)
- **Compressão** automática de assets
- **Chunks separados** para Firebase e outras libs

### 🎯 Multi-Page Application (MPA)
Configurado para múltiplas páginas HTML:
- `index.html` - Página inicial
- `saladeestudos.html` - Sala de estudos
- `cadastro.html` - Cadastro de usuários
- `pagamento.html` - Sistema de pagamentos
- E muitas outras...

## 🔧 Configurações Avançadas

### Vite Config (vite.config.js)

```javascript
export default defineConfig({
  // Servidor de desenvolvimento
  server: {
    port: 3000,
    host: true,
    open: true
  },

  // Build para múltiplas páginas
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        saladeestudos: 'saladeestudos.html',
        // ... outras páginas
      }
    }
  }
})
```

### Otimizações Implementadas

- ✅ **Lazy Loading** automático
- ✅ **CSS Code Splitting** por página
- ✅ **Asset Optimization** (imagens, fonts)
- ✅ **Service Worker** preparado
- ✅ **PWA Ready** com manifest

## 🚀 Deploy

### Netlify (Recomendado)

O projeto está configurado para deploy automático no Netlify:

```bash
# Build command
npm run build

# Publish directory
dist/
```

### Outros Platforms

Para Vercel, Railway, ou outros:
```bash
npm run build
# Deploy a pasta `dist/`
```

## 🐛 Debugging e Desenvolvimento

### Console Logs
```javascript
// Em desenvolvimento
if (__DEV__) {
  console.log('Modo desenvolvimento');
}

// Em produção
if (__PROD__) {
  // Analytics, error tracking, etc.
}
```

### Análise de Bundle
```bash
npm run analyze
```
Mostra tamanho detalhado de cada chunk e dependências.

## 📱 PWA (Progressive Web App)

### Funcionalidades Preparadas
- ✅ **Manifest** configurado
- ✅ **Service Worker** base implementado
- ✅ **Offline-first** architecture
- ✅ **Installable** no mobile/desktop

### Próximos Passos PWA
1. Implementar cache strategies
2. Background sync para dados
3. Push notifications
4. App shortcuts

## 🔒 Segurança

- ✅ **CSP Headers** configurados
- ✅ **HTTPS Only** forçado
- ✅ **Firebase Security Rules** implementadas
- ✅ **Input sanitization** aplicada

## 📊 Performance

### Métricas Esperadas
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: > 90
- **Bundle Size**: < 500KB (gzipped)

### Otimizações Ativas
- ✅ **Critical CSS** inlining
- ✅ **Font loading** otimizado
- ✅ **Image optimization** automática
- ✅ **Lazy loading** de componentes

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Scripts de Desenvolvimento

```bash
# Desenvolvimento completo
npm run dev

# Build para produção
npm run build

# Teste local do build
npm run preview

# Análise de performance
npm run analyze
```

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/nvp-concursos/frontend/issues)
- **Docs**: [Documentação Interna](./docs/)
- **Wiki**: [Wiki do Projeto](https://github.com/nvp-concursos/frontend/wiki)

---

**Desenvolvido com ❤️ por NVP Concursos**

*Para mais informações, consulte a documentação completa ou abra uma issue.*
