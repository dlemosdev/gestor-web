import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AcoesInterfaceService } from '../../../core/services/acoes-interface.service';
import { Atividade } from '../../../models/atividade.model';
import { Prioridade } from '../../../models/enums/prioridade.enum';
import { StatusAtividade } from '../../../models/enums/status-atividade.enum';
import { StatusProjeto } from '../../../models/enums/status-projeto.enum';
import { TipoAtividade } from '../../../models/enums/tipo-atividade.enum';
import { AtividadesService } from '../../../services/atividades.service';
import { ProjetosService } from '../../../services/projetos.service';
import { RaiasService } from '../../../services/raias.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { OpcaoSeletorUi } from '../../../shared/ui/seletor/seletor-ui.component';
import { DrawerDetalheAtividadeComponent } from '../../atividades/componentes/drawer-detalhe-atividade/drawer-detalhe-atividade.component';
import { ModalDetalhesAtividadeComponent } from '../../atividades/componentes/modal-detalhes-atividade/modal-detalhes-atividade.component';
import { FiltrosBoard } from '../componentes/barra-filtros-board/barra-filtros-board.component';
import { QuadroRaiasComponent, RaiaComAtividades } from '../componentes/quadro-raias/quadro-raias.component';

@Component({
  standalone: true,
  host: { class: 'block h-full min-h-0' },
  imports: [QuadroRaiasComponent, DrawerDetalheAtividadeComponent, ModalDetalhesAtividadeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="-mx-5 -mt-6 flex h-[calc(100%+3rem)] min-h-0 gap-0 overflow-hidden md:-mx-8 md:-mt-8 md:h-[calc(100%+4rem)] lg:-mx-10 lg:-mt-9 lg:h-[calc(100%+4.5rem)]">
      <section class="min-w-0 flex min-h-0 w-full max-w-none flex-1 basis-0 flex-col gap-0 overflow-hidden">
        @if (projetoConcluido()) {
          <div class="mx-3 mb-2 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Projeto concluido. O board esta disponivel para consulta, mas as atividades nao podem ser movidas entre raias.
          </div>
        }

        <section class="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" class="inline-flex h-9 items-center rounded-xl border px-3 text-xs font-semibold transition" [class.border-primaria]="filtroResponsavelAtivo() === ''" [class.bg-primaria]="filtroResponsavelAtivo() === ''" [class.text-white]="filtroResponsavelAtivo() === ''" [class.border-borda]="filtroResponsavelAtivo() !== ''" [class.bg-superficie]="filtroResponsavelAtivo() !== ''" [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== ''" (click)="aplicarFiltroRapidoResponsavel('')">
              Todos responsaveis
            </button>

            @for (responsavel of responsaveisFiltroRapido(); track responsavel.nome) {
              <button type="button" class="inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition" [class.border-primaria]="filtroResponsavelAtivo() === responsavel.nome" [class.bg-primaria]="filtroResponsavelAtivo() === responsavel.nome" [class.text-white]="filtroResponsavelAtivo() === responsavel.nome" [class.border-borda]="filtroResponsavelAtivo() !== responsavel.nome" [class.bg-superficie]="filtroResponsavelAtivo() !== responsavel.nome" [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== responsavel.nome" (click)="aplicarFiltroRapidoResponsavel(responsavel.nome)">
                <span>{{ responsavel.nome }}</span>
                <span class="inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold" [class.bg-white/20]="filtroResponsavelAtivo() === responsavel.nome" [class.text-white]="filtroResponsavelAtivo() === responsavel.nome" [class.bg-superficie-secundaria]="filtroResponsavelAtivo() !== responsavel.nome" [class.text-cor-texto-secundaria]="filtroResponsavelAtivo() !== responsavel.nome">
                  {{ responsavel.quantidade }}
                </span>
              </button>
            }
          </div>

          <button
            type="button"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent bg-primaria text-white transition hover:bg-primaria-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria disabled:cursor-not-allowed disabled:opacity-60"
            (click)="iniciarCriacaoAtividade()"
            [disabled]="projetoConcluido()"
            aria-label="Nova atividade"
            title="Nova atividade"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </section>

        <app-quadro-raias
          class="block h-full w-full min-h-0 flex-1 overflow-hidden"
          [raiasComAtividades]="raiasComAtividadesFiltradas()"
          [arrastarDesabilitado]="filtrosAtivos() || projetoConcluido()"
          (abrirDetalhesAtividade)="abrirDetalhesAtividade($event.id)"
          (editarAtividade)="abrirEdicaoAtividade($event.id)"
          (excluirAtividade)="excluirAtividade($event)"
          (soltarAtividade)="moverAtividade($event.evento, $event.raiaDestinoId)"
          (moverRaia)="reordenarRaias($event)"
        />
      </section>
    </section>

    <app-drawer-detalhe-atividade
      [aberto]="atividadeNoDrawerEdicao() !== null"
      [atividade]="atividadeNoDrawerEdicao()"
      [responsaveis]="opcoesResponsaveis()"
      [opcoesRaias]="opcoesRaias()"
      [historiasUsuarioDisponiveis]="historiasUsuarioRelacionaveis()"
      [modoCriacao]="modoCriacaoAtividade()"
      (fechar)="fecharDrawerEdicao()"
      (salvarAtividade)="salvarAtividade($event)"
      (excluirAtividade)="excluirAtividade($event)"
      (atualizarChecklist)="atualizarChecklistAtividade($event)"
      (adicionarComentario)="adicionarComentario($event)"
    />

    <app-modal-detalhes-atividade
      [aberto]="atividadeNoModal() !== null"
      [atividade]="atividadeNoModal()"
      [historico]="historicoAtividadeSelecionada()"
      [historiasUsuarioDisponiveis]="historiasUsuarioRelacionaveis()"
      (fechar)="fecharModalDetalhes()"
      (editar)="abrirEdicaoAtividade($event.id)"
    />
  `,
})
export class BoardProjetoPaginaComponent {
  private readonly rotaAtiva = inject(ActivatedRoute);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);
  private readonly raiasService = inject(RaiasService);
  private readonly atividadesService = inject(AtividadesService);
  private readonly projetosService = inject(ProjetosService);
  private readonly usuariosService = inject(UsuariosService);
  private readonly idProjetoRota = this.rotaAtiva.snapshot.paramMap.get('id') ?? '';

  readonly filtros = signal<FiltrosBoard>({ busca: '', prioridade: '', status: '', responsavel: '', prazo: '' });
  readonly atividadeSelecionadaId = signal<string | null>(null);
  readonly atividadeEmEdicaoId = signal<string | null>(null);
  readonly atividadeRascunho = signal<Atividade | null>(null);
  private ultimoPedidoNovaAtividadeProcessado = 0;

  readonly opcoesResponsaveis = computed<OpcaoSeletorUi[]>(() => this.usuariosService.listarUsuarios().map((usuario) => ({ valor: usuario.nome, rotulo: usuario.nome })));
  readonly opcoesRaias = computed<OpcaoSeletorUi[]>(() => this.raiasProjeto().map((raia) => ({ valor: raia.id, rotulo: raia.nome })));
  readonly historiasUsuarioRelacionaveis = computed(() => this.atividadesProjeto().filter((atividade) => atividade.tipo === TipoAtividade.HU).sort((a, b) => a.codigoReferencia.localeCompare(b.codigoReferencia)));
  readonly responsaveisFiltroRapido = computed(() => {
    const contagem = new Map<string, number>();
    this.atividadesProjeto().forEach((atividade) => contagem.set(atividade.responsavel, (contagem.get(atividade.responsavel) ?? 0) + 1));
    return Array.from(contagem.entries()).map(([nome, quantidade]) => ({ nome, quantidade })).sort((a, b) => a.nome.localeCompare(b.nome));
  });

  readonly raiasProjeto = computed(() => this.raiasService.obterRaiasPorProjeto(this.idProjetoRota));
  readonly atividadesProjeto = computed(() => this.atividadesService.obterAtividadesPorProjeto(this.idProjetoRota));
  readonly projetoAtual = computed(() => this.projetosService.obterProjetoPorId(this.idProjetoRota));
  readonly projetoConcluido = computed(() => this.projetoAtual()?.status === StatusProjeto.CONCLUIDO);
  readonly filtrosAtivos = computed(() => Object.values(this.filtros()).some((valor) => valor.trim() !== ''));
  readonly atividadeSelecionada = computed(() => this.atividadeSelecionadaId() ? this.atividadesService.obterAtividadePorId(this.atividadeSelecionadaId()!) : null);
  readonly atividadeEmEdicao = computed(() => this.atividadeEmEdicaoId() ? this.atividadesService.obterAtividadePorId(this.atividadeEmEdicaoId()!) : null);
  readonly modoCriacaoAtividade = computed(() => this.atividadeRascunho() !== null);
  readonly atividadeNoDrawerEdicao = computed(() => this.atividadeRascunho() ?? this.atividadeEmEdicao());
  readonly atividadeNoModal = computed(() => this.atividadeSelecionada());
  readonly filtroResponsavelAtivo = computed(() => this.filtros().responsavel);
  readonly historicoAtividadeSelecionada = computed(() => {
    const atividadeId = this.atividadeNoModal()?.id ?? this.atividadeNoDrawerEdicao()?.id;
    return atividadeId ? this.atividadesService.obterHistoricoAtividade(atividadeId) : [];
  });

  readonly raiasComAtividadesFiltradas = computed<RaiaComAtividades[]>(() =>
    this.raiasProjeto().map((raia) => ({
      raia,
      atividades: this.atividadesProjeto()
        .filter((atividade) => atividade.raiaId === raia.id)
        .filter((atividade) => {
          const filtroAtual = this.filtros();
          if (filtroAtual.busca.trim()) {
            const textoBusca = filtroAtual.busca.trim().toLowerCase();
            const textoEtiquetas = atividade.etiquetas.map((etiqueta) => etiqueta.nome).join(' ');
            const campoIndexado = `${atividade.titulo} ${atividade.descricao} ${atividade.descricaoDetalhada ?? ''} ${textoEtiquetas} ${atividade.codigoReferencia} ${atividade.tipo}`.toLowerCase();
            if (!campoIndexado.includes(textoBusca)) return false;
          }
          if (filtroAtual.prioridade && atividade.prioridade !== filtroAtual.prioridade) return false;
          if (filtroAtual.status && atividade.status !== filtroAtual.status) return false;
          if (filtroAtual.responsavel && atividade.responsavel !== filtroAtual.responsavel) return false;
          if (filtroAtual.prazo && atividade.prazo !== filtroAtual.prazo) return false;
          return true;
        })
        .sort((a, b) => a.ordem - b.ordem),
    })),
  );

  constructor() {
    this.raiasService.carregarRaiasProjeto(this.idProjetoRota);
    this.ultimoPedidoNovaAtividadeProcessado = this.acoesInterfaceService.solicitacaoNovaAtividade();
    this.fecharModalDetalhes();
    this.fecharDrawerEdicao();

    effect(() => {
      const pedidoAtual = this.acoesInterfaceService.solicitacaoNovaAtividade();
      if (pedidoAtual > this.ultimoPedidoNovaAtividadeProcessado) {
        this.ultimoPedidoNovaAtividadeProcessado = pedidoAtual;
        this.iniciarCriacaoAtividade();
      }
    });
  }

  aplicarFiltroRapidoResponsavel(responsavel: string): void {
    this.filtros.update((filtrosAtuais) => ({ ...filtrosAtuais, responsavel }));
  }

  abrirDetalhesAtividade(atividadeId: string): void {
    this.atividadeRascunho.set(null);
    this.atividadeEmEdicaoId.set(null);
    this.atividadeSelecionadaId.set(atividadeId);
  }

  abrirEdicaoAtividade(atividadeId: string): void {
    this.atividadeSelecionadaId.set(null);
    this.atividadeRascunho.set(null);
    this.atividadeEmEdicaoId.set(atividadeId);
  }

  fecharModalDetalhes(): void {
    this.atividadeSelecionadaId.set(null);
  }

  fecharDrawerEdicao(): void {
    this.atividadeRascunho.set(null);
    this.atividadeEmEdicaoId.set(null);
  }

  salvarAtividade(atividadeAtualizada: Atividade): void {
    if (this.modoCriacaoAtividade()) {
      const raiaDestino = this.obterRaiaBacklog();
      if (!raiaDestino) return;
      const ordem = this.atividadesProjeto().filter((atividade) => atividade.raiaId === raiaDestino.id).length + 1;
      this.atividadesService.criarAtividadeCompleta({ ...atividadeAtualizada, id: crypto.randomUUID(), projetoId: this.idProjetoRota, raiaId: raiaDestino.id, ordem, criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString() });
      this.atividadeRascunho.set(null);
      return;
    }

    this.atividadesService.salvarAtividadeComReordenacao(atividadeAtualizada);
    this.atividadeEmEdicaoId.set(null);
  }

  excluirAtividade(atividadeId: string): void {
    this.atividadesService.excluirAtividade(atividadeId);
    if (this.atividadeSelecionadaId() === atividadeId) this.atividadeSelecionadaId.set(null);
    if (this.atividadeEmEdicaoId() === atividadeId) this.atividadeEmEdicaoId.set(null);
  }

  atualizarChecklistAtividade(checklist: Atividade['checklist']): void {
    if (this.modoCriacaoAtividade()) {
      const rascunho = this.atividadeRascunho();
      if (!rascunho) return;
      this.atividadeRascunho.set({ ...rascunho, checklist });
      return;
    }
    const atividade = this.atividadeEmEdicao();
    if (!atividade) return;
    this.atividadesService.atualizarChecklist(atividade.id, checklist);
  }

  adicionarComentario(texto: string): void {
    if (this.modoCriacaoAtividade()) return;
    const atividade = this.atividadeEmEdicao();
    if (!atividade) return;
    this.atividadesService.adicionarComentario(atividade.id, texto);
  }

  reordenarRaias(listaReordenada: RaiaComAtividades[]): void {
    this.raiasService.atualizarOrdemRaias(this.idProjetoRota, listaReordenada.map((item) => item.raia));
  }

  moverAtividade(evento: CdkDragDrop<Atividade[]>, raiaDestinoId: string): void {
    if (this.filtrosAtivos() || this.projetoConcluido()) return;
    const atividadeArrastada = evento.item.data as Atividade;
    const raiaOrigem = this.raiasProjeto().find((raia) => raia.id === atividadeArrastada.raiaId);
    if (raiaOrigem && this.raiaEhConcluida(raiaOrigem.nome)) return;
    this.atividadesService.moverAtividade(evento, raiaDestinoId, atividadeArrastada.raiaId);
  }

  iniciarCriacaoAtividade(): void {
    const raiaBacklog = this.obterRaiaBacklog();
    if (!raiaBacklog) return;
    const responsavelPadrao = this.opcoesResponsaveis()[0]?.valor ?? 'Sem responsavel';
    this.atividadeSelecionadaId.set(null);
    this.atividadeEmEdicaoId.set(null);
    this.atividadeRascunho.set({
      id: crypto.randomUUID(),
      projetoId: this.idProjetoRota,
      raiaId: raiaBacklog.id,
      codigoReferencia: '',
      tipo: TipoAtividade.HU,
      atividadePaiId: null,
      titulo: '',
      descricao: '',
      descricaoDetalhada: null,
      prioridade: Prioridade.MEDIA,
      status: StatusAtividade.BACKLOG,
      responsavel: responsavelPadrao,
      prazo: new Date().toISOString().slice(0, 10),
      dataConclusao: null,
      etiquetas: [],
      checklist: [],
      comentarios: [],
      ordem: 0,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    });
  }

  private raiaEhConcluida(nomeRaia: string): boolean {
    return nomeRaia.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'concluidas';
  }

  private obterRaiaBacklog() {
    return this.raiasProjeto().find((raia) => raia.nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'backlog') ?? this.raiasProjeto()[0];
  }
}
