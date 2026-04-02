import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { AcoesInterfaceService } from '../../../core/services/acoes-interface.service';
import { HistoricoProjeto } from '../../../models/historico-projeto.model';
import { StatusProjeto } from '../../../models/enums/status-projeto.enum';
import { Projeto } from '../../../models/projeto.model';
import { ProjetosService } from '../../../services/projetos.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';
import { DialogoConfirmacaoUiComponent } from '../../../shared/ui/dialogo-confirmacao/dialogo-confirmacao-ui.component';
import { DrawerLateralUiComponent } from '../../../shared/ui/drawer-lateral/drawer-lateral-ui.component';
import { DadosFormularioProjeto, FormularioProjetoComponent } from '../componentes/formulario-projeto/formulario-projeto.component';
import { ListaProjetosComponent } from '../componentes/lista-projetos/lista-projetos.component';
import { ModalDetalhesProjetoComponent } from '../componentes/modal-detalhes-projeto/modal-detalhes-projeto.component';

type FiltroProjetoRapido = 'TODOS' | 'CONCLUIDOS' | 'ARQUIVADOS';

@Component({
  standalone: true,
  imports: [
    BotaoUiComponent,
    DialogoConfirmacaoUiComponent,
    DrawerLateralUiComponent,
    FormularioProjetoComponent,
    ListaProjetosComponent,
    ModalDetalhesProjetoComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
      <article class="relative overflow-hidden rounded-3xl border border-borda bg-superficie px-6 py-7 shadow-[var(--sombra-card)] sm:px-7">
        <div class="absolute inset-0 opacity-55">
          <div class="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.2),transparent_45%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_40%)]"></div>
        </div>

        <div class="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <h2 class="text-2xl font-semibold text-cor-texto sm:text-3xl">Gestor de Projetos</h2>
            <p class="max-w-2xl text-sm leading-6 text-cor-texto-secundaria">
              Estruture iniciativas, mantenha o controle operacional e acompanhe o ciclo de vida de cada projeto.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <app-botao-ui texto="Novo Projeto" (click)="abrirCriacaoProjeto()" />
          </div>
        </div>
      </article>

      <section class="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra-card)] sm:p-5">
        <div class="mb-4 flex flex-col gap-3 border-b border-borda pb-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 class="text-base font-semibold text-cor-texto">Projetos</h3>
            <p class="text-xs text-cor-texto-secundaria">Ordenação fixa: ativos, concluídos e arquivados.</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            @for (filtro of filtrosRapidos(); track filtro.valor) {
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition"
                [class.border-primaria]="filtroProjetoAtivo() === filtro.valor"
                [class.bg-primaria]="filtroProjetoAtivo() === filtro.valor"
                [class.text-white]="filtroProjetoAtivo() === filtro.valor"
                [class.border-borda]="filtroProjetoAtivo() !== filtro.valor"
                [class.bg-superficie]="filtroProjetoAtivo() !== filtro.valor"
                [class.text-cor-texto-secundaria]="filtroProjetoAtivo() !== filtro.valor"
                (click)="filtroProjetoAtivo.set(filtro.valor)"
              >
                <span>{{ filtro.rotulo }}</span>
                <span
                  class="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                  [class.bg-white/20]="filtroProjetoAtivo() === filtro.valor"
                  [class.text-white]="filtroProjetoAtivo() === filtro.valor"
                  [class.bg-superficie-secundaria]="filtroProjetoAtivo() !== filtro.valor"
                  [class.text-cor-texto-secundaria]="filtroProjetoAtivo() !== filtro.valor"
                >
                  {{ filtro.quantidade }}
                </span>
              </button>
            }
          </div>
        </div>

        <app-lista-projetos
          [projetos]="projetosFiltrados()"
          (visualizarDetalhes)="abrirDetalhesProjeto($event)"
          (editarProjeto)="iniciarEdicao($event)"
          (alternarProjetoPrincipal)="alternarProjetoPrincipal($event)"
          (inativarProjeto)="inativarProjeto($event)"
          (concluirProjeto)="abrirConfirmacaoConclusao($event)"
          (ativarProjeto)="ativarProjeto($event)"
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

    <app-dialogo-confirmacao-ui
      [aberto]="dialogoConclusaoAberto()"
      titulo="Concluir projeto"
      [descricao]="descricaoConfirmacaoConclusao()"
      textoAcao="Concluir definitivamente"
      (fechar)="fecharConfirmacaoConclusao()"
      (confirmar)="confirmarConclusaoProjeto()"
    />

    <app-modal-detalhes-projeto
      [aberto]="modalDetalhesProjetoAberta()"
      [projeto]="projetoDetalhes()"
      [historico]="historicoProjetoDetalhes()"
      (fechar)="fecharDetalhesProjeto()"
    />
  `,
})
export class ProjetosPaginaComponent {
  readonly projetosService = inject(ProjetosService);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);

  readonly projetoEdicao = signal<Projeto | null>(null);
  readonly drawerProjetoAberto = signal(false);
  readonly filtroProjetoAtivo = signal<FiltroProjetoRapido>('TODOS');
  readonly dialogoConclusaoAberto = signal(false);
  readonly projetoPendenteConclusao = signal<Projeto | null>(null);
  readonly modalDetalhesProjetoAberta = signal(false);
  readonly projetoDetalhes = signal<Projeto | null>(null);

  private ultimoPedidoNovoProjetoProcessado = 0;

  readonly projetosOrdenados = computed(() =>
    [...this.projetosService.projetos()].sort((a, b) => this.ordemStatus(a) - this.ordemStatus(b) || Number(b.principal) - Number(a.principal)),
  );

  readonly projetosFiltrados = computed(() => {
    const filtro = this.filtroProjetoAtivo();

    if (filtro === 'CONCLUIDOS') {
      return this.projetosOrdenados().filter((projeto) => projeto.status === StatusProjeto.CONCLUIDO);
    }

    if (filtro === 'ARQUIVADOS') {
      return this.projetosOrdenados().filter((projeto) => projeto.status === StatusProjeto.INATIVO);
    }

    return this.projetosOrdenados();
  });

  readonly filtrosRapidos = computed(() => {
    const projetos = this.projetosService.projetos();

    return [
      { valor: 'TODOS' as const, rotulo: 'Todos', quantidade: projetos.length },
      { valor: 'CONCLUIDOS' as const, rotulo: 'Concluídos', quantidade: projetos.filter((projeto) => projeto.status === StatusProjeto.CONCLUIDO).length },
      { valor: 'ARQUIVADOS' as const, rotulo: 'Arquivados', quantidade: projetos.filter((projeto) => projeto.status === StatusProjeto.INATIVO).length },
    ];
  });

  readonly descricaoConfirmacaoConclusao = computed(() => {
    const projeto = this.projetoPendenteConclusao();

    if (!projeto) {
      return 'Tem certeza que deseja concluir este projeto? Essa ação não poderá ser desfeita.';
    }

    return `Ao concluir o projeto ${projeto.nome}, essa ação não poderá ser desfeita. O board continuará disponível apenas para consulta, sem movimentação entre raias.`;
  });

  readonly historicoProjetoDetalhes = computed<HistoricoProjeto[]>(() => {
    const projetoId = this.projetoDetalhes()?.id;
    return projetoId ? this.projetosService.obterHistoricoProjeto(projetoId) : [];
  });

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

  abrirDetalhesProjeto(projeto: Projeto): void {
    this.projetoDetalhes.set(projeto);
    this.modalDetalhesProjetoAberta.set(true);
  }

  fecharDetalhesProjeto(): void {
    this.modalDetalhesProjetoAberta.set(false);
    this.projetoDetalhes.set(null);
  }

  salvarProjeto(projeto: DadosFormularioProjeto): void {
    if (projeto.id) {
      this.projetosService.atualizarProjeto(projeto.id, {
        nome: projeto.nome,
        descricao: projeto.descricao,
        dataInicial: projeto.dataInicial,
        dataFinal: projeto.dataFinal,
      });
      this.fecharDrawerProjeto();
      return;
    }

    this.projetosService.criarProjeto({
      nome: projeto.nome,
      descricao: projeto.descricao,
      dataInicial: projeto.dataInicial,
      dataFinal: projeto.dataFinal,
      raiasPadrao: projeto.raiasPadrao,
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

  alternarProjetoPrincipal(projeto: Projeto): void {
    if (projeto.principal) {
      return;
    }

    this.projetosService.definirProjetoPrincipal(projeto.id);
  }

  inativarProjeto(projeto: Projeto): void {
    if (projeto.status !== StatusProjeto.ATIVO) {
      return;
    }

    this.projetosService.atualizarStatusProjeto(projeto.id, StatusProjeto.INATIVO);
  }

  abrirConfirmacaoConclusao(projeto: Projeto): void {
    if (projeto.status !== StatusProjeto.ATIVO) {
      return;
    }

    this.projetoPendenteConclusao.set(projeto);
    this.dialogoConclusaoAberto.set(true);
  }

  fecharConfirmacaoConclusao(): void {
    this.dialogoConclusaoAberto.set(false);
    this.projetoPendenteConclusao.set(null);
  }

  confirmarConclusaoProjeto(): void {
    const projeto = this.projetoPendenteConclusao();

    if (!projeto || projeto.status !== StatusProjeto.ATIVO) {
      this.fecharConfirmacaoConclusao();
      return;
    }

    this.projetosService.atualizarStatusProjeto(projeto.id, StatusProjeto.CONCLUIDO);

    if (this.projetoEdicao()?.id === projeto.id) {
      this.projetoEdicao.update((atual) => (atual ? { ...atual, status: StatusProjeto.CONCLUIDO } : atual));
    }

    if (this.projetoDetalhes()?.id === projeto.id) {
      this.projetoDetalhes.update((atual) => (atual ? { ...atual, status: StatusProjeto.CONCLUIDO } : atual));
    }

    this.fecharConfirmacaoConclusao();
  }

  ativarProjeto(projeto: Projeto): void {
    if (projeto.status !== StatusProjeto.INATIVO) {
      return;
    }

    this.projetosService.atualizarStatusProjeto(projeto.id, StatusProjeto.ATIVO);

    if (this.projetoDetalhes()?.id === projeto.id) {
      this.projetoDetalhes.update((atual) => (atual ? { ...atual, status: StatusProjeto.ATIVO } : atual));
    }
  }

  private ordemStatus(projeto: Projeto): number {
    if (projeto.status === StatusProjeto.ATIVO) {
      return 0;
    }

    if (projeto.status === StatusProjeto.CONCLUIDO) {
      return 1;
    }

    return 2;
  }
}
