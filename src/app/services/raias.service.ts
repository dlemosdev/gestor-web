import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { apiUrlBase } from '../core/config/api.config';
import { Raia } from '../models/raia.model';

@Injectable({
  providedIn: 'root',
})
export class RaiasService {
  private readonly urlRaias = `${apiUrlBase}/raias`;

  private readonly raiasInterno = signal<Raia[]>([]);
  readonly raias = this.raiasInterno.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.carregarRaias();
  }

  obterRaiasPorProjeto(projetoId: string): Raia[] {
    return this.raiasInterno()
      .filter((raia) => raia.projetoId === projetoId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  carregarRaiasProjeto(projetoId: string): void {
    this.http.get<Raia[]>(`${apiUrlBase}/projetos/${projetoId}/raias`).subscribe({
      next: (raiasProjeto) => {
        this.atualizarRaiasProjetoNoEstado(
          projetoId,
          raiasProjeto.map((raia) => this.normalizarRaia(raia)),
        );
      },
      error: (erro) => {
        console.error('Falha ao carregar raias do projeto na API.', erro);
      },
    });
  }

  excluirRaiasDoProjeto(projetoId: string): void {
    this.raiasInterno.update((listaAtual) => listaAtual.filter((raia) => raia.projetoId !== projetoId));
  }

  atualizarOrdemRaias(projetoId: string, raiasReordenadas: Raia[]): void {
    const raiasAtualizadas = raiasReordenadas.map((raia, indice) => ({ ...raia, ordem: indice + 1 }));
    this.atualizarRaiasProjetoNoEstado(projetoId, raiasAtualizadas);

    this.http
      .put<Raia[]>(`${apiUrlBase}/projetos/${projetoId}/raias/reordenar`, {
        raias: raiasReordenadas.map((raia) => ({ id: raia.id })),
      })
      .subscribe({
        next: (raiasApi) => {
          this.atualizarRaiasProjetoNoEstado(
            projetoId,
            raiasApi.map((raia) => this.normalizarRaia(raia)),
          );
        },
        error: (erro) => {
          this.recarregarRaiasProjeto(projetoId);
          console.error('Falha ao reordenar raias na API.', erro);
        },
      });
  }

  private carregarRaias(): void {
    this.http.get<Raia[]>(this.urlRaias).subscribe({
      next: (raiasApi) => {
        this.raiasInterno.set(raiasApi.map((raia) => this.normalizarRaia(raia)));
      },
      error: (erro) => {
        console.error('Falha ao carregar raias da API.', erro);
      },
    });
  }

  private recarregarRaiasProjeto(projetoId: string): void {
    this.carregarRaiasProjeto(projetoId);
  }

  private atualizarRaiasProjetoNoEstado(projetoId: string, raiasProjeto: Raia[]): void {
    this.raiasInterno.update((listaAtual) => {
      const outrasRaias = listaAtual.filter((raia) => raia.projetoId !== projetoId);
      return [...outrasRaias, ...raiasProjeto];
    });
  }

  private normalizarRaia(raia: Raia): Raia {
    return {
      ...raia,
      cor: raia.cor ?? undefined,
    };
  }
}
