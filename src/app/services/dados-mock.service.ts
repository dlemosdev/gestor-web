import { Injectable } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { Atividade } from '../models/atividade.model';
import { Prioridade } from '../models/enums/prioridade.enum';
import { StatusAtividade } from '../models/enums/status-atividade.enum';
import { StatusProjeto } from '../models/enums/status-projeto.enum';
import { Projeto } from '../models/projeto.model';
import { Raia } from '../models/raia.model';
import { Usuario } from '../models/usuario.model';

interface DadosIniciais {
  projetos: Projeto[];
  usuarios: Usuario[];
  raias: Raia[];
  atividades: Atividade[];
}

@Injectable({
  providedIn: 'root',
})
export class DadosMockService {
  private readonly chaveProjetos = 'gestor:projetos';
  private readonly chaveUsuarios = 'gestor:usuarios';
  private readonly chaveRaias = 'gestor:raias';
  private readonly chaveAtividades = 'gestor:atividades';
  private readonly chaveSeed = 'gestor:seed:versao';
  private readonly versaoSeed = 'v1';

  constructor(private readonly armazenamentoLocalService: ArmazenamentoLocalService) {}

  garantirDadosIniciais(): void {
    const versaoAtual = this.armazenamentoLocalService.obterItem<string>(this.chaveSeed);

    if (versaoAtual === this.versaoSeed) {
      return;
    }

    const dados = this.criarDadosIniciais();

    this.armazenamentoLocalService.salvarItem(this.chaveProjetos, dados.projetos);
    this.armazenamentoLocalService.salvarItem(this.chaveUsuarios, dados.usuarios);
    this.armazenamentoLocalService.salvarItem(this.chaveRaias, dados.raias);
    this.armazenamentoLocalService.salvarItem(this.chaveAtividades, dados.atividades);
    this.armazenamentoLocalService.salvarItem(this.chaveSeed, this.versaoSeed);
  }

  private criarDadosIniciais(): DadosIniciais {
    const agora = new Date().toISOString();
    const projetoPrincipalId = 'projeto-portal-corporativo';

    const projetos: Projeto[] = [
      {
        id: projetoPrincipalId,
        nome: 'Portal Corporativo',
        descricao: 'Evolução do portal institucional com board visual por raias dinâmicas.',
        cor: '#2563eb',
        principal: true,
        criadoEm: agora,
        atualizadoEm: agora,
        status: StatusProjeto.ATIVO,
      },
      {
        id: 'projeto-app-comercial',
        nome: 'Aplicativo Comercial',
        descricao: 'Organização das iniciativas mobile para o ciclo Q2.',
        cor: '#0ea5e9',
        principal: false,
        criadoEm: agora,
        atualizadoEm: agora,
        status: StatusProjeto.ATIVO,
      },
      {
        id: 'projeto-migracao-crm',
        nome: 'Migração CRM',
        descricao: 'Planejamento técnico e acompanhamento da migração de dados de vendas.',
        cor: '#6366f1',
        principal: false,
        criadoEm: agora,
        atualizadoEm: agora,
        status: StatusProjeto.ATIVO,
      },
    ];

    const usuarios: Usuario[] = [
      { id: 'usuario-ana', nome: 'Ana Paula', email: 'ana.paula@empresa.com', iniciais: 'AP' },
      { id: 'usuario-bruno', nome: 'Bruno Costa', email: 'bruno.costa@empresa.com', iniciais: 'BC' },
      { id: 'usuario-carla', nome: 'Carla Souza', email: 'carla.souza@empresa.com', iniciais: 'CS' },
      { id: 'usuario-diego', nome: 'Diego Lima', email: 'diego.lima@empresa.com', iniciais: 'DL' },
    ];

    const raias: Raia[] = [
      { id: 'raia-backlog', projetoId: projetoPrincipalId, nome: 'Backlog', ordem: 1, criadoEm: agora, atualizadoEm: agora },
      { id: 'raia-andamento', projetoId: projetoPrincipalId, nome: 'Em andamento', ordem: 2, criadoEm: agora, atualizadoEm: agora },
      { id: 'raia-bloqueada', projetoId: projetoPrincipalId, nome: 'Bloqueadas', ordem: 3, criadoEm: agora, atualizadoEm: agora },
      { id: 'raia-concluida', projetoId: projetoPrincipalId, nome: 'Concluídas', ordem: 4, criadoEm: agora, atualizadoEm: agora },
    ];

    const atividades: Atividade[] = [
      {
        id: 'atividade-backlog-1',
        projetoId: projetoPrincipalId,
        raiaId: 'raia-backlog',
        titulo: 'Mapear backlog técnico inicial',
        descricao: 'Levantamento de histórias e alinhamento com arquitetura frontend.',
        prioridade: Prioridade.ALTA,
        status: StatusAtividade.BACKLOG,
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
            id: 'comentario-1',
            atividadeId: 'atividade-backlog-1',
            usuarioId: 'Bruno Costa',
            texto: 'Precisamos incluir riscos de integração com autenticação.',
            criadoEm: agora,
          },
        ],
        ordem: 1,
        criadoEm: agora,
        atualizadoEm: agora,
      },
      {
        id: 'atividade-andamento-1',
        projetoId: projetoPrincipalId,
        raiaId: 'raia-andamento',
        titulo: 'Desenhar protótipo do board',
        descricao: 'Definir hierarquia visual e componentes reutilizáveis.',
        prioridade: Prioridade.MEDIA,
        status: StatusAtividade.EM_ANDAMENTO,
        responsavel: 'Carla Souza',
        prazo: '2026-04-06',
        etiquetas: [
          { nome: 'UX', cor: '#0891B2' },
          { nome: 'Design System', cor: '#16A34A' },
        ],
        checklist: [
          { id: 'check-3', titulo: 'Fluxo principal', concluido: true },
          { id: 'check-4', titulo: 'Fluxo mobile', concluido: false },
        ],
        comentarios: [],
        ordem: 1,
        criadoEm: agora,
        atualizadoEm: agora,
      },
      {
        id: 'atividade-bloqueada-1',
        projetoId: projetoPrincipalId,
        raiaId: 'raia-bloqueada',
        titulo: 'Resolver dependência de API de usuários',
        descricao: 'Aguardando endpoint definitivo para atribuição de responsáveis.',
        prioridade: Prioridade.CRITICA,
        status: StatusAtividade.BLOQUEADA,
        responsavel: 'Diego Lima',
        prazo: '2026-04-02',
        etiquetas: [
          { nome: 'API', cor: '#EA580C' },
          { nome: 'Bloqueio', cor: '#DC2626' },
        ],
        checklist: [],
        comentarios: [],
        ordem: 1,
        criadoEm: agora,
        atualizadoEm: agora,
      },
    ];

    return { projetos, usuarios, raias, atividades };
  }
}


