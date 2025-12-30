#!/usr/bin/env node

/**
 * 🚀 DEPLOY SCRIPT - PRO Concursos
 * Script automatizado para deploy no Netlify
 *
 * Uso:
 *   node scripts/deploy.js [environment]
 *
 * Environments:
 *   - production (padrão)
 *   - staging
 *   - preview
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const environment = args[0] || 'production';

console.log('🚀 Iniciando deploy PRO Concursos...\n');

// Verificar se estamos no diretório correto
if (!fs.existsSync('package.json')) {
  console.error('❌ Erro: Execute este script da raiz do projeto');
  process.exit(1);
}

// Verificar se netlify-cli está instalado
try {
  execSync('netlify --version', { stdio: 'pipe' });
} catch (error) {
  console.log('⚠️  Netlify CLI não encontrado. Instalando...');
  execSync('npm install -g netlify-cli', { stdio: 'inherit' });
}

// Verificar se estamos logados no Netlify
try {
  execSync('netlify status', { stdio: 'pipe' });
} catch (error) {
  console.log('🔐 Você precisa fazer login no Netlify:');
  console.log('   netlify login');
  console.log('\nOu configure NETLIFY_AUTH_TOKEN no .env');
  process.exit(1);
}

console.log(`📦 Ambiente: ${environment.toUpperCase()}`);
console.log('🔨 Executando build...\n');

// Executar build
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n✅ Build concluído!\n');
} catch (error) {
  console.error('\n❌ Erro no build!');
  console.error(error.message);
  process.exit(1);
}

// Verificar se pasta dist foi criada
if (!fs.existsSync('dist')) {
  console.error('❌ Erro: Pasta dist não foi criada');
  process.exit(1);
}

// Deploy baseado no ambiente
let deployCommand;
let deployMessage;

switch (environment) {
  case 'production':
    deployCommand = 'netlify deploy --prod --dir=dist';
    deployMessage = '🌟 Deploy para PRODUÇÃO';
    break;

  case 'staging':
    deployCommand = 'netlify deploy --dir=dist --alias=staging';
    deployMessage = '🧪 Deploy para STAGING';
    break;

  case 'preview':
  default:
    deployCommand = 'netlify deploy --dir=dist';
    deployMessage = '👀 Deploy para PREVIEW';
    break;
}

console.log(`${deployMessage}...`);

// Executar deploy
try {
  const result = execSync(deployCommand, {
    stdio: 'inherit',
    encoding: 'utf8'
  });

  console.log('\n🎉 Deploy realizado com sucesso!');
  console.log('\n📊 Resumo do deploy:');
  console.log(result);

} catch (error) {
  console.error('\n❌ Erro no deploy!');
  console.error('Verifique os logs acima para detalhes.');
  process.exit(1);
}

// Verificar se o site está online
console.log('\n🔍 Verificando se o site está online...');
setTimeout(() => {
  try {
    const status = execSync('netlify status', { encoding: 'utf8' });
    console.log('\n📋 Status do Netlify:');
    console.log(status);
  } catch (error) {
    console.log('⚠️  Não foi possível verificar o status automaticamente');
  }

  console.log('\n🎯 Próximos passos:');
  console.log('1. ✅ Verifique se o site está funcionando');
  console.log('2. ✅ Teste as funcionalidades principais');
  console.log('3. ✅ Verifique os logs no Netlify Dashboard');
  console.log('4. ✅ Configure analytics se necessário');

  console.log('\n✨ Deploy concluído com sucesso!');
}, 3000);
