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
  imports: [DrawerLateralUiComponent, BotaoUiComponent, FormularioAtividadeComponent, ChecklistAtividadeComponent, ComentariosAtividadeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (atividade()) {
      <app-drawer-lateral-ui [aberto]="aberto()" [titulo]="modoCriacao() ? 'Nova atividade' : 'Editar atividade'" (fechar)="fechar.emit()">
        <section class="space-y-6 pb-2">
          <app-formulario-atividade
            [atividade]="atividade()!"
            [responsaveis]="responsaveis()"
            [opcoesRaias]="opcoesRaias()"
            [historiasUsuarioDisponiveis]="historiasUsuarioDisponiveis()"
            [modoCriacao]="modoCriacao()"
            (salvar)="salvarAtividade.emit($event)"
          />

          @if (!modoCriacao()) {
            <section class="rounded-2xl border border-borda bg-superficie-secundaria p-4">
              <app-checklist-atividade [checklist]="atividade()!.checklist" (atualizarChecklist)="atualizarChecklist.emit($event)" />
            </section>

            <section class="rounded-2xl border border-borda bg-superficie-secundaria p-4">
              <app-comentarios-atividade [comentarios]="atividade()!.comentarios" (adicionar)="adicionarComentario.emit($event)" />
            </section>

            <div class="flex justify-end gap-2 border-t border-borda pt-4">
              @if (!atividade()!.dataConclusao) {
                <app-botao-ui texto="Excluir" icone="trash" variante="perigo" (click)="excluirAtividade.emit(atividade()!.id)" />
              }
              <app-botao-ui texto="Fechar" icone="close" variante="secundario" (click)="fechar.emit()" />
            </div>
          }
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
  readonly historiasUsuarioDisponiveis = input<Atividade[]>([]);
  readonly modoCriacao = input(false);
  readonly fechar = output<void>();
  readonly salvarAtividade = output<Atividade>();
  readonly excluirAtividade = output<string>();
  readonly atualizarChecklist = output<ChecklistItem[]>();
  readonly adicionarComentario = output<string>();
}
