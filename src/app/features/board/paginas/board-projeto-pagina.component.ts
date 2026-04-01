import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AcoesInterfaceService } from '../../../core/services/acoes-interface.service';
import { Atividade } from '../../../models/atividade.model';
import { Prioridade } from '../../../models/enums/prioridade.enum';
import { StatusAtividade } from '../../../models/enums/status-atividade.enum';
import { OpcaoSeletorUi } from '../../../shared/ui/seletor/seletor-ui.component';
import { AtividadesService } from '../../../services/atividades.service';
import { RaiasService } from '../../../services/raias.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { DrawerLateralUiComponent } from '../../../shared/ui/drawer-lateral/drawer-lateral-ui.component';
import { DrawerDetalheAtividadeComponent } from '../../atividades/componentes/drawer-detalhe-atividade/drawer-detalhe-atividade.component';
import { FiltrosBoard } from '../componentes/barra-filtros-board/barra-filtros-board.component';
import { FormularioRaiaComponent } from '../componentes/formulario-raia/formulario-raia.component';
import { QuadroRaiasComponent, RaiaComAtividades } from '../componentes/quadro-raias/quadro-raias.component';

@Component({
  standalone: true,
  host: {
    class: 'block h-full min-h-0',
  },
  imports: [
    QuadroRaiasComponent,
    DrawerDetalheAtividadeComponent,
    DrawerLateralUiComponent,
    FormularioRaiaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="-mx-5 -mt-6 flex h-[calc(100%+3rem)] min-h-0 gap-0 overflow-hidden md:-mx-8 md:-mt-8 md:h-[calc(100%+4rem)] lg:-mx-10 lg:-mt-9 lg:h-[calc(100%+4.5rem)]">
      <section class="min-w-0 flex min-h-0 w-full max-w-none flex-1 basis-0 flex-col gap-4 overflow-hidden">
        <section class="flex flex-wrap items-center justify-between gap-2 border-b border-borda bg-superficie p-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-9 items-center rounded-xl border px-3 text-xs font-semibold transition"
              [class.border-primaria]="filtroResponsavelAtivo() === ''"
              [class.bg-primaria]="filtroResponsavelAtivo() === ''"
              [class.text-white]="filtroResponsavelAtivo() === ''"
              [class.border-borda]="filtroResponsavelAtivo() !== ''"
              [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== ''"
              (click)="aplicarFiltroRapidoResponsavel('')"
            >
              Todos responsáveis
            </button>

            @for (responsavel of responsaveisFiltroRapido(); track responsavel.nome) {
              <button
                type="button"
                class="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition"
                [class.border-primaria]="filtroResponsavelAtivo() === responsavel.nome"
                [class.bg-primaria]="filtroResponsavelAtivo() === responsavel.nome"
                [class.text-white]="filtroResponsavelAtivo() === responsavel.nome"
                [class.border-borda]="filtroResponsavelAtivo() !== responsavel.nome"
                [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== responsavel.nome"
                (click)="aplicarFiltroRapidoResponsavel(responsavel.nome)"
              >
                <span>{{ responsavel.nome }}</span>
                <span
                  class="inline-flex min-w-5 items-center justify-center rounded-lg px-1.5 py-0.5 text-[10px] font-bold"
                  [class.bg-white/20]="filtroResponsavelAtivo() === responsavel.nome"
                  [class.text-white]="filtroResponsavelAtivo() === responsavel.nome"
                  [class.bg-superficie-secundaria]="filtroResponsavelAtivo() !== responsavel.nome"
                  [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== responsavel.nome"
                >
                  {{ responsavel.quantidade }}
                </span>
              </button>
            }
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-xl border border-transparent bg-primaria px-3 text-sm font-semibold text-white"
              (click)="iniciarCriacaoAtividade()"
            >
              Nova Atividade
            </button>
            <button
              type="button"
              class="inline-flex h-10 items-center gap-2 rounded-xl border border-borda bg-superficie px-3 text-sm font-semibold text-cor-texto-secundaria"
              (click)="abrirDrawerNovaRaia()"
            >
              Nova Raia
            </button>
          </div>
        </section>

        <app-quadro-raias
          class="block h-full w-full min-h-0 flex-1 overflow-hidden"
          [raiasComAtividades]="raiasComAtividadesFiltradas()"
          [arrastarDesabilitado]="filtrosAtivos()"
          (solicitarCriacaoRaia)="abrirDrawerNovaRaia()"
          (editarNomeRaia)="editarNomeRaia($event.raiaId, $event.nome)"
          (excluirRaia)="excluirRaia($event.id)"
          (excluirAtividade)="excluirAtividade($event)"
          (abrirDetalhesAtividade)="abrirDetalhesAtividade($event.id)"
          (soltarAtividade)="moverAtividade($event.evento, $event.raiaDestinoId)"
          (moverRaia)="reordenarRaias($event)"
        />
      </section>
    </section>

    <app-drawer-lateral-ui [aberto]="drawerNovaRaiaAberto()" titulo="Nova Raia" (fechar)="fecharDrawerNovaRaia()">
      <app-formulario-raia (criar)="criarRaiaPorDrawer($event)" (cancelar)="fecharDrawerNovaRaia()" />
    </app-drawer-lateral-ui>

    <app-drawer-detalhe-atividade
      [aberto]="atividadeNoDrawer() !== null"
      [atividade]="atividadeNoDrawer()"
      [responsaveis]="opcoesResponsaveis()"
      [opcoesRaias]="opcoesRaias()"
      [modoCriacao]="modoCriacaoAtividade()"
      (fechar)="fecharDetalhes()"
      (salvarAtividade)="salvarAtividade($event)"
      (excluirAtividade)="excluirAtividade($event)"
      (atualizarChecklist)="atualizarChecklistAtividade($event)"
      (adicionarComentario)="adicionarComentario($event)"
    />
  `,
})
export class BoardProjetoPaginaComponent {
  private readonly rotaAtiva = inject(ActivatedRoute);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);
  private readonly raiasService = inject(RaiasService);
  private readonly atividadesService = inject(AtividadesService);
  private readonly usuariosService = inject(UsuariosService);

  private readonly idProjetoRota = this.rotaAtiva.snapshot.paramMap.get('id') ?? 'projeto-portal-corporativo';

  readonly filtros = signal<FiltrosBoard>({
    busca: '',
    prioridade: '',
    status: '',
    responsavel: '',
    prazo: '',
  });

  readonly atividadeSelecionadaId = signal<string | null>(null);
  readonly atividadeRascunho = signal<Atividade | null>(null);
  readonly drawerNovaRaiaAberto = signal(false);

  private ultimoPedidoNovaAtividadeProcessado = 0;
  private ultimoPedidoNovaRaiaProcessado = 0;

  readonly opcoesResponsaveis = computed<OpcaoSeletorUi[]>(() =>
    this.usuariosService
      .listarUsuarios()
      .map((usuario) => ({ valor: usuario.nome, rotulo: usuario.nome })),
  );
  readonly opcoesRaias = computed<OpcaoSeletorUi[]>(() =>
    this.raiasProjeto().map((raia) => ({ valor: raia.id, rotulo: raia.nome })),
  );
  readonly responsaveisFiltroRapido = computed(() => {
    const contagemPorResponsavel = new Map<string, number>();

    this.atividadesProjeto().forEach((atividade) => {
      contagemPorResponsavel.set(atividade.responsavel, (contagemPorResponsavel.get(atividade.responsavel) ?? 0) + 1);
    });

    return Array.from(contagemPorResponsavel.entries())
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly raiasProjeto = computed(() => this.raiasService.obterRaiasPorProjeto(this.idProjetoRota));
  readonly atividadesProjeto = computed(() => this.atividadesService.obterAtividadesPorProjeto(this.idProjetoRota));

  readonly filtrosAtivos = computed(() => {
    const filtro = this.filtros();
    return Object.values(filtro).some((valor) => valor.trim() !== '');
  });

  readonly atividadeSelecionada = computed(() => {
    const atividadeId = this.atividadeSelecionadaId();

    if (!atividadeId) {
      return null;
    }

    return this.atividadesService.obterAtividadePorId(atividadeId);
  });

  readonly modoCriacaoAtividade = computed(() => this.atividadeRascunho() !== null);
  readonly atividadeNoDrawer = computed(() => this.atividadeRascunho() ?? this.atividadeSelecionada());
  readonly filtroResponsavelAtivo = computed(() => this.filtros().responsavel);

  readonly raiasComAtividadesFiltradas = computed<RaiaComAtividades[]>(() => {
    const filtroAtual = this.filtros();

    return this.raiasProjeto().map((raia) => ({
      raia,
      atividades: this.atividadesProjeto()
        .filter((atividade) => atividade.raiaId === raia.id)
        .filter((atividade) => {
          if (filtroAtual.busca.trim()) {
            const textoBusca = filtroAtual.busca.trim().toLowerCase();
            const campoIndexado = `${atividade.titulo} ${atividade.descricao} ${atividade.etiquetas.join(' ')}`.toLowerCase();

            if (!campoIndexado.includes(textoBusca)) {
              return false;
            }
          }

          if (filtroAtual.prioridade && atividade.prioridade !== filtroAtual.prioridade) {
            return false;
          }

          if (filtroAtual.status && atividade.status !== filtroAtual.status) {
            return false;
          }

          if (filtroAtual.responsavel && atividade.responsavel !== filtroAtual.responsavel) {
            return false;
          }

          if (filtroAtual.prazo && atividade.prazo !== filtroAtual.prazo) {
            return false;
          }

          return true;
        })
        .sort((a, b) => a.ordem - b.ordem),
    }));
  });

  constructor() {
    this.raiasService.garantirRaiasPadraoProjeto(this.idProjetoRota);

    effect(() => {
      const pedidoAtual = this.acoesInterfaceService.solicitacaoNovaAtividade();

      if (pedidoAtual > this.ultimoPedidoNovaAtividadeProcessado) {
        this.ultimoPedidoNovaAtividadeProcessado = pedidoAtual;
        this.iniciarCriacaoAtividade();
      }
    });

    effect(() => {
      const pedidoAtual = this.acoesInterfaceService.solicitacaoNovaRaia();

      if (pedidoAtual > this.ultimoPedidoNovaRaiaProcessado) {
        this.ultimoPedidoNovaRaiaProcessado = pedidoAtual;
        this.abrirDrawerNovaRaia();
      }
    });
  }

  atualizarFiltros(filtros: FiltrosBoard): void {
    this.filtros.set(filtros);
  }

  aplicarFiltroRapidoResponsavel(responsavel: string): void {
    this.filtros.update((filtrosAtuais) => ({
      ...filtrosAtuais,
      responsavel,
    }));
  }

  criarRaia(nome: string): void {
    this.raiasService.criarRaia(this.idProjetoRota, nome);
  }

  abrirDrawerNovaRaia(): void {
    this.drawerNovaRaiaAberto.set(true);
  }

  fecharDrawerNovaRaia(): void {
    this.drawerNovaRaiaAberto.set(false);
  }

  criarRaiaPorDrawer(nome: string): void {
    this.criarRaia(nome);
    this.fecharDrawerNovaRaia();
  }

  editarNomeRaia(raiaId: string, nome: string): void {
    this.raiasService.editarNomeRaia(raiaId, nome);
  }

  excluirRaia(raiaId: string): void {
    this.raiasService.excluirRaia(raiaId);
    this.atividadesService.excluirAtividadesDaRaia(raiaId);
  }

  abrirDetalhesAtividade(atividadeId: string): void {
    this.atividadeRascunho.set(null);
    this.atividadeSelecionadaId.set(atividadeId);
  }

  fecharDetalhes(): void {
    this.atividadeSelecionadaId.set(null);
    this.atividadeRascunho.set(null);
  }

  salvarAtividade(atividadeAtualizada: Atividade): void {
    if (this.modoCriacaoAtividade()) {
      const raiaDestinoId = atividadeAtualizada.raiaId;
      const raiaDestino = this.raiasProjeto().find((raia) => raia.id === raiaDestinoId);

      if (!raiaDestino) {
        return;
      }

      const ordem = this.atividadesProjeto().filter((atividade) => atividade.raiaId === raiaDestino.id).length + 1;

      this.atividadesService.criarAtividadeCompleta({
        ...atividadeAtualizada,
        id: crypto.randomUUID(),
        projetoId: this.idProjetoRota,
        raiaId: raiaDestinoId,
        ordem,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      });

      this.atividadeRascunho.set(null);
      return;
    }

    this.atividadesService.salvarAtividadeComReordenacao(atividadeAtualizada);
  }

  excluirAtividade(atividadeId: string): void {
    this.atividadesService.excluirAtividade(atividadeId);

    if (this.atividadeSelecionadaId() === atividadeId) {
      this.atividadeSelecionadaId.set(null);
    }
  }

  atualizarChecklistAtividade(checklist: Atividade['checklist']): void {
    if (this.modoCriacaoAtividade()) {
      const rascunho = this.atividadeRascunho();

      if (!rascunho) {
        return;
      }

      this.atividadeRascunho.set({ ...rascunho, checklist });
      return;
    }

    const atividade = this.atividadeSelecionada();

    if (!atividade) {
      return;
    }

    this.atividadesService.atualizarChecklist(atividade.id, checklist);
  }

  adicionarComentario(texto: string): void {
    if (this.modoCriacaoAtividade()) {
      return;
    }

    const atividade = this.atividadeSelecionada();

    if (!atividade) {
      return;
    }

    this.atividadesService.adicionarComentario(atividade.id, texto);
  }

  reordenarRaias(listaReordenada: RaiaComAtividades[]): void {
    this.raiasService.atualizarOrdemRaias(
      this.idProjetoRota,
      listaReordenada.map((item) => item.raia),
    );
  }

  moverAtividade(evento: CdkDragDrop<Atividade[]>, raiaDestinoId: string): void {
    if (this.filtrosAtivos()) {
      return;
    }

    const atividadeArrastada = evento.item.data as Atividade;
    this.atividadesService.moverAtividade(evento, raiaDestinoId, atividadeArrastada.raiaId);
  }

  iniciarCriacaoAtividade(): void {
    const primeiraRaia = this.raiasProjeto()[0];

    if (!primeiraRaia) {
      return;
    }

    const responsavelPadrao = this.opcoesResponsaveis()[0]?.valor ?? 'Sem responsavel';

    this.atividadeSelecionadaId.set(null);
    this.atividadeRascunho.set({
      id: 'rascunho-atividade',
      projetoId: this.idProjetoRota,
      raiaId: primeiraRaia.id,
      titulo: '',
      descricao: '',
      prioridade: Prioridade.MEDIA,
      status: StatusAtividade.BACKLOG,
      responsavel: responsavelPadrao,
      prazo: new Date().toISOString().slice(0, 10),
      etiquetas: [],
      checklist: [],
      comentarios: [],
      ordem: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
  }
}
