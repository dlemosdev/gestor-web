import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ChecklistItem } from '../../../../models/checklist-item.model';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-checklist-atividade',
  standalone: true,
  imports: [BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-4 rounded-2xl border border-borda bg-superficie-secundaria p-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-cor-texto">Checklist</h4>
        <span class="text-xs text-cor-texto-secundaria">{{ totalConcluido() }}/{{ checklist().length }}</span>
      </div>

      @for (item of checklist(); track item.id) {
        <label class="flex items-center gap-2.5 rounded-xl bg-superficie px-3 py-2 text-sm">
          <input
            type="checkbox"
            class="h-4 w-4 cursor-pointer accent-primaria focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria/40"
            [checked]="item.concluido"
            (change)="alternarItem(item.id)"
          />
          <span [class.line-through]="item.concluido" [class.text-cor-texto-secundaria]="item.concluido">{{ item.titulo }}</span>
        </label>
      }

      <div class="pt-1 flex gap-2">
        <input
          #inputChecklist
          type="text"
          placeholder="Novo item"
          class="h-10 flex-1 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria"
          (keydown.enter)="adicionarItem(inputChecklist.value); inputChecklist.value = ''"
        />
        <app-botao-ui
          texto="Adicionar"
          tamanho="sm"
          variante="secundario"
          (click)="adicionarItem(inputChecklist.value); inputChecklist.value = ''"
        />
      </div>
    </section>
  `,
})
export class ChecklistAtividadeComponent {
  readonly checklist = input<ChecklistItem[]>([]);
  readonly atualizarChecklist = output<ChecklistItem[]>();

  totalConcluido(): number {
    return this.checklist().filter((item) => item.concluido).length;
  }

  alternarItem(itemId: string): void {
    this.atualizarChecklist.emit(
      this.checklist().map((item) =>
        item.id === itemId
          ? {
              ...item,
              concluido: !item.concluido,
            }
          : item,
      ),
    );
  }

  adicionarItem(titulo: string): void {
    const tituloNormalizado = titulo.trim();

    if (!tituloNormalizado) {
      return;
    }

    this.atualizarChecklist.emit([
      ...this.checklist(),
      {
        id: crypto.randomUUID(),
        titulo: tituloNormalizado,
        concluido: false,
      },
    ]);
  }
}

