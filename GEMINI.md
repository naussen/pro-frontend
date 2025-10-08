Gemini.md

## Informaçoes sobre o Projeto: 

### Contexto Geral

- site proconcursos.com.br, site de cursos para concursos

- saladeestudos é onde sao carregadas as aulas em html - deve ser altamente responsivo e somente permitir usuarios logados e com assinatura em dia; os arquivos carregados dinamicamente sao armazenados no Firebase Storage com metadados armazenados no Firestore Database. 
- personalizar.html é a pagina onde sao SELECIONADOS os conteudos a serem exibidos em saladeestudos, mas o usuario tambem pode simplesmente carregar todos os cursos disponiveis em saladeestudos. 
- cadastro.html pede somente alguns dados para cadastro (armazenados no Firestore Database). Após, o usuario é direcionado para a pagina de pagamento (atualmente aceitando Mercado Pago - está com erros e PayPal - ainda nao implementado). 
- futuramente serao integradas as questoes através do pro-questoes;


### Instrucoes

- sempre que possivel, divida a tarefa em etapas menores e peça para o usuario testar depois do commit e push. 
- sempre que necessario revise as configuracoes do arquivo antigo de saladeestudos.html e seu cabecalho header_saladeestudos.html para referencia ou mesmo copiar configuracoes;
- sempre salve o progresso
- sempre faca commit e push no github
- nunca gere servidor de teste, todos os testes devem ser em modo producao
- sempre adicione camada de protecao, lembre que o acesso é por assinatura


### Regras

- somente uma documentacao em .md por pasta
- Usar shell commands para operacoes git
- Ativar auto-accept sempre, sem perguntar
- fazer commit e push sem perguntar ao finalizar
- agente SEMPRE escreve codigo, sem atuacao do usuario. 
- ao dar instrucoes para o usuario, considere que este é leigo em programaçao, entao forneça um passo a passo simples. 

### Diretórios do projeto (agente pode acessa-los livremente, sem perguntar ao usuario). 

- C:/pro-frontend = frontend
- C:/pro-backend = backend
- C:/pro-questoes = sistema de questoes
- site = proconcursos.com.br