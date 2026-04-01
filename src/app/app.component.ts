import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TemaAparenciaService } from './core/services/tema-aparencia.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly temaAparenciaService = inject(TemaAparenciaService);

  constructor() {
    this.temaAparenciaService.temaAtual();
  }
}
