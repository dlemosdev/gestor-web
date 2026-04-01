import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';

import { AcoesInterfaceService } from '../../../core/services/acoes-interface.service';
import { Projeto } from '../../../models/projeto.model';
import { ProjetosService } from '../../../services/projetos.service';
import { BotaoUiComponent } from '../../../shared/ui/botao/botao-ui.component';
import { DialogoConfirmacaoUiComponent } from '../../../shared/ui/dialogo-confirmacao/dialogo-confirmacao-ui.component';
import { DrawerLateralUiComponent } from '../../../shared/ui/drawer-lateral/drawer-lateral-ui.component';
import { FormularioProjetoComponent } from '../componentes/formulario-projeto/formulario-projeto.component';
import { ListaProjetosComponent } from '../componentes/lista-projetos/lista-projetos.component';

@Component({
  standalone: true,
  imports: [
    BotaoUiComponent,
    DrawerLateralUiComponent,
    DialogoConfirmacaoUiComponent,
    FormularioProjetoComponent,
    ListaProjetosComponent,
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
              Estruture iniciativas, mantenha o controle operacional e acesse rapidamente o board de cada projeto.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <app-botao-ui texto="Novo Projeto" (click)="abrirCriacaoProjeto()" />
          </div>
        </div>
      </article>

      <section class="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra-card)] sm:p-5">
        <div class="mb-4 flex items-center justify-between gap-3 border-b border-borda pb-3">
          <div>
            <h3 class="text-base font-semibold text-cor-texto">Todos os projetos</h3>
            <p class="text-xs text-cor-texto-secundaria">Ordenados com o projeto principal em destaque.</p>
          </div>
        </div>

        <app-lista-projetos
          [projetos]="projetosOrdenados()"
          (editarProjeto)="iniciarEdicao($event)"
          (alternarProjetoPrincipal)="alternarProjetoPrincipal($event)"
          (solicitarExclusaoProjeto)="abrirConfirmacaoExclusao($event)"
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
      [aberto]="modalExclusaoProjetoAberto()"
      titulo="Excluir projeto"
      [descricao]="descricaoConfirmacaoExclusao()"
      textoAcao="Excluir"
      (fechar)="fecharConfirmacaoExclusao()"
      (confirmar)="confirmarExclusaoProjeto()"
    />
  `,
})
export class ProjetosPaginaComponent {
  private readonly projetosService = inject(ProjetosService);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);

  readonly projetoEdicao = signal<Projeto | null>(null);
  readonly drawerProjetoAberto = signal(false);
  readonly modalExclusaoProjetoAberto = signal(false);
  readonly projetoSelecionadoParaExclusao = signal<Projeto | null>(null);

  private ultimoPedidoNovoProjetoProcessado = 0;

  readonly projetosOrdenados = computed(() =>
    [...this.projetosService.projetos()].sort((a, b) => Number(b.principal) - Number(a.principal)),
  );

  readonly descricaoConfirmacaoExclusao = computed(() => {
    const projeto = this.projetoSelecionadoParaExclusao();
    if (!projeto) {
      return 'Tem certeza que deseja excluir este projeto?';
    }

    return `Tem certeza que deseja excluir o projeto ${projeto.nome}? Esta ação removerá também as raias e atividades vinculadas.`;
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

  salvarProjeto(
    projeto: Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm' | 'status' | 'principal'> & { id?: string },
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

  alternarProjetoPrincipal(projeto: Projeto): void {
    if (projeto.principal) {
      return;
    }

    this.projetosService.definirProjetoPrincipal(projeto.id);
  }

  abrirConfirmacaoExclusao(projeto: Projeto): void {
    this.projetoSelecionadoParaExclusao.set(projeto);
    this.modalExclusaoProjetoAberto.set(true);
  }

  fecharConfirmacaoExclusao(): void {
    this.modalExclusaoProjetoAberto.set(false);
    this.projetoSelecionadoParaExclusao.set(null);
  }

  confirmarExclusaoProjeto(): void {
    const projeto = this.projetoSelecionadoParaExclusao();

    if (!projeto) {
      return;
    }

    this.projetosService.excluirProjeto(projeto.id);

    if (this.projetoEdicao()?.id === projeto.id) {
      this.fecharDrawerProjeto();
    }

    this.fecharConfirmacaoExclusao();
  }
}
