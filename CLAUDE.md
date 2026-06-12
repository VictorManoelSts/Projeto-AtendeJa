# AtendeJá — instruções para o Claude

## 1. Contexto do projeto

Sistema de gestão de filas e atendimento médico hospitalar, desenvolvido como trabalho acadêmico. O MVP usa dados mockados no frontend — não há backend nem banco de dados real. O foco da avaliação é interface e regras de negócio.

Cinco áreas de usuário: Paciente, Médico, Enfermeiro, Recepcionista e Administrador.
Cada área tem dashboard e telas próprias. O login é único e redireciona conforme o perfil.

## 2. Stack tecnológica

- React + Vite
- React Router — navegação entre áreas e telas
- Tailwind CSS — estilização via tokens em `src/styles/tokens.css`
- Vitest + Testing Library — testes automatizados (TDD)
- Docker — ambiente de desenvolvimento compartilhado

## 3. Convenções e regras

### Estrutura de pastas
```
src/
  mocks/
    data/        — objetos JS estáticos por entidade
    api/         — funções que retornam Promise.resolve()
    index.js     — exportação central
  pages/         — subpastas por área: paciente, medico, enfermeiro, recepcao, admin
  components/ui/ — componentes reutilizáveis
  styles/
    tokens.css   — variáveis CSS da paleta
  tests/         — arquivos .test.js e .test.jsx
  routes/        — configuração de rotas protegidas por perfil
  contexts/      — AuthContext (autenticação global)
```

### Nomenclatura
- Componentes: PascalCase — `FilaCard.jsx`
- Mocks e utilitários: camelCase — `fila.js`, `getFila`
- Funções mock: verbos em português — `chamarProximo`, `cancelarAgendamento`
- Branches: `feature/nome-da-tela` — `feature/tela-login`, `feature/triagem`

### Mocks
- Nunca buscar dados de API real — sempre importar de `src/mocks/api/`
- Toda função mock retorna `Promise.resolve()` para simular assincronicidade
- Estado de autenticação global em `AuthContext` — nunca em `localStorage`
- WebSocket simulado com `setInterval` — não implementar WebSocket real

### Cores e estilos
- Sempre usar tokens de `tokens.css` — nunca escrever hex diretamente no JSX
- Ler `design.md` para tokens e `components.md` para padrões visuais
- Aplicar sempre o fix de autofill em inputs: `-webkit-box-shadow: 0 0 0 1000px #FFFFFF inset !important`

### Responsividade
- Mobile first — começar pelo layout mobile e expandir com `sm:`, `md:`, `lg:`, `xl:`
- Sidebar: drawer em mobile, ícones em tablet (56px), expandida em desktop (240px)
- Header fixo de 52px apenas em mobile (`md:hidden`) com hamburguer e sino
- Grids de métricas: 1 coluna → 2 colunas → 3 colunas conforme breakpoint
- Tabelas: `overflow-x-auto` em mobile, colunas secundárias ocultas com `hidden md:table-cell`
- Touch targets mínimos: 44px de altura em botões e links mobile
- Testar em: 375px (mobile), 768px (tablet), 1280px (desktop)

### Regras de negócio críticas
- Fila: máximo 70 pacientes ativos por tipo (AGUARDANDO + CHAMADO + EM_ATENDIMENTO)
- Paciente só pode estar em uma fila ativa por vez
- Timeout de chamada: 5 minutos — após isso, status vira AUSENTE automaticamente
- Prioridade legal (empate de risco): Idoso 80+ → Gestante → Idoso 60–79 → PCD → Normal
- Pulseiras: 1=Vermelha 2=Laranja 3=Amarela 4=Verde 5=Azul — não alterar

## 4. O que não fazer

- Não instalar bibliotecas de UI externas (MUI, Ant Design, Chakra)
- Não criar banco de dados, ORM ou SQL
- Não escrever cores ou espaçamentos fora dos tokens
- Não fazer push para o repositório — apenas `git add` e `git commit`
- Não assinar commits com nome ou e-mail do Claude
- Não renderizar conteúdo de um perfil em área de outro perfil

## 5. Testes — TDD

Ciclo obrigatório para toda nova funcionalidade:
1. Escrever o teste (red — vai falhar)
2. Implementar o mínimo para passar (green)
3. Refatorar mantendo os testes passando (refactor)

### Comandos
```bash
npm run test           # modo watch — usar durante desenvolvimento
npm run test:run       # executa uma vez — usar antes de commitar
npm run test:coverage  # relatório de cobertura em /coverage
```

### No Docker
```bash
docker compose --profile test run --rm test
```

### Thresholds mínimos
- Linhas: 70% | Funções: 70% | Branches: 60%

### O que testar obrigatoriamente
- Toda função em `src/mocks/api/` antes de implementar
- Regras críticas: ordenação da fila, limite de 70, pulseiras, cancelamento
- Componentes com lógica: FilaCard, PulseiraBadge, StatusBadge

## 6. Commits

Claude executa `git add` e `git commit` após cada funcionalidade ou tela nova.
O commit é registrado com as credenciais do integrante configuradas na máquina.
Claude nunca executa `git push` — o integrante revisa e faz o push manualmente.

### Formato da mensagem de commit
```
feat: adiciona tela de login
feat: implementa fila de atendimento — paciente
feat: adiciona triagem com classificação de risco
fix: corrige ordenação de prioridade legal na fila
```
