import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Atividade } from '../../../../models/atividade.model';
import { Prioridade } from '../../../../models/enums/prioridade.enum';
import { StatusAtividade } from '../../../../models/enums/status-atividade.enum';
import { TipoAtividade } from '../../../../models/enums/tipo-atividade.enum';
import { EtiquetaAtividade } from '../../../../models/etiqueta-atividade.model';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';
import { OpcaoSeletorUi } from '../../../../shared/ui/seletor/seletor-ui.component';

interface CorEtiqueta {
  nome: string;
  valor: string;
}

@Component({
  selector: 'app-formulario-atividade',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="formularioAtividade" class="space-y-5 rounded-2xl border border-borda bg-superficie-secundaria p-4" (ngSubmit)="salvarFormulario()">
      <section class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        @if (!modoCriacao()) {
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-cor-texto-secundaria">Código</span>
            <input
              type="text"
              [value]="atividade().codigoReferencia || 'Gerado automaticamente ao cadastrar'"
              readonly
              class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto-secundaria outline-none"
            />
          </label>
        }

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Tipo</span>
          @if (modoCriacao()) {
            <div class="grid grid-cols-3 gap-2 rounded-2xl border border-borda bg-superficie p-1.5">
              @for (opcao of opcoesTipo; track opcao.valor) {
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
                  [class.bg-primaria]="tipoSelecionado() === opcao.valor"
                  [class.text-white]="tipoSelecionado() === opcao.valor"
                  [class.shadow-sm]="tipoSelecionado() === opcao.valor"
                  [class.text-cor-texto-secundaria]="tipoSelecionado() !== opcao.valor"
                  [class.hover:bg-superficie-secundaria]="tipoSelecionado() !== opcao.valor"
                  (click)="selecionarTipo(opcao.valor)"
                >
                  {{ opcao.rotulo }}
                </button>
              }
            </div>
          } @else {
            <input
              type="text"
              [value]="textoTipoAtividade(tipoSelecionado())"
              readonly
              class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto outline-none"
            />
          }
        </label>
      </section>

      @if (modoCriacao()) {
        <div class="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-200">
          A nova atividade será criada automaticamente na raia Backlog com status Backlog.
        </div>
      }

      @if (!modoCriacao() && atividade().dataConclusao) {
        <div class="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
          Concluída em {{ atividade().dataConclusao }}
        </div>
      }

      @if (tipoSelecionado() !== tipoAtividade.HU) {
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">HU vinculada</span>
          <div class="relative" (click)="$event.stopPropagation()">
            <div class="flex h-11 overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm transition focus-within:border-primaria focus-within:ring-1 focus-within:ring-primaria/30">
              <span
                class="inline-flex w-11 flex-none items-center justify-center border-r border-borda bg-superficie-secundaria text-cor-texto-suave"
                aria-hidden="true"
                style="border-radius: 0; box-shadow: none;"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                #inputHu
                type="text"
                [value]="filtroHistoriaUsuario()"
                (focus)="abrirSeletorHu()"
                (input)="filtrarHistoriaUsuario(inputHu.value)"
                class="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm outline-none placeholder:text-cor-texto-suave"
                placeholder="Selecione ou filtre a HU"
                autocomplete="off"
                style="border: 0 !important; border-radius: 0 !important; background: transparent !important; box-shadow: none !important;"
              />
              <button
                type="button"
                class="inline-flex w-11 flex-none items-center justify-center border-l border-borda bg-superficie-secundaria text-cor-texto-secundaria transition hover:text-cor-texto focus-visible:outline-none"
                style="border-radius: 0; box-shadow: none;"
                (click)="alternarSeletorHu()"
                aria-label="Abrir seleção de HU"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </div>

            @if (seletorHuAberto() && opcoesHistoriaUsuario().length > 0) {
              <div class="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-borda bg-superficie p-1.5 shadow-[var(--sombra-suave)]">
                <button
                  type="button"
                  class="flex w-full items-start rounded-xl px-3 py-2.5 text-left text-sm text-cor-texto-secundaria transition hover:bg-superficie-secundaria"
                  (click)="limparHistoriaUsuarioSelecionada()"
                >
                  Selecione a HU
                </button>

                @for (opcao of opcoesHistoriaUsuarioFiltradas(); track opcao.valor) {
                  <button
                    type="button"
                    class="flex w-full items-start rounded-xl px-3 py-2.5 text-left text-sm transition"
                    [class.bg-primaria/10]="formularioAtividade.controls.atividadePaiId.value === opcao.valor"
                    [class.text-cor-texto]="formularioAtividade.controls.atividadePaiId.value === opcao.valor"
                    [class.text-cor-texto-secundaria]="formularioAtividade.controls.atividadePaiId.value !== opcao.valor"
                    [class.hover:bg-superficie-secundaria]="formularioAtividade.controls.atividadePaiId.value !== opcao.valor"
                    (click)="selecionarHistoriaUsuario(opcao)"
                  >
                    {{ opcao.rotulo }}
                  </button>
                }
              </div>
            }
          </div>
          @if (opcoesHistoriaUsuario().length === 0) {
            <span class="text-xs text-cor-texto-suave">
              @if (tipoSelecionado() === tipoAtividade.BUGFIX) {
                Nenhuma HU disponível na raia Teste.
              } @else {
                Nenhuma HU disponível na raia Concluídas.
              }
            </span>
          } @else if (opcoesHistoriaUsuarioFiltradas().length === 0) {
            <span class="text-xs text-cor-texto-suave">Nenhuma HU encontrada para o filtro informado.</span>
          }
        </label>
      }

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Título</span>
        <input formControlName="titulo" type="text" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria" />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Descrição resumida</span>
        <textarea formControlName="descricao" rows="3" class="rounded-xl border border-borda px-3 py-2.5 text-sm outline-none focus:border-primaria"></textarea>
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Descrição detalhada</span>
        <textarea formControlName="descricaoDetalhada" rows="8" class="rounded-xl border border-borda px-3 py-2.5 text-sm outline-none focus:border-primaria"></textarea>
      </label>

      <section class="space-y-2.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Etiquetas</span>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_190px_auto]">
          <input
            #inputEtiqueta
            type="text"
            [value]="novaEtiqueta()"
            (input)="novaEtiqueta.set(inputEtiqueta.value)"
            (keydown.enter)="adicionarEtiquetaPorEvento($event)"
            class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria"
            placeholder="Ex.: Backend"
            maxlength="24"
          />

          <select
            [value]="corEtiquetaSelecionada()"
            (change)="alterarCorEtiqueta($event)"
            class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria"
            aria-label="Selecionar cor da etiqueta"
          >
            @for (cor of coresEtiqueta; track cor.valor) {
              <option [value]="cor.valor">{{ cor.nome }}</option>
            }
          </select>

          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-borda text-cor-texto-secundaria transition hover:border-borda-forte hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            (click)="adicionarEtiqueta()"
            aria-label="Adicionar etiqueta"
            title="Adicionar etiqueta"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>

        @if (etiquetasEditadas().length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (etiqueta of etiquetasEditadas(); track etiqueta.nome) {
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:opacity-90"
                [style.backgroundColor]="etiqueta.cor + '20'"
                [style.borderColor]="etiqueta.cor + '66'"
                [style.color]="etiqueta.cor"
                [attr.aria-label]="'Remover etiqueta ' + etiqueta.nome"
                [attr.title]="'Remover ' + etiqueta.nome"
                (click)="removerEtiqueta(etiqueta.nome)"
              >
                <span>{{ etiqueta.nome }}</span>
                <span aria-hidden="true">×</span>
              </button>
            }
          </div>
        } @else {
          <p class="text-xs text-cor-texto-suave">Nenhuma etiqueta adicionada.</p>
        }
      </section>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        @if (!modoCriacao()) {
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-cor-texto-secundaria">Raia</span>
            <select formControlName="raiaId" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
              @for (opcao of opcoesRaias(); track opcao.valor) {
                <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
              }
            </select>
          </label>
        }

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Prioridade</span>
          <select formControlName="prioridade" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesPrioridade; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        @if (!modoCriacao()) {
          <label class="flex flex-col gap-1.5">
            <span class="text-xs font-semibold text-cor-texto-secundaria">Status</span>
            <select formControlName="status" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
              @for (opcao of opcoesStatus; track opcao.valor) {
                <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
              }
            </select>
          </label>
        }
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Responsável</span>
          <select formControlName="responsavel" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of responsaveis(); track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Prazo</span>
          <input type="date" formControlName="prazo" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria" />
        </label>
      </div>

      <div class="flex justify-end border-t border-borda pt-4">
        <app-botao-ui
          tipo="submit"
          [texto]="modoCriacao() ? 'Criar atividade' : 'Salvar alteracoes'"
          [icone]="modoCriacao() ? 'plus' : 'save'"
          [desabilitado]="formularioAtividade.invalid"
        />
      </div>
    </form>
  `,
})
export class FormularioAtividadeComponent {
  private readonly fb = inject(FormBuilder);

  readonly tipoAtividade = TipoAtividade;
  readonly atividade = input.required<Atividade>();
  readonly responsaveis = input<OpcaoSeletorUi[]>([]);
  readonly opcoesRaias = input<OpcaoSeletorUi[]>([]);
  readonly historiasUsuarioDisponiveis = input<Atividade[]>([]);
  readonly modoCriacao = input(false);
  readonly salvar = output<Atividade>();
  readonly etiquetasEditadas = signal<EtiquetaAtividade[]>([]);
  readonly novaEtiqueta = signal('');
  readonly corEtiquetaSelecionada = signal('#2563EB');
  readonly tipoSelecionado = signal<TipoAtividade>(TipoAtividade.HU);
  readonly filtroHistoriaUsuario = signal('');
  readonly seletorHuAberto = signal(false);

  readonly coresEtiqueta: CorEtiqueta[] = [
    { nome: 'Azul', valor: '#2563EB' },
    { nome: 'Verde', valor: '#16A34A' },
    { nome: 'Laranja', valor: '#EA580C' },
    { nome: 'Vermelho', valor: '#DC2626' },
    { nome: 'Roxo', valor: '#7C3AED' },
    { nome: 'Ciano', valor: '#0891B2' },
    { nome: 'Cinza', valor: '#64748B' },
  ];

  readonly opcoesPrioridade: OpcaoSeletorUi[] = [
    { valor: Prioridade.BAIXA, rotulo: 'Baixa' },
    { valor: Prioridade.MEDIA, rotulo: 'Média' },
    { valor: Prioridade.ALTA, rotulo: 'Alta' },
    { valor: Prioridade.CRITICA, rotulo: 'Crítica' },
  ];

  readonly opcoesStatus: OpcaoSeletorUi[] = [
    { valor: StatusAtividade.BACKLOG, rotulo: 'Backlog' },
    { valor: StatusAtividade.EM_ANDAMENTO, rotulo: 'Em andamento' },
    { valor: StatusAtividade.BLOQUEADA, rotulo: 'Bloqueada' },
    { valor: StatusAtividade.CONCLUIDA, rotulo: 'Concluída' },
  ];

  readonly opcoesTipo: OpcaoSeletorUi[] = [
    { valor: TipoAtividade.HU, rotulo: 'HU' },
    { valor: TipoAtividade.BUGFIX, rotulo: 'BUGFIX' },
    { valor: TipoAtividade.HOTFIX, rotulo: 'HOTFIX' },
  ];

  readonly opcoesHistoriaUsuario = computed<OpcaoSeletorUi[]>(() =>
    this.historiasUsuarioDisponiveis()
      .filter((atividade) => atividade.id !== this.atividade().id)
      .filter((atividade) => this.historiaUsuarioEhCompativel(atividade, this.tipoSelecionado()))
      .map((atividade) => ({
        valor: atividade.id,
        rotulo: `${atividade.codigoReferencia || 'HU'} - ${atividade.titulo}`,
      })),
  );

  readonly opcoesHistoriaUsuarioFiltradas = computed<OpcaoSeletorUi[]>(() => {
    const filtro = this.filtroHistoriaUsuario().trim().toLowerCase();

    if (!filtro) {
      return this.opcoesHistoriaUsuario();
    }

    return this.opcoesHistoriaUsuario().filter((opcao) => opcao.rotulo.toLowerCase().includes(filtro));
  });

  readonly formularioAtividade = this.fb.group({
    tipo: [TipoAtividade.HU, Validators.required],
    atividadePaiId: [''],
    raiaId: [''],
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(8)]],
    descricaoDetalhada: [''],
    prioridade: [Prioridade.MEDIA, Validators.required],
    status: [StatusAtividade.BACKLOG],
    responsavel: ['', Validators.required],
    prazo: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const atividade = this.atividade();

      this.etiquetasEditadas.set([...(atividade.etiquetas ?? [])]);
      this.novaEtiqueta.set('');
      this.corEtiquetaSelecionada.set('#2563EB');
      this.tipoSelecionado.set(atividade.tipo);
      this.seletorHuAberto.set(false);
      this.formularioAtividade.patchValue({
        tipo: atividade.tipo,
        atividadePaiId: atividade.atividadePaiId ?? '',
        raiaId: atividade.raiaId,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        descricaoDetalhada: atividade.descricaoDetalhada ?? '',
        prioridade: atividade.prioridade,
        status: atividade.status,
        responsavel: atividade.responsavel,
        prazo: atividade.prazo,
      });
      this.sincronizarTextoHistoriaUsuario(atividade.atividadePaiId ?? '');
      this.atualizarValidacaoVinculoHu(atividade.tipo);
    });
  }

  salvarFormulario(): void {
    if (this.formularioAtividade.invalid) {
      this.formularioAtividade.markAllAsTouched();
      return;
    }

    const valor = this.formularioAtividade.getRawValue();
    const tipo = (this.modoCriacao() ? valor.tipo : this.atividade().tipo) as TipoAtividade;
    const atividadePaiId = tipo === TipoAtividade.HU ? null : valor.atividadePaiId || null;

    this.salvar.emit({
      ...this.atividade(),
      tipo,
      atividadePaiId,
      raiaId: this.modoCriacao() ? this.atividade().raiaId : valor.raiaId ?? this.atividade().raiaId,
      titulo: valor.titulo ?? this.atividade().titulo,
      descricao: valor.descricao ?? this.atividade().descricao,
      descricaoDetalhada: valor.descricaoDetalhada?.trim() ? valor.descricaoDetalhada.trim() : null,
      prioridade: (valor.prioridade as Prioridade) ?? this.atividade().prioridade,
      status: this.modoCriacao() ? StatusAtividade.BACKLOG : ((valor.status as StatusAtividade) ?? this.atividade().status),
      responsavel: valor.responsavel ?? this.atividade().responsavel,
      prazo: valor.prazo ?? this.atividade().prazo,
      etiquetas: this.etiquetasEditadas(),
      atualizadoEm: new Date().toISOString(),
    });
  }

  alterarTipo(evento: Event): void {
    const tipo = (evento.target as HTMLSelectElement).value as TipoAtividade;
    this.selecionarTipo(tipo);
  }

  selecionarTipo(tipo: string): void {
    const tipoAtividade = tipo as TipoAtividade;
    this.tipoSelecionado.set(tipoAtividade);
    this.formularioAtividade.controls.tipo.setValue(tipoAtividade);
    this.atualizarValidacaoVinculoHu(tipoAtividade);

    if (tipoAtividade === TipoAtividade.HU) {
      this.formularioAtividade.controls.atividadePaiId.setValue('');
    }

    this.sincronizarTextoHistoriaUsuario(this.formularioAtividade.controls.atividadePaiId.value ?? '');
    this.seletorHuAberto.set(false);
  }

  filtrarHistoriaUsuario(texto: string): void {
    this.filtroHistoriaUsuario.set(texto);
    this.seletorHuAberto.set(true);
  }

  abrirSeletorHu(): void {
    if (this.opcoesHistoriaUsuario().length === 0) {
      return;
    }

    this.seletorHuAberto.set(true);
  }

  alternarSeletorHu(): void {
    if (this.seletorHuAberto()) {
      this.seletorHuAberto.set(false);
      this.sincronizarTextoHistoriaUsuario(this.formularioAtividade.controls.atividadePaiId.value ?? '');
      return;
    }

    this.abrirSeletorHu();
  }

  selecionarHistoriaUsuario(opcao: OpcaoSeletorUi): void {
    this.formularioAtividade.controls.atividadePaiId.setValue(opcao.valor);
    this.filtroHistoriaUsuario.set(opcao.rotulo);
    this.seletorHuAberto.set(false);
  }

  limparHistoriaUsuarioSelecionada(): void {
    this.formularioAtividade.controls.atividadePaiId.setValue('');
    this.filtroHistoriaUsuario.set('');
    this.seletorHuAberto.set(false);
  }

  textoTipoAtividade(tipo: TipoAtividade): string {
    if (tipo === TipoAtividade.BUGFIX) {
      return 'BUGFIX';
    }

    if (tipo === TipoAtividade.HOTFIX) {
      return 'HOTFIX';
    }

    return 'HU';
  }

  adicionarEtiquetaPorEvento(evento: Event): void {
    evento.preventDefault();
    this.adicionarEtiqueta();
  }

  alterarCorEtiqueta(evento: Event): void {
    const elemento = evento.target as HTMLSelectElement;
    this.corEtiquetaSelecionada.set(elemento.value);
  }

  adicionarEtiqueta(): void {
    const etiquetaNormalizada = this.novaEtiqueta().trim();

    if (!etiquetaNormalizada) {
      return;
    }

    const etiquetaExiste = this.etiquetasEditadas().some(
      (etiquetaAtual) => etiquetaAtual.nome.toLowerCase() === etiquetaNormalizada.toLowerCase(),
    );

    if (etiquetaExiste) {
      this.novaEtiqueta.set('');
      return;
    }

    this.etiquetasEditadas.update((etiquetas) => [
      ...etiquetas,
      {
        nome: etiquetaNormalizada,
        cor: this.corEtiquetaSelecionada(),
      },
    ]);
    this.novaEtiqueta.set('');
  }

  removerEtiqueta(nomeEtiqueta: string): void {
    this.etiquetasEditadas.update((etiquetas) => etiquetas.filter((item) => item.nome !== nomeEtiqueta));
  }


  private atualizarValidacaoVinculoHu(tipo: TipoAtividade): void {
    const controle = this.formularioAtividade.controls.atividadePaiId;

    if (tipo === TipoAtividade.HU) {
      controle.clearValidators();
      controle.setValue('');
    } else {
      controle.setValidators([Validators.required]);
    }

    controle.updateValueAndValidity();
  }

  private sincronizarTextoHistoriaUsuario(atividadePaiId: string): void {
    if (!atividadePaiId) {
      this.filtroHistoriaUsuario.set('');
      return;
    }

    const opcaoSelecionada = this.opcoesHistoriaUsuario().find((opcao) => opcao.valor === atividadePaiId);
    this.filtroHistoriaUsuario.set(opcaoSelecionada?.rotulo ?? '');
  }

  @HostListener('document:click')
  aoClicarFora(): void {
    if (!this.seletorHuAberto()) {
      return;
    }

    this.seletorHuAberto.set(false);
    this.sincronizarTextoHistoriaUsuario(this.formularioAtividade.controls.atividadePaiId.value ?? '');
  }

  private historiaUsuarioEhCompativel(atividade: Atividade, tipo: TipoAtividade): boolean {
    if (tipo === TipoAtividade.HU) {
      return false;
    }

    const nomeRaia = this.obterNomeRaiaPorId(atividade.raiaId);

    if (tipo === TipoAtividade.BUGFIX) {
      return nomeRaia === 'teste';
    }

    return nomeRaia === 'concluidas';
  }

  private obterNomeRaiaPorId(raiaId: string): string {
    const raia = this.opcoesRaias().find((opcao) => opcao.valor === raiaId);
    return (raia?.rotulo ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase();
  }
}
