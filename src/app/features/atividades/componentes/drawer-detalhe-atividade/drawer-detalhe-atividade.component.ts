import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { ChecklistItem } from '../../../../models/checklist-item.model';
import { HistoricoAtividade } from '../../../../models/historico-atividade.model';
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
            [historiasUsuarioDisponiveis]="historiasUsuarioDisponiveis()"
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
              <h4 class="text-sm font-semibold text-cor-texto">Histórico</h4>
              <ul class="mt-3 space-y-2 text-xs text-cor-texto-secundaria">
                <li class="rounded-xl border border-borda bg-superficie px-3 py-2">
                  <p class="font-medium text-cor-texto">Código: {{ atividade()!.codigoReferencia || 'Será gerado ao cadastrar' }}</p>
                  <span>Criada em {{ atividade()!.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                </li>
                @if (atividade()!.dataConclusao) {
                  <li class="rounded-xl border border-borda bg-superficie px-3 py-2">
                    <p class="font-medium text-cor-texto">Atividade concluída</p>
                    <span>{{ atividade()!.dataConclusao | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </li>
                }
                @for (evento of historico(); track evento.id) {
                  <li class="rounded-xl border border-borda bg-superficie px-3 py-2">
                    <p class="font-medium text-cor-texto">{{ evento.descricao }}</p>
                    <span>{{ evento.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </li>
                }
                <li class="rounded-xl border border-borda bg-superficie px-3 py-2">
                  <p class="font-medium text-cor-texto">Última atualização</p>
                  <span>{{ atividade()!.atualizadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                </li>
              </ul>
            </section>
          }

          <div class="flex justify-end gap-2 border-t border-borda pt-4">
            @if (!modoCriacao() && !atividade()!.dataConclusao) {
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
  readonly historico = input<HistoricoAtividade[]>([]);
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
