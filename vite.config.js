import { defineConfig } from 'vite';
import { copyFileSync } from 'fs';
import { join } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
    // 2. Adiciona configuração de compressão/minificação com esbuild (padrão e mais rápido)
    // Para usar 'terser', defina como 'terser'. 'esbuild' é geralmente mais rápido.
    minify: 'esbuild', 
    // Opções para terser seriam especificadas aqui se 'minify: 'terser'' fosse escolhido:
    // terserOptions: {
    //   compress: {
    //     drop_console: true,
    //     drop_debugger: true,
    //   },
    // },
    
    rollupOptions: {
      input: {
        // Páginas principais do MPA
        main: 'index.html',
        saladeestudos: 'saladeestudos.html',
        cadastro: 'cadastro.html',
        pagamento: 'pagamento.html',
        personalizar: 'personalizar.html',
        meucadastro: 'meucadastro.html',
        'email-verificado': 'email-verificado.html',
        exclusaodados: 'exclusaodados.html',
        'politica-privacidade': 'politica-privacidade.html',
        'administracao-financeira-orcamentaria': 'administracao-financeira-orcamentaria.html',
        'direito-administrativo': 'direito-administrativo.html'
      },
      output: {
        assetFileNames: (assetInfo) => {
          // Mantém nomes originais para imagens específicas
          if (assetInfo.name === 'fundo.png' || assetInfo.name === 'study-draw.png' || assetInfo.name === 'saladeestudos.png') {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        // 1. Configura Code Splitting manual para separar vendor e react
        manualChunks(id) {
          // Separa todos os módulos de node_modules
          if (id.includes('node_modules')) {
            // Cria um chunk específico para React e bibliotecas relacionadas
            if (id.includes('@react') || id.includes('react/') || id.includes('react-dom')) {
              return 'react';
            }
            // Cria um chunk geral para outras dependências de node_modules
            return 'vendor';
          }
          // Você pode adicionar mais regras aqui para outros módulos específicos, se necessário.
          // Exemplo: if (id.includes('some-large-library')) { return 'large-lib'; }
        },
        // Opcional: para ter mais controle sobre os nomes dos arquivos de chunk gerados
        // chunkFileNames: 'assets/js/[name]-[hash].js',
        // entryFileNames: 'assets/js/[name]-[hash].js'
      }
    }
  },

  publicDir: '.',

  plugins: [
    {
      name: 'copy-static-files',
      generateBundle() {
        const filesToCopy = [
          'header.html',
          'header_saladeestudos.html'
        ];

        filesToCopy.forEach(file => {
          try {
            const srcPath = join(process.cwd(), file);
            const destPath = join('dist', file);
            copyFileSync(srcPath, destPath);
            console.log(`✅ Copied ${file} to dist/`);
          } catch (error) {
            console.warn(`⚠️ Failed to copy ${file}:`, error.message);
          }
        });
      }
    }
  ]
});
