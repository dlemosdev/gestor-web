import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { Projeto } from '../../../models/projeto.model';
import { AtividadesService } from '../../../services/atividades.service';
import { ProjetosService } from '../../../services/projetos.service';
import { RaiasService } from '../../../services/raias.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';

interface ProjetoComResumo {
  projeto: Projeto;
  totalAtividades: number;
  concluidas: number;
  percentualConcluido: number;
  classesBarraProgresso: string;
}

interface ResumoRaiaDashboard {
  nome: string;
  total: number;
  classesBadge: string;
}

@Component({
  standalone: true,
  imports: [BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <article class="relative overflow-hidden rounded-3xl border border-borda bg-superficie px-6 py-7 shadow-[var(--sombra-card)] sm:px-7">
        <div class="absolute inset-0 opacity-55">
          <div class="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_40%)]"></div>
        </div>

        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cor-texto-terciaria">Painel executivo</p>
            <h2 class="text-2xl font-semibold text-cor-texto sm:text-3xl">Visão consolidada do portfólio</h2>
            <p class="max-w-2xl text-sm leading-6 text-cor-texto-secundaria">
              Acompanhe progresso, gargalos e produtividade dos projetos em um único lugar.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <app-botao-ui texto="Ver projetos" icone="folder" variante="secundario" rota="/projetos" />
            <app-botao-ui texto="Abrir board principal" icone="board" [rota]="rotaBoardPrincipal()" />
          </div>
        </div>
      </article>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Projetos cadastrados</p>
          <p class="mt-3 text-3xl font-semibold text-cor-texto">{{ totalProjetos() }}</p>
          <p class="mt-2 text-xs text-cor-texto-secundaria">{{ totalProjetosComBoard() }} com board configurado</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Atividades totais</p>
          <p class="mt-3 text-3xl font-semibold text-cor-texto">{{ totalAtividades() }}</p>
          <p class="mt-2 text-xs text-cor-texto-secundaria">{{ totalRaias() }} raias mapeadas</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Concluídas</p>
          <p class="mt-3 text-3xl font-semibold text-emerald-400">{{ totalConcluidas() }}</p>
          <p class="mt-2 text-xs text-cor-texto-secundaria">{{ percentualConcluidoGeral() }}% de entrega geral</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Em teste</p>
          <p class="mt-3 text-3xl font-semibold text-amber-300">{{ totalEmTeste() }}</p>
          <p class="mt-2 text-xs text-cor-texto-secundaria">Itens na etapa de validação final</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Aguardando publicação</p>
          <p class="mt-3 text-3xl font-semibold text-sky-300">{{ totalAguardandoPublicacao() }}</p>
          <p class="mt-2 text-xs text-cor-texto-secundaria">Entregas prontas aguardando liberar</p>
        </article>
      </section>

      <section class="grid grid-cols-1 gap-5 xl:grid-cols-[1.8fr_1fr]">
        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <header class="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 class="text-base font-semibold text-cor-texto">Progresso por projeto</h3>
              <p class="text-xs text-cor-texto-secundaria">Acompanhe o avanço real das iniciativas em andamento.</p>
            </div>
          </header>

          <div class="space-y-3.5">
            @for (item of projetosComResumo(); track item.projeto.id) {
              <article class="rounded-2xl border border-borda bg-superficie-secundaria/40 px-4 py-3.5">
                <div class="mb-2.5 flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-cor-texto">{{ item.projeto.nome }}</p>
                    <p class="mt-1 truncate text-xs text-cor-texto-secundaria">{{ item.projeto.descricao }}</p>
                  </div>
                  <div class="shrink-0 text-right">
                    <p class="text-sm font-semibold text-cor-texto">{{ item.percentualConcluido }}%</p>
                    <p class="text-xs text-cor-texto-secundaria">{{ item.concluidas }}/{{ item.totalAtividades }}</p>
                  </div>
                </div>

                <div class="h-2.5 overflow-hidden rounded-full bg-superficie-secundaria">
                  <div class="h-full rounded-full transition-all" [class]="item.classesBarraProgresso" [style.width.%]="item.percentualConcluido"></div>
                </div>

                <div class="mt-3 flex justify-end">
                  <app-botao-ui tamanho="sm" texto="Abrir board" icone="board" [rota]="['/projetos', item.projeto.id, 'board']" />
                </div>
              </article>
            } @empty {
              <article class="rounded-2xl border border-dashed border-borda bg-superficie-secundaria/20 p-8 text-center">
                <p class="text-sm font-semibold text-cor-texto">Nenhum projeto cadastrado</p>
                <p class="mt-1.5 text-xs text-cor-texto-secundaria">Crie um projeto para iniciar o acompanhamento.</p>
              </article>
            }
          </div>
        </article>

        <div class="grid grid-cols-1 gap-5">
          <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
            <h3 class="text-base font-semibold text-cor-texto">Distribuição por raias</h3>
            <p class="mt-1 text-xs text-cor-texto-secundaria">Panorama das 5 etapas padrão do fluxo atual.</p>

            <div class="mt-4 space-y-3">
              @for (resumo of resumoPorRaia(); track resumo.nome) {
                <div class="flex items-center justify-between rounded-xl border border-borda bg-superficie-secundaria/60 px-3 py-2.5">
                  <span class="text-sm text-cor-texto">{{ resumo.nome }}</span>
                  <span class="rounded-lg px-2 py-1 text-xs font-semibold" [class]="resumo.classesBadge">{{ resumo.total }}</span>
                </div>
              }
            </div>
          </article>
        </div>
      </section>
    </section>
  `,
})
export class DashboardPaginaComponent {
  private readonly nomesRaiasPadrao = ['Backlog', 'Em andamento', 'Teste', 'Aguardando publicação', 'Concluídas'] as const;

  private readonly projetosService = inject(ProjetosService);
  private readonly raiasService = inject(RaiasService);
  private readonly atividadesService = inject(AtividadesService);

  readonly projetos = computed(() => this.projetosService.projetos());
  readonly totalProjetos = computed(() => this.projetos().length);
  readonly totalProjetosComBoard = computed(
    () => this.projetos().filter((projeto) => this.projetosService.projetoPossuiBoard(projeto.id)).length,
  );

  readonly totalRaias = computed(() => this.raiasService.raias().length);
  readonly totalAtividades = computed(() => this.atividadesService.atividades().length);

  readonly totalEmTeste = computed(() => this.totalAtividadesPorNomeRaia('Teste'));
  readonly totalAguardandoPublicacao = computed(() => this.totalAtividadesPorNomeRaia('Aguardando publicação'));
  readonly totalConcluidas = computed(() => this.totalAtividadesPorNomeRaia('Concluídas'));
  readonly resumoPorRaia = computed<ResumoRaiaDashboard[]>(() =>
    this.nomesRaiasPadrao.map((nome) => ({
      nome,
      total: this.totalAtividadesPorNomeRaia(nome),
      classesBadge: this.obterClassesBadgeRaia(nome),
    })),
  );

  readonly percentualConcluidoGeral = computed(() => {
    const total = this.totalAtividades();

    if (total === 0) {
      return 0;
    }

    return Math.round((this.totalConcluidas() / total) * 100);
  });

  readonly projetosComResumo = computed<ProjetoComResumo[]>(() =>
    this.projetos()
      .map((projeto) => {
        const atividadesProjeto = this.atividadesService
          .atividades()
          .filter((atividade) => atividade.projetoId === projeto.id);

        const totalAtividades = atividadesProjeto.length;
        const raiasConcluidas = new Set(
          this.raiasService
            .obterRaiasPorProjeto(projeto.id)
            .filter((raia) => this.normalizarNomeRaia(raia.nome) === 'concluidas')
            .map((raia) => raia.id),
        );
        const concluidas = atividadesProjeto.filter((atividade) => raiasConcluidas.has(atividade.raiaId)).length;
        const percentualConcluido = totalAtividades === 0 ? 0 : Math.round((concluidas / totalAtividades) * 100);

        return {
          projeto,
          totalAtividades,
          concluidas,
          percentualConcluido,
          classesBarraProgresso: this.obterClassesBarraProgresso(percentualConcluido),
        };
      })
      .sort((a, b) => b.percentualConcluido - a.percentualConcluido),
  );

  readonly rotaBoardPrincipal = computed(() => {
    const projetoPrincipal = this.projetosService.obterProjetoPrincipal() ?? this.projetos()[0];
    return projetoPrincipal ? ['/projetos', projetoPrincipal.id, 'board'] : '/projetos';
  });

  private totalAtividadesPorNomeRaia(nomeRaia: string): number {
    const raiasIds = new Set(
      this.raiasService
        .raias()
        .filter((raia) => this.normalizarNomeRaia(raia.nome) === this.normalizarNomeRaia(nomeRaia))
        .map((raia) => raia.id),
    );

    return this.atividadesService.atividades().filter((atividade) => raiasIds.has(atividade.raiaId)).length;
  }

  private obterClassesBadgeRaia(nomeRaia: string): string {
    switch (nomeRaia) {
      case 'Backlog':
        return 'border border-borda bg-superficie text-cor-texto';
      case 'Em andamento':
        return 'bg-blue-500/15 text-blue-300';
      case 'Teste':
        return 'bg-amber-500/15 text-amber-300';
      case 'Aguardando publicação':
        return 'bg-sky-500/15 text-sky-300';
      case 'Concluídas':
        return 'bg-emerald-500/15 text-emerald-300';
      default:
        return 'border border-borda bg-superficie text-cor-texto';
    }
  }

  private obterClassesBarraProgresso(percentualConcluido: number): string {
    if (percentualConcluido === 100) {
      return 'bg-emerald-500';
    }

    if (percentualConcluido >= 31) {
      return 'bg-amber-400';
    }

    if (percentualConcluido >= 1) {
      return 'bg-red-500';
    }

    return 'bg-primaria';
  }

  private normalizarNomeRaia(nomeRaia: string): string {
    return nomeRaia.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  }
}
