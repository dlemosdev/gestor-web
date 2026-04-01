import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Atividade } from '../../../../models/atividade.model';
import { StatusAtividade } from '../../../../models/enums/status-atividade.enum';
import { Prioridade } from '../../../../models/enums/prioridade.enum';
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
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Título</span>
        <input formControlName="titulo" type="text" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria" />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Descrição</span>
        <textarea formControlName="descricao" rows="4" class="rounded-xl border border-borda px-3 py-2.5 text-sm outline-none focus:border-primaria"></textarea>
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
            class="inline-flex h-11 items-center justify-center rounded-xl border border-borda px-3 text-sm font-semibold text-cor-texto-secundaria transition hover:border-borda-forte hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            (click)="adicionarEtiqueta()"
          >
            Adicionar
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
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Raia</span>
          <select formControlName="raiaId" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesRaias(); track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Prioridade</span>
          <select formControlName="prioridade" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesPrioridade; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Status</span>
          <select formControlName="status" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesStatus; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>
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
          [desabilitado]="formularioAtividade.invalid"
        />
      </div>
    </form>
  `,
})
export class FormularioAtividadeComponent {
  private readonly fb = inject(FormBuilder);

  readonly atividade = input.required<Atividade>();
  readonly responsaveis = input<OpcaoSeletorUi[]>([]);
  readonly opcoesRaias = input<OpcaoSeletorUi[]>([]);
  readonly modoCriacao = input(false);
  readonly salvar = output<Atividade>();
  readonly etiquetasEditadas = signal<EtiquetaAtividade[]>([]);
  readonly novaEtiqueta = signal('');
  readonly corEtiquetaSelecionada = signal('#2563EB');

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

  readonly formularioAtividade = this.fb.group({
    raiaId: ['', Validators.required],
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(8)]],
    prioridade: [Prioridade.MEDIA, Validators.required],
    status: [StatusAtividade.BACKLOG, Validators.required],
    responsavel: ['', Validators.required],
    prazo: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const atividade = this.atividade();
      this.etiquetasEditadas.set([...(atividade.etiquetas ?? [])]);
      this.novaEtiqueta.set('');
      this.corEtiquetaSelecionada.set('#2563EB');
      this.formularioAtividade.patchValue({
        raiaId: atividade.raiaId,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        prioridade: atividade.prioridade,
        status: atividade.status,
        responsavel: atividade.responsavel,
        prazo: atividade.prazo,
      });
    });
  }

  salvarFormulario(): void {
    if (this.formularioAtividade.invalid) {
      this.formularioAtividade.markAllAsTouched();
      return;
    }

    const valor = this.formularioAtividade.getRawValue();

    this.salvar.emit({
      ...this.atividade(),
      raiaId: valor.raiaId ?? this.atividade().raiaId,
      titulo: valor.titulo ?? this.atividade().titulo,
      descricao: valor.descricao ?? this.atividade().descricao,
      prioridade: (valor.prioridade as Prioridade) ?? this.atividade().prioridade,
      status: (valor.status as StatusAtividade) ?? this.atividade().status,
      responsavel: valor.responsavel ?? this.atividade().responsavel,
      prazo: valor.prazo ?? this.atividade().prazo,
      etiquetas: this.etiquetasEditadas(),
      atualizadoEm: new Date().toISOString(),
    });
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
}
