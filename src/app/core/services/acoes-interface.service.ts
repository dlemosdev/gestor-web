import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AcoesInterfaceService {
  private readonly solicitacaoNovoProjetoInterna = signal(0);
  private readonly solicitacaoNovaAtividadeInterna = signal(0);

  readonly solicitacaoNovoProjeto = this.solicitacaoNovoProjetoInterna.asReadonly();
  readonly solicitacaoNovaAtividade = this.solicitacaoNovaAtividadeInterna.asReadonly();

  solicitarNovoProjeto(): void {
    this.solicitacaoNovoProjetoInterna.update((contador) => contador + 1);
  }

  solicitarNovaAtividade(): void {
    this.solicitacaoNovaAtividadeInterna.update((contador) => contador + 1);
  }
}

