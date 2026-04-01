import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Projeto } from '../../../../models/projeto.model';
import { StatusProjeto } from '../../../../models/enums/status-projeto.enum';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';
import { CardUiComponent } from '../../../../shared/ui/card/card-ui.component';

@Component({
  selector: 'app-card-projeto',
  standalone: true,
  imports: [DatePipe, BadgeUiComponent, BotaoUiComponent, CardUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-card-ui [titulo]="projeto().nome" [descricao]="projeto().descricao">
      <div class="flex items-center justify-between gap-2 border-b border-borda pb-3">
        <app-badge-ui
          [texto]="projeto().status"
          [variante]="projeto().status === statusProjeto.ATIVO ? 'sucesso' : 'neutro'"
        />
        <span class="text-xs text-cor-texto-secundaria">
          Atualizado em {{ projeto().atualizadoEm | date: 'dd/MM/yyyy' }}
        </span>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <app-botao-ui texto="Abrir Board" tamanho="sm" [rota]="['/projetos', projeto().id, 'board']" />
        <app-botao-ui texto="Editar" tamanho="sm" variante="secundario" (click)="editarProjeto.emit(projeto())" />
        <app-botao-ui
          [texto]="projeto().status === statusProjeto.ATIVO ? 'Arquivar' : 'Ativar'"
          tamanho="sm"
          variante="fantasma"
          (click)="alternarStatusProjeto.emit(projeto())"
        />
      </div>
    </app-card-ui>
  `,
})
export class CardProjetoComponent {
  readonly statusProjeto = StatusProjeto;

  readonly projeto = input.required<Projeto>();

  readonly editarProjeto = output<Projeto>();
  readonly alternarStatusProjeto = output<Projeto>();
}

