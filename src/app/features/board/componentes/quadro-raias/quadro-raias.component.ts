import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { Raia } from '../../../../models/raia.model';
import { EstadoVazioUiComponent } from '../../../../shared/ui/estado-vazio/estado-vazio-ui.component';
import { EventoSoltarAtividade, RaiaColunaComponent } from '../raia-coluna/raia-coluna.component';

export interface RaiaComAtividades {
  raia: Raia;
  atividades: Atividade[];
}

@Component({
  selector: 'app-quadro-raias',
  standalone: true,
  imports: [DragDropModule, EstadoVazioUiComponent, RaiaColunaComponent],
  host: { class: 'block h-full min-h-0' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (raiasComAtividades().length === 0) {
      <app-estado-vazio-ui titulo="Nenhuma raia configurada" descricao="Esse projeto nao possui raias visiveis no board." />
    } @else {
      <section class="flex h-full min-h-0 flex-col pt-2">
        <div
          class="lista-raias flex h-full min-h-0 flex-1 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-2 pb-0 snap-x snap-proximity lg:gap-2.5 lg:overflow-x-hidden"
          cdkDropList
          cdkDropListOrientation="horizontal"
          [cdkDropListAutoScrollStep]="24"
          [cdkDropListData]="raiasComAtividades()"
          (cdkDropListDropped)="reordenarRaias($event)"
        >
          @for (item of raiasComAtividades(); track item.raia.id) {
            <div cdkDrag cdkDragLockAxis="x" class="relative h-full w-[82vw] min-w-[260px] max-w-[340px] snap-start flex-none pb-2 lg:w-auto lg:min-w-0 lg:max-w-none lg:flex-1 lg:basis-0">
              <app-raia-coluna
                [raia]="item.raia"
                [atividades]="item.atividades"
                [idsConectados]="idsDropList()"
                [arrastarDesabilitado]="arrastarDesabilitado()"
                (abrirDetalhesAtividade)="abrirDetalhesAtividade.emit($event)"
                (editarAtividade)="editarAtividade.emit($event)"
                (excluirAtividade)="excluirAtividade.emit($event)"
                (soltar)="soltarAtividade.emit($event)"
              />
            </div>
          }
        </div>
      </section>
    }
  `,
})
export class QuadroRaiasComponent {
  readonly raiasComAtividades = input<RaiaComAtividades[]>([]);
  readonly arrastarDesabilitado = input(false);
  readonly abrirDetalhesAtividade = output<Atividade>();
  readonly editarAtividade = output<Atividade>();
  readonly excluirAtividade = output<string>();
  readonly soltarAtividade = output<EventoSoltarAtividade>();
  readonly moverRaia = output<RaiaComAtividades[]>();
  readonly idsDropList = computed(() => this.raiasComAtividades().map((item) => `raia-drop-${item.raia.id}`));

  reordenarRaias(evento: CdkDragDrop<RaiaComAtividades[]>): void {
    if (evento.previousIndex === evento.currentIndex) return;
    const lista = [...this.raiasComAtividades()];
    moveItemInArray(lista, evento.previousIndex, evento.currentIndex);
    this.moverRaia.emit(lista);
  }
}
