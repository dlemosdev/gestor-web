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
      class="cartao-atividade relative select-none touch-none cursor-pointer rounded-2xl border border-borda bg-superficie p-3.5 shadow-sm transition-shadow duration-150 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
      [class.opacity-90]="arrastando()"
      (click)="abrirDetalhesComSeguranca()"
      (keydown.enter)="abrirDetalhesComSeguranca()"
      (keydown.space)="$event.preventDefault(); abrirDetalhesComSeguranca()"
      tabindex="0"
      role="button"
      aria-label="Abrir detalhes da atividade"
      cdkDrag
      [cdkDragData]="atividade()"
      [cdkDragDisabled]="arrastarDesabilitado()"
      [cdkDragStartDelay]="{ touch: 140, mouse: 0 }"
      (cdkDragStarted)="arrastando.set(true)"
      (cdkDragEnded)="finalizarArraste()"
    >
      <button
        type="button"
        class="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg border border-transparent bg-transparent text-red-500 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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

      <h4 class="line-clamp-2 pr-7 text-sm font-semibold text-cor-texto">{{ atividade().titulo }}</h4>
      <p class="mt-1.5 line-clamp-2 text-xs leading-5 text-cor-texto-secundaria">{{ atividade().descricao }}</p>

      <div class="mt-3.5 flex flex-wrap gap-1.5">
        <app-badge-ui [texto]="atividade().prioridade" [variante]="variantePrioridade()" />
        @for (etiqueta of atividade().etiquetas; track etiqueta.nome) {
          <span
            class="inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold"
            [style.backgroundColor]="etiqueta.cor + '20'"
            [style.borderColor]="etiqueta.cor + '66'"
            [style.color]="etiqueta.cor"
          >
            {{ etiqueta.nome }}
          </span>
        }
      </div>

      <footer class="mt-3.5 flex items-center justify-between text-xs text-cor-texto-secundaria">
        <span>{{ atividade().responsavel }}</span>
        <span>{{ atividade().prazo | date: 'dd/MM' }}</span>
      </footer>
    </article>

    <app-dialogo-confirmacao-ui
      [aberto]="modalExclusaoAberto()"
      titulo="Excluir atividade"
      [descricao]="'Tem certeza que deseja excluir a atividade ' + atividade().titulo + '?'"
      textoAcao="Excluir"
      (fechar)="fecharModalExclusao()"
      (confirmar)="confirmarExclusaoAtividade()"
    ></app-dialogo-confirmacao-ui>
  `,
  styles: `
    .cartao-atividade {
      will-change: transform;
    }

    :host ::ng-deep .cdk-drag-dragging {
      transition: none !important;
    }

    :host ::ng-deep .cdk-drag-preview {
      border-radius: 1rem;
      box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
      transition: none !important;
      will-change: transform;
      pointer-events: none;
    }

    :host ::ng-deep .cdk-drag-placeholder {
      border: 2px dashed rgb(147 197 253 / 0.9);
      border-radius: 1rem;
      background: rgb(239 246 255 / 0.8);
      min-height: 86px;
      opacity: 0.55;
      transition: none !important;
    }

    :host-context(.cdk-drop-list-dragging) .cartao-atividade:not(.cdk-drag-placeholder) {
      transition: transform 120ms cubic-bezier(0.2, 0, 0, 1);
      will-change: transform;
    }
  `,
})
export class CardAtividadeComponent {
  readonly atividade = input.required<Atividade>();
  readonly arrastarDesabilitado = input(false);
  readonly abrirDetalhes = output<Atividade>();
  readonly excluirAtividade = output<string>();

  readonly arrastando = signal(false);
  readonly momentoFimArraste = signal(0);
  readonly modalExclusaoAberto = signal(false);

  readonly variantePrioridade = computed<'neutro' | 'info' | 'alerta' | 'critico'>(() => {
    const prioridade = this.atividade().prioridade;

    if (prioridade === Prioridade.MEDIA) {
      return 'info';
    }

    if (prioridade === Prioridade.ALTA) {
      return 'alerta';
    }

    if (prioridade === Prioridade.CRITICA) {
      return 'critico';
    }

    return 'neutro';
  });

  finalizarArraste(): void {
    this.arrastando.set(false);
    this.momentoFimArraste.set(Date.now());
  }

  abrirDetalhesComSeguranca(): void {
    if (Date.now() - this.momentoFimArraste() < 180) {
      return;
    }

    this.abrirDetalhes.emit(this.atividade());
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
