import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { Raia } from '../../../../models/raia.model';
import { EstadoVazioUiComponent } from '../../../../shared/ui/estado-vazio/estado-vazio-ui.component';
import { CardAtividadeComponent } from '../card-atividade/card-atividade.component';

export interface EventoSoltarAtividade {
  evento: CdkDragDrop<Atividade[]>;
  raiaDestinoId: string;
}

@Component({
  selector: 'app-raia-coluna',
  standalone: true,
  imports: [DragDropModule, EstadoVazioUiComponent, CardAtividadeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex h-full min-w-0 w-full flex-col rounded-2xl border border-borda bg-superficie p-3" [attr.aria-label]="'Raia ' + raia().nome">
      <header
        cdkDragHandle
        class="mb-3 flex cursor-grab items-center justify-between gap-2 rounded-lg active:cursor-grabbing"
        aria-label="Arrastar para reordenar raia"
        title="Arrastar para reordenar raia"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-left text-sm font-semibold text-cor-texto">{{ raia().nome }}</p>
        </div>

        <span
          class="inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primaria px-1.5 text-[11px] font-bold leading-none text-white"
          [attr.aria-label]="atividades().length + ' atividades na raia'"
        >
          {{ textoContadorAtividades() }}
        </span>
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
          <app-estado-vazio-ui titulo="Raia vazia" descricao="Nenhuma atividade nesta etapa." />
        }

        @for (atividade of atividades(); track atividade.id) {
          <app-card-atividade
            [atividade]="atividade"
            [arrastarDesabilitado]="arrastarDesabilitado() || raiaEhConcluida()"
            (abrirDetalhes)="abrirDetalhesAtividade.emit($event)"
            (excluirAtividade)="excluirAtividade.emit($event)"
          />
        }
      </div>
    </section>
  `,
})
export class RaiaColunaComponent {
  readonly raia = input.required<Raia>();
  readonly atividades = input<Atividade[]>([]);
  readonly idsConectados = input<string[]>([]);
  readonly arrastarDesabilitado = input(false);

  readonly excluirAtividade = output<string>();
  readonly abrirDetalhesAtividade = output<Atividade>();
  readonly soltar = output<EventoSoltarAtividade>();

  textoContadorAtividades(): string {
    const total = this.atividades().length;
    return total > 9 ? '9+' : String(total);
  }

  idDropList(): string {
    return `raia-drop-${this.raia().id}`;
  }

  raiaEhConcluida(): boolean {
    return this.raia().nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase() === 'concluidas';
  }
}
