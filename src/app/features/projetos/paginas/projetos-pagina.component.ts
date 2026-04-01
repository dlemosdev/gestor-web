import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { AcoesInterfaceService } from '../../../core/services/acoes-interface.service';
import { StatusProjeto } from '../../../models/enums/status-projeto.enum';
import { Projeto } from '../../../models/projeto.model';
import { ProjetosService } from '../../../services/projetos.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';
import { DrawerLateralUiComponent } from '../../../shared/ui/drawer-lateral/drawer-lateral-ui.component';
import { FormularioProjetoComponent } from '../componentes/formulario-projeto/formulario-projeto.component';
import { ListaProjetosComponent } from '../componentes/lista-projetos/lista-projetos.component';

@Component({
  standalone: true,
  imports: [BotaoUiComponent, DrawerLateralUiComponent, FormularioProjetoComponent, ListaProjetosComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <article class="relative overflow-hidden rounded-3xl border border-borda bg-superficie px-6 py-7 shadow-[var(--sombra-card)] sm:px-7">
        <div class="absolute inset-0 opacity-55">
          <div class="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_40%)]"></div>
        </div>

        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cor-texto-terciaria">Portfolio</p>
            <h2 class="text-2xl font-semibold text-cor-texto sm:text-3xl">Gestor de Projetos</h2>
            <p class="max-w-2xl text-sm leading-6 text-cor-texto-secundaria">
              Estruture iniciativas, mantenha o controle operacional e acesse rapidamente o board de cada projeto.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <app-botao-ui texto="Novo Projeto" (click)="abrirCriacaoProjeto()" />
          </div>
        </div>
      </article>

      <section class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Total de projetos</p>
          <p class="mt-3 text-3xl font-semibold text-cor-texto">{{ totalProjetos() }}</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Ativos</p>
          <p class="mt-3 text-3xl font-semibold text-emerald-400">{{ totalProjetosAtivos() }}</p>
        </article>

        <article class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
          <p class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Arquivados</p>
          <p class="mt-3 text-3xl font-semibold text-cor-texto-terciaria">{{ totalProjetosInativos() }}</p>
        </article>
      </section>

      <section class="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra-card)] sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3 border-b border-borda pb-3">
          <div>
            <h3 class="text-base font-semibold text-cor-texto">Todos os projetos</h3>
            <p class="text-xs text-cor-texto-secundaria">Ordenados por prioridade operacional (ativos primeiro).</p>
          </div>
        </div>

        <app-lista-projetos
          [projetos]="projetosOrdenados()"
          (editarProjeto)="iniciarEdicao($event)"
          (alternarStatusProjeto)="alternarStatusProjeto($event)"
        />
      </section>
    </section>

    <app-drawer-lateral-ui
      [aberto]="drawerProjetoAberto()"
      [titulo]="projetoEdicao() ? 'Editar Projeto' : 'Novo Projeto'"
      (fechar)="fecharDrawerProjeto()"
    >
      <app-formulario-projeto
        [projetoEdicao]="projetoEdicao()"
        (salvarProjeto)="salvarProjeto($event)"
        (cancelarEdicao)="fecharDrawerProjeto()"
      />
    </app-drawer-lateral-ui>
  `,
})
export class ProjetosPaginaComponent {
  private readonly projetosService = inject(ProjetosService);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);

  readonly projetoEdicao = signal<Projeto | null>(null);
  readonly drawerProjetoAberto = signal(false);

  private ultimoPedidoNovoProjetoProcessado = 0;

  readonly projetosOrdenados = computed(() =>
    [...this.projetosService.projetos()].sort(
      (a, b) => Number(a.status === StatusProjeto.INATIVO) - Number(b.status === StatusProjeto.INATIVO),
    ),
  );

  readonly totalProjetos = computed(() => this.projetosService.projetos().length);
  readonly totalProjetosAtivos = computed(
    () => this.projetosService.projetos().filter((projeto) => projeto.status === StatusProjeto.ATIVO).length,
  );
  readonly totalProjetosInativos = computed(
    () => this.projetosService.projetos().filter((projeto) => projeto.status === StatusProjeto.INATIVO).length,
  );

  constructor() {
    effect(() => {
      const pedidoAtual = this.acoesInterfaceService.solicitacaoNovoProjeto();

      if (pedidoAtual > this.ultimoPedidoNovoProjetoProcessado) {
        this.ultimoPedidoNovoProjetoProcessado = pedidoAtual;
        this.abrirCriacaoProjeto();
      }
    });
  }

  abrirCriacaoProjeto(): void {
    this.projetoEdicao.set(null);
    this.drawerProjetoAberto.set(true);
  }

  salvarProjeto(
    projeto: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm' | 'status'> & { id?: string },
  ): void {
    if (projeto.id) {
      this.projetosService.atualizarProjeto(projeto.id, {
        nome: projeto.nome,
        descricao: projeto.descricao,
        cor: projeto.cor,
      });
      this.fecharDrawerProjeto();
      return;
    }

    this.projetosService.criarProjeto({
      nome: projeto.nome,
      descricao: projeto.descricao,
      cor: projeto.cor,
    });

    this.fecharDrawerProjeto();
  }

  iniciarEdicao(projeto: Projeto): void {
    this.projetoEdicao.set(projeto);
    this.drawerProjetoAberto.set(true);
  }

  fecharDrawerProjeto(): void {
    this.projetoEdicao.set(null);
    this.drawerProjetoAberto.set(false);
  }

  alternarStatusProjeto(projeto: Projeto): void {
    this.projetosService.alternarStatusProjeto(projeto.id);

    if (this.projetoEdicao()?.id === projeto.id) {
      this.fecharDrawerProjeto();
    }
  }
}
