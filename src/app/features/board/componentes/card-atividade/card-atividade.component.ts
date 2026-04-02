import { DatePipe } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { Prioridade } from '../../../../models/enums/prioridade.enum';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { DialogoConfirmacaoUiComponent } from '../../../../shared/ui/dialogo-confirmacao/dialogo-confirmacao-ui.component';

@Component({
  selector: 'app-card-atividade',
  standalone: true,
  imports: [DragDropModule, DatePipe, BadgeUiComponent, DialogoConfirmacaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="cartao-atividade relative select-none touch-none rounded-2xl border border-borda bg-superficie p-3.5 shadow-sm transition-shadow duration-150 hover:shadow-md"
      [class.opacity-90]="arrastando()"
      cdkDrag
      [cdkDragData]="atividade()"
      [cdkDragDisabled]="arrastarDesabilitado()"
      [cdkDragStartDelay]="{ touch: 140, mouse: 0 }"
      (cdkDragStarted)="arrastando.set(true)"
      (cdkDragEnded)="finalizarArraste()"
    >
      <div class="absolute right-2.5 top-2.5 flex items-center gap-1">
        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-cor-texto-secundaria transition hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
          (click)="abrirDetalhesPorBotao($event)"
          aria-label="Visualizar detalhes da atividade"
          title="Visualizar detalhes"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>

        <button
          type="button"
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-cor-texto-secundaria transition hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
          (click)="abrirEdicaoPorBotao($event)"
          aria-label="Editar atividade"
          title="Editar atividade"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
        </button>

        @if (!atividadeConcluida()) {
          <button
            type="button"
            class="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-red-500 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            (click)="abrirModalExclusao($event)"
            aria-label="Excluir atividade"
            title="Excluir atividade"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        }
      </div>

      <h4 class="line-clamp-2 pr-24 text-sm font-semibold text-cor-texto" [class.line-through]="atividade().dataConclusao" [class.text-cor-texto-secundaria]="atividade().dataConclusao">
        {{ atividade().titulo }}
      </h4>

      <div class="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-cor-texto-suave">
        <span class="rounded-md border border-borda bg-superficie-secundaria px-2 py-1">{{ atividade().codigoReferencia || 'Novo' }}</span>
        <span class="rounded-md border border-borda bg-superficie-secundaria px-2 py-1">{{ atividade().tipo }}</span>
      </div>

      <p class="mt-1.5 line-clamp-2 text-xs leading-5 text-cor-texto-secundaria">{{ atividade().descricao }}</p>

      <div class="mt-3.5 flex flex-wrap gap-1.5">
        <app-badge-ui [texto]="atividade().prioridade" [variante]="variantePrioridade()" />
        @for (etiqueta of atividade().etiquetas; track etiqueta.nome) {
          <span class="inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold" [style.backgroundColor]="etiqueta.cor + '20'" [style.borderColor]="etiqueta.cor + '66'" [style.color]="etiqueta.cor">
            {{ etiqueta.nome }}
          </span>
        }
      </div>

      <footer class="mt-3.5 flex items-center justify-between text-xs text-cor-texto-secundaria">
        <span>{{ atividade().responsavel }}</span>
        <span>{{ atividade().prazo | date: 'dd/MM' }}</span>
      </footer>

      @if (atividade().dataConclusao) {
        <div class="mt-2 text-[11px] font-semibold text-emerald-300">Concluida em {{ atividade().dataConclusao | date: 'dd/MM/yyyy' }}</div>
      }
    </article>

    <app-dialogo-confirmacao-ui
      [aberto]="modalExclusaoAberto()"
      titulo="Excluir atividade"
      [descricao]="'Tem certeza que deseja excluir a atividade ' + atividade().titulo + '?'"
      textoAcao="Excluir"
      (fechar)="fecharModalExclusao()"
      (confirmar)="confirmarExclusaoAtividade()"
    />
  `,
})
export class CardAtividadeComponent {
  readonly atividade = input.required<Atividade>();
  readonly arrastarDesabilitado = input(false);
  readonly abrirDetalhes = output<Atividade>();
  readonly editarAtividade = output<Atividade>();
  readonly excluirAtividade = output<string>();

  readonly arrastando = signal(false);
  readonly momentoFimArraste = signal(0);
  readonly modalExclusaoAberto = signal(false);
  readonly atividadeConcluida = computed(() => Boolean(this.atividade().dataConclusao));
  readonly variantePrioridade = computed<'neutro' | 'info' | 'alerta' | 'critico'>(() => {
    const prioridade = this.atividade().prioridade;
    if (prioridade === Prioridade.MEDIA) return 'info';
    if (prioridade === Prioridade.ALTA) return 'alerta';
    if (prioridade === Prioridade.CRITICA) return 'critico';
    return 'neutro';
  });

  finalizarArraste(): void {
    this.arrastando.set(false);
    this.momentoFimArraste.set(Date.now());
  }

  abrirDetalhesPorBotao(evento: Event): void {
    evento.stopPropagation();
    evento.preventDefault();
    if (Date.now() - this.momentoFimArraste() < 180) return;
    this.abrirDetalhes.emit(this.atividade());
  }

  abrirEdicaoPorBotao(evento: Event): void {
    evento.stopPropagation();
    evento.preventDefault();
    if (Date.now() - this.momentoFimArraste() < 180) return;
    this.editarAtividade.emit(this.atividade());
  }

  abrirModalExclusao(evento: Event): void {
    evento.stopPropagation();
    evento.preventDefault();
    this.modalExclusaoAberto.set(true);
  }

  fecharModalExclusao(): void {
    this.modalExclusaoAberto.set(false);
  }

  confirmarExclusaoAtividade(): void {
    this.modalExclusaoAberto.set(false);
    this.excluirAtividade.emit(this.atividade().id);
  }
}
