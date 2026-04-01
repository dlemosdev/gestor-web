import { Injectable, signal } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { Raia } from '../models/raia.model';
import { DadosMockService } from './dados-mock.service';

@Injectable({
  providedIn: 'root',
})
export class RaiasService {
  private readonly chaveRaias = 'gestor:raias';

  private readonly raiasInterno = signal<Raia[]>([]);
  readonly raias = this.raiasInterno.asReadonly();

  constructor(
    private readonly armazenamentoLocalService: ArmazenamentoLocalService,
    private readonly dadosMockService: DadosMockService,
  ) {
    this.dadosMockService.garantirDadosIniciais();
    this.carregar();
  }

  obterRaiasPorProjeto(projetoId: string): Raia[] {
    return this.raiasInterno()
      .filter((raia) => raia.projetoId === projetoId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  garantirRaiasPadraoProjeto(projetoId: string): void {
    const raiasProjeto = this.obterRaiasPorProjeto(projetoId);

    if (raiasProjeto.length > 0) {
      return;
    }

    const agora = new Date().toISOString();
    const nomesPadrao = ['Backlog', 'Em andamento', 'Bloqueadas', 'Concluidas'];

    this.raiasInterno.update((listaAtual) => [
      ...listaAtual,
      ...nomesPadrao.map((nome, indice) => ({
        id: crypto.randomUUID(),
        projetoId,
        nome,
        ordem: indice + 1,
        criadoEm: agora,
        atualizadoEm: agora,
      })),
    ]);

    this.persistir();
  }

  criarRaia(projetoId: string, nome: string): void {
    const ordem = this.obterRaiasPorProjeto(projetoId).length + 1;

    this.raiasInterno.update((listaAtual) => [
      ...listaAtual,
      {
        id: crypto.randomUUID(),
        projetoId,
        nome,
        ordem,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString(),
      },
    ]);

    this.persistir();
  }

  editarNomeRaia(raiaId: string, nome: string): void {
    this.raiasInterno.update((listaAtual) =>
      listaAtual.map((raia) =>
        raia.id === raiaId
          ? {
              ...raia,
              nome,
              atualizadoEm: new Date().toISOString(),
            }
          : raia,
      ),
    );

    this.persistir();
  }

  excluirRaia(raiaId: string): void {
    this.raiasInterno.update((listaAtual) => {
      const raiaRemovida = listaAtual.find((raia) => raia.id === raiaId);

      if (!raiaRemovida) {
        return listaAtual;
      }

      return listaAtual
        .filter((raia) => raia.id !== raiaId)
        .map((raia) => {
          if (raia.projetoId !== raiaRemovida.projetoId) {
            return raia;
          }

          const novaOrdem = this.calcularNovaOrdem(raia.ordem, raiaRemovida.ordem);
          return novaOrdem === raia.ordem ? raia : { ...raia, ordem: novaOrdem, atualizadoEm: new Date().toISOString() };
        });
    });

    this.persistir();
  }

  excluirRaiasDoProjeto(projetoId: string): void {
    this.raiasInterno.update((listaAtual) => listaAtual.filter((raia) => raia.projetoId !== projetoId));
    this.persistir();
  }

  atualizarOrdemRaias(projetoId: string, raiasReordenadas: Raia[]): void {
    const idsReordenados = new Set(raiasReordenadas.map((raia) => raia.id));

    this.raiasInterno.update((listaAtual) => {
      const outrasRaias = listaAtual.filter((raia) => !(raia.projetoId === projetoId && idsReordenados.has(raia.id)));
      const raiasAtualizadas = raiasReordenadas.map((raia, indice) => ({
        ...raia,
        ordem: indice + 1,
        atualizadoEm: new Date().toISOString(),
      }));

      return [...outrasRaias, ...raiasAtualizadas];
    });

    this.persistir();
  }

  private calcularNovaOrdem(ordemAtual: number, ordemRemovida: number): number {
    if (ordemAtual > ordemRemovida) {
      return ordemAtual - 1;
    }

    return ordemAtual;
  }

  private carregar(): void {
    const raiasSalvas = this.armazenamentoLocalService.obterItem<Raia[]>(this.chaveRaias);
    this.raiasInterno.set(raiasSalvas ?? []);
  }

  private persistir(): void {
    this.armazenamentoLocalService.salvarItem(this.chaveRaias, this.raiasInterno());
  }
}

