import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Projeto } from '../../../../models/projeto.model';
import { EstadoVazioUiComponent } from '../../../../shared/ui/estado-vazio/estado-vazio-ui.component';
import { CardProjetoComponent } from '../card-projeto/card-projeto.component';

@Component({
  selector: 'app-lista-projetos',
  standalone: true,
  imports: [CardProjetoComponent, EstadoVazioUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (projetos().length === 0) {
      <app-estado-vazio-ui
        titulo="Nenhum projeto encontrado"
        descricao="Crie um projeto para começar a organizar atividades por raias."
      />
    } @else {
      <section class="grid grid-cols-1 gap-5 xl:grid-cols-2">
        @for (projeto of projetos(); track projeto.id) {
          <app-card-projeto
            [projeto]="projeto"
            (editarProjeto)="editarProjeto.emit($event)"
            (alternarStatusProjeto)="alternarStatusProjeto.emit($event)"
          />
        }
      </section>
    }
  `,
})
export class ListaProjetosComponent {
  readonly projetos = input.required<Projeto[]>();

  readonly editarProjeto = output<Projeto>();
  readonly alternarStatusProjeto = output<Projeto>();
}


