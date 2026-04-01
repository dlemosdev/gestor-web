import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { ChecklistItem } from '../../../../models/checklist-item.model';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';
import { DrawerLateralUiComponent } from '../../../../shared/ui/drawer-lateral/drawer-lateral-ui.component';
import { OpcaoSeletorUi } from '../../../../shared/ui/seletor/seletor-ui.component';
import { ChecklistAtividadeComponent } from '../checklist-atividade/checklist-atividade.component';
import { ComentariosAtividadeComponent } from '../comentarios-atividade/comentarios-atividade.component';
import { FormularioAtividadeComponent } from '../formulario-atividade/formulario-atividade.component';

@Component({
  selector: 'app-drawer-detalhe-atividade',
  standalone: true,
  imports: [
    DatePipe,
    BotaoUiComponent,
    DrawerLateralUiComponent,
    FormularioAtividadeComponent,
    ChecklistAtividadeComponent,
    ComentariosAtividadeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (atividade()) {
      <app-drawer-lateral-ui [aberto]="aberto()" [titulo]="modoCriacao() ? 'Nova Atividade' : 'Detalhes da Atividade'" (fechar)="fechar.emit()">
        <section class="space-y-6 pb-2">
          <app-formulario-atividade
            [atividade]="atividade()!"
            [responsaveis]="responsaveis()"
            [opcoesRaias]="opcoesRaias()"
            [modoCriacao]="modoCriacao()"
            (salvar)="salvarAtividade.emit($event)"
          />

          @if (!modoCriacao()) {
            <div class="pt-1">
              <app-checklist-atividade
                [checklist]="atividade()!.checklist"
                (atualizarChecklist)="atualizarChecklist.emit($event)"
              />
            </div>

            <div class="pt-1">
              <app-comentarios-atividade
                [comentarios]="atividade()!.comentarios"
                (adicionar)="adicionarComentario.emit($event)"
              />
            </div>

            <section class="rounded-2xl border border-borda bg-superficie-secundaria p-4">
              <h4 class="text-sm font-semibold text-cor-texto">Histórico (mock)</h4>
              <ul class="mt-3 list-disc space-y-1.5 pl-4 text-xs text-cor-texto-secundaria">
                <li>Atividade criada em {{ atividade()!.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                <li>Última atualização em {{ atividade()!.atualizadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
              </ul>
            </section>
          }

          <div class="flex justify-end gap-2 border-t border-borda pt-4">
            @if (!modoCriacao()) {
              <app-botao-ui texto="Excluir" variante="perigo" (click)="excluirAtividade.emit(atividade()!.id)" />
            }
            <app-botao-ui texto="Fechar" variante="secundario" (click)="fechar.emit()" />
          </div>
        </section>
      </app-drawer-lateral-ui>
    }
  `,
})
export class DrawerDetalheAtividadeComponent {
  readonly aberto = input(false);
  readonly atividade = input<Atividade | null>(null);
  readonly responsaveis = input<OpcaoSeletorUi[]>([]);
  readonly opcoesRaias = input<OpcaoSeletorUi[]>([]);
  readonly modoCriacao = input(false);

  readonly fechar = output<void>();
  readonly salvarAtividade = output<Atividade>();
  readonly excluirAtividade = output<string>();
  readonly atualizarChecklist = output<ChecklistItem[]>();
  readonly adicionarComentario = output<string>();
}
