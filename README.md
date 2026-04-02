# Gestor

Aplicação web SaaS para gestão visual de projetos e atividades em formato Kanban, com foco em produtividade, UX corporativa e arquitetura frontend escalável.

## Visão geral

O **Gestor** permite organizar projetos por boards independentes, com **raias dinâmicas** e movimentação de atividades via drag and drop.

Referências de experiência: Jira, Linear, Trello e ClickUp, com adaptação para um fluxo direto e legível para equipes brasileiras.

## Principais funcionalidades

- Gestão de projetos:
  - criar, editar, definir projeto principal e excluir projeto
  - acesso rápido ao board de cada projeto
- Board por projeto:
  - raias dinâmicas (criar, renomear, excluir, reordenar)
  - cards de atividade com drag and drop entre raias
  - ordenação de atividades dentro da mesma raia
- Atividades:
  - criação e edição em drawer lateral
  - campos completos (título, descrição, prioridade, status, responsável, prazo)
  - etiquetas com cor personalizada
  - checklist e comentários mockados
  - exclusão com modal de confirmação
- Filtros:
  - filtro rápido por responsável no topo do board
- Layout e UX:
  - sidebar responsiva (expandida/recolhida)
  - tema claro/escuro com persistência local
  - componentes visuais reutilizáveis
- Persistência local:
  - armazenamento via `localStorage`
  - seed inicial automático com dados mockados

## API backend (Node + Express + SQLite)

Agora o projeto também possui uma API REST em `backend/` para suportar a evolução do frontend para modo cliente-servidor.

- Stack:
  - Node.js
  - Express
  - SQLite
- Banco:
  - arquivo local em `backend/dados.db`
  - criação automática de schema + seed inicial
- Cobertura REST:
  - usuários
  - projetos (CRUD + principal)
  - raias (CRUD + reordenação)
  - atividades (CRUD + checklist + comentários + reordenação)

## Stack e tecnologias

- Angular 21 (Standalone Components)
- TypeScript
- Angular Signals
- Angular CDK (drag and drop)
- Reactive Forms
- Tailwind CSS
- Persistência local (localStorage)

## Arquitetura do projeto

Estrutura baseada em separação por camadas e features:

```text
src/app
├─ core
│  └─ services
├─ features
│  ├─ dashboard
│  ├─ projetos
│  ├─ board
│  └─ atividades
├─ layout
│  ├─ shell
│  └─ sidebar
├─ models
├─ services
└─ shared
   └─ ui
```

## Design system interno

Tokens e padrões visuais centralizados em:

- `src/styles/tokens.css`
- `src/styles/tailwind.css`

Componentes compartilhados em `src/app/shared/ui`, incluindo:

- botão
- input/campo de texto
- seletor
- badge
- avatar
- card
- drawer
- estado vazio/carregamento
- diálogo de confirmação

## Dados e persistência

A aplicação funciona sem backend real neste estágio.

- Serviços de domínio persistem dados no `localStorage`.
- Prefixo atual das chaves: `gestor:*`
- Seed inicial gerado por `DadosMockService`.

## Requisitos

- Node.js 22+
- npm 10+

## Como executar localmente

1. Instalar dependências:

```bash
npm install
```

2. Rodar ambiente de desenvolvimento:

```bash
npm start
```

3. Acessar no navegador:

```text
http://localhost:4200
```

### Executar API local

1. Instalar dependências da API:

```bash
npm run api:install
```

2. Subir API:

```bash
npm run api:start
```

3. Endpoint base:

```text
http://localhost:3333/api
```

## Scripts disponíveis

- `npm start`: sobe o servidor de desenvolvimento
- `npm run build`: gera build de produção
- `npm run watch`: build em modo watch
- `npm test`: executa testes
- `npm run api:install`: instala dependências do backend
- `npm run api:start`: inicia API backend
- `npm run api:dev`: inicia API backend em modo watch

## Build de produção

```bash
npm run build
```

Saída em:

```text
dist/gestor
```

## Repositório remoto

- GitHub: [dlemosdev/gestor-web](https://github.com/dlemosdev/gestor-web)
- Branch principal: `main`

## Convenções de código

- Nomenclatura orientada a PT-BR em serviços, métodos e domínio de negócio.
- Componentes standalone e foco em reutilização.
- Evitar lógica complexa em template; priorizar `computed`/signals e serviços.

## Roadmap recomendado

- Integração com backend REST
- Autenticação/autorização
- Histórico/auditoria de mudanças
- Filtros avançados por etiquetas e período
- Métricas e relatórios operacionais

## Licença

Uso interno/projeto privado (ajustar conforme política da organização).
