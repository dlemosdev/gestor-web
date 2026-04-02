import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { Raia } from '../../../../models/raia.model';
import { DialogoConfirmacaoUiComponent } from '../../../../shared/ui/dialogo-confirmacao/dialogo-confirmacao-ui.component';
import { EstadoVazioUiComponent } from '../../../../shared/ui/estado-vazio/estado-vazio-ui.component';
import { CardAtividadeComponent } from '../card-atividade/card-atividade.component';

export interface EventoSoltarAtividade {
  evento: CdkDragDrop<Atividade[]>;
  raiaDestinoId: string;
}

@Component({
  selector: 'app-raia-coluna',
  standalone: true,
  imports: [DragDropModule, EstadoVazioUiComponent, CardAtividadeComponent, DialogoConfirmacaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex h-full min-w-0 w-full flex-col rounded-2xl border border-borda bg-superficie p-3" [attr.aria-label]="'Raia ' + raia().nome">
      <header
        cdkDragHandle
        class="mb-3 flex cursor-grab items-center justify-between gap-2 rounded-lg active:cursor-grabbing"
        aria-label="Arrastar para reordenar raia"
        title="Arrastar para reordenar raia"
      >
        @if (modoEdicaoNome()) {
          <input
            #inputNomeRaia
            [value]="raia().nome"
            class="h-8 w-full rounded-lg border border-borda px-2 text-sm outline-none focus:border-primaria"
            (keydown.enter)="salvarNomeRaia(inputNomeRaia.value)"
            (blur)="salvarNomeRaia(inputNomeRaia.value)"
            aria-label="Editar nome da raia"
          />
        } @else {
          <button
            type="button"
            class="min-w-0 flex-1 truncate text-left text-sm font-semibold text-cor-texto"
            (click)="modoEdicaoNome.set(true)"
            [attr.aria-label]="'Editar nome da raia ' + raia().nome"
          >
            {{ raia().nome }}
          </button>
        }

        <div class="flex items-center gap-1">
          <span
            class="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primaria px-1.5 text-[11px] font-bold leading-none text-white"
            [attr.aria-label]="atividades().length + ' atividades na raia'"
          >
            {{ textoContadorAtividades() }}
          </span>
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent bg-transparent text-red-500 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            (click)="abrirModalExclusao()"
            aria-label="Excluir raia"
            title="Excluir raia"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </header>

      <div
        class="min-h-24 flex flex-1 flex-col gap-3.5 overflow-y-auto rounded-xl bg-superficie-secundaria/40 p-3.5"
        cdkDropList
        [id]="idDropList()"
        cdkDropListOrientation="vertical"
        [cdkDropListAutoScrollStep]="20"
        [cdkDropListData]="atividades()"
        [cdkDropListConnectedTo]="idsConectados()"
        (cdkDropListDropped)="soltar.emit({ evento: $event, raiaDestinoId: raia().id })"
        role="list"
        aria-label="Atividades da raia"
      >
        @if (atividades().length === 0) {
          <app-estado-vazio-ui titulo="Raia vazia" descricao="Adicione uma nova atividade para iniciar essa etapa." />
        }

        @for (atividade of atividades(); track atividade.id) {
          <app-card-atividade
            [atividade]="atividade"
            [arrastarDesabilitado]="arrastarDesabilitado()"
            (abrirDetalhes)="abrirDetalhesAtividade.emit($event)"
            (excluirAtividade)="excluirAtividade.emit($event)"
          />
        }
      </div>
    </section>

    <app-dialogo-confirmacao-ui
      [aberto]="modalExclusaoAberto()"
      titulo="Excluir raia"
      [descricao]="'Tem certeza que deseja excluir a raia ' + raia().nome + '? Esta ação removerá também as atividades vinculadas.'"
      textoAcao="Excluir"
      (fechar)="fecharModalExclusao()"
      (confirmar)="confirmarExclusaoRaia()"
    ></app-dialogo-confirmacao-ui>
  `,
})
export class RaiaColunaComponent {
  readonly raia = input.required<Raia>();
  readonly atividades = input<Atividade[]>([]);
  readonly idsConectados = input<string[]>([]);
  readonly arrastarDesabilitado = input(false);

  readonly editarNomeRaia = output<{ raiaId: string; nome: string }>();
  readonly excluirRaia = output<Raia>();
  readonly excluirAtividade = output<string>();
  readonly abrirDetalhesAtividade = output<Atividade>();
  readonly soltar = output<EventoSoltarAtividade>();

  readonly modoEdicaoNome = signal(false);
  readonly modalExclusaoAberto = signal(false);

  textoContadorAtividades(): string {
    const total = this.atividades().length;
    return total > 9 ? '9+' : String(total);
  }

  idDropList(): string {
    return `raia-drop-${this.raia().id}`;
  }

  salvarNomeRaia(nome: string): void {
    const nomeNormalizado = nome.trim();

    if (nomeNormalizado.length >= 2 && nomeNormalizado !== this.raia().nome) {
      this.editarNomeRaia.emit({ raiaId: this.raia().id, nome: nomeNormalizado });
    }

    this.modoEdicaoNome.set(false);
  }

  abrirModalExclusao(): void {
    this.modalExclusaoAberto.set(true);
  }

  fecharModalExclusao(): void {
    this.modalExclusaoAberto.set(false);
  }

  confirmarExclusaoRaia(): void {
    this.modalExclusaoAberto.set(false);
    this.excluirRaia.emit(this.raia());
  }

}

