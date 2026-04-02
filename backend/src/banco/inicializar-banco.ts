import { randomUUID } from 'node:crypto';

import { executar, obter } from './conexao';
import { agoraIso } from '../util/serializacao';

interface DadosIniciaisProjeto {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  principal: number;
  status: 'ATIVO' | 'INATIVO';
}

interface DadosIniciaisRaia {
  id: string;
  projetoId: string;
  nome: string;
  ordem: number;
}

interface DadosIniciaisAtividade {
  id: string;
  projetoId: string;
  raiaId: string;
  titulo: string;
  descricao: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  status: 'BACKLOG' | 'EM_ANDAMENTO' | 'BLOQUEADA' | 'CONCLUIDA';
  responsavel: string;
  prazo: string;
  etiquetas: unknown[];
  checklist: unknown[];
  comentarios: unknown[];
  ordem: number;
}

export async function criarTabelas(): Promise<void> {
  await executar('PRAGMA foreign_keys = ON');

  await executar(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL,
      iniciais TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    )
  `);

  await executar(`
    CREATE TABLE IF NOT EXISTS projetos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT NOT NULL,
      cor TEXT,
      principal INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    )
  `);

  await executar(`
    CREATE TABLE IF NOT EXISTS raias (
      id TEXT PRIMARY KEY,
      projeto_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      cor TEXT,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE
    )
  `);

  await executar(`
    CREATE TABLE IF NOT EXISTS atividades (
      id TEXT PRIMARY KEY,
      projeto_id TEXT NOT NULL,
      raia_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      prioridade TEXT NOT NULL,
      status TEXT NOT NULL,
      responsavel TEXT NOT NULL,
      prazo TEXT NOT NULL,
      etiquetas_json TEXT NOT NULL,
      checklist_json TEXT NOT NULL,
      comentarios_json TEXT NOT NULL,
      ordem INTEGER NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      FOREIGN KEY (projeto_id) REFERENCES projetos(id) ON DELETE CASCADE,
      FOREIGN KEY (raia_id) REFERENCES raias(id) ON DELETE CASCADE
    )
  `);
}

export async function seedInicial(): Promise<void> {
  const projetoExistente = await obter<{ id: string }>('SELECT id FROM projetos LIMIT 1');

  if (projetoExistente) {
    return;
  }

  const agora = agoraIso();

  const usuarios = [
    { id: 'usuario-ana', nome: 'Ana Paula', email: 'ana.paula@empresa.com', iniciais: 'AP' },
    { id: 'usuario-bruno', nome: 'Bruno Costa', email: 'bruno.costa@empresa.com', iniciais: 'BC' },
    { id: 'usuario-carla', nome: 'Carla Souza', email: 'carla.souza@empresa.com', iniciais: 'CS' },
    { id: 'usuario-diego', nome: 'Diego Lima', email: 'diego.lima@empresa.com', iniciais: 'DL' },
  ];

  for (const usuario of usuarios) {
    await executar(
      `INSERT INTO usuarios (id, nome, email, iniciais, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [usuario.id, usuario.nome, usuario.email, usuario.iniciais, agora, agora],
    );
  }

  const projetos: DadosIniciaisProjeto[] = [
    {
      id: 'projeto-portal-corporativo',
      nome: 'Portal Corporativo',
      descricao: 'Evolução do portal institucional com board visual por raias dinâmicas.',
      cor: '#2563eb',
      principal: 1,
      status: 'ATIVO',
    },
    {
      id: 'projeto-app-comercial',
      nome: 'Aplicativo Comercial',
      descricao: 'Organização das iniciativas mobile para o ciclo Q2.',
      cor: '#0ea5e9',
      principal: 0,
      status: 'ATIVO',
    },
    {
      id: 'projeto-migracao-crm',
      nome: 'Migração CRM',
      descricao: 'Planejamento técnico e acompanhamento da migração de dados de vendas.',
      cor: '#6366f1',
      principal: 0,
      status: 'ATIVO',
    },
  ];

  for (const projeto of projetos) {
    await executar(
      `INSERT INTO projetos (id, nome, descricao, cor, principal, status, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projeto.id, projeto.nome, projeto.descricao, projeto.cor, projeto.principal, projeto.status, agora, agora],
    );
  }

  const raias: DadosIniciaisRaia[] = [
    { id: 'raia-backlog', projetoId: 'projeto-portal-corporativo', nome: 'Backlog', ordem: 1 },
    { id: 'raia-andamento', projetoId: 'projeto-portal-corporativo', nome: 'Em andamento', ordem: 2 },
    { id: 'raia-bloqueada', projetoId: 'projeto-portal-corporativo', nome: 'Bloqueadas', ordem: 3 },
    { id: 'raia-concluida', projetoId: 'projeto-portal-corporativo', nome: 'Concluídas', ordem: 4 },
  ];

  for (const raia of raias) {
    await executar(
      `INSERT INTO raias (id, projeto_id, nome, ordem, cor, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [raia.id, raia.projetoId, raia.nome, raia.ordem, null, agora, agora],
    );
  }

  const atividades: DadosIniciaisAtividade[] = [
    {
      id: 'atividade-backlog-1',
      projetoId: 'projeto-portal-corporativo',
      raiaId: 'raia-backlog',
      titulo: 'Mapear backlog técnico inicial',
      descricao: 'Levantamento de histórias e alinhamento com arquitetura frontend.',
      prioridade: 'ALTA',
      status: 'BACKLOG',
      responsavel: 'Ana Paula',
      prazo: '2026-04-04',
      etiquetas: [
        { nome: 'Arquitetura', cor: '#2563EB' },
        { nome: 'Planejamento', cor: '#7C3AED' },
      ],
      checklist: [
        { id: 'check-1', titulo: 'Refinar escopo', concluido: true },
        { id: 'check-2', titulo: 'Validar com produto', concluido: false },
      ],
      comentarios: [
        {
          id: randomUUID(),
          atividadeId: 'atividade-backlog-1',
          usuarioId: 'Bruno Costa',
          texto: 'Precisamos incluir riscos de integração com autenticação.',
          criadoEm: agora,
        },
      ],
      ordem: 1,
    },
  ];

  for (const atividade of atividades) {
    await executar(
      `INSERT INTO atividades (
        id, projeto_id, raia_id, titulo, descricao, prioridade, status,
        responsavel, prazo, etiquetas_json, checklist_json, comentarios_json,
        ordem, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        atividade.id,
        atividade.projetoId,
        atividade.raiaId,
        atividade.titulo,
        atividade.descricao,
        atividade.prioridade,
        atividade.status,
        atividade.responsavel,
        atividade.prazo,
        JSON.stringify(atividade.etiquetas),
        JSON.stringify(atividade.checklist),
        JSON.stringify(atividade.comentarios),
        atividade.ordem,
        agora,
        agora,
      ],
    );
  }
}

export async function inicializarBanco(): Promise<void> {
  await criarTabelas();
  await seedInicial();
}
