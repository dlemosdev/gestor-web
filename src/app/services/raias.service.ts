import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { apiUrlBase } from '../core/config/api.config';
import { Raia } from '../models/raia.model';

@Injectable({
  providedIn: 'root',
})
export class RaiasService {
  private readonly urlRaias = `${apiUrlBase}/raias`;
  private readonly nomesPadrao = ['Backlog', 'Em andamento', 'Teste', 'Aguardando publicacao', 'Concluidas'];

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

  garantirRaiasPadraoProjeto(projetoId: string): void {
    this.http.get<Raia[]>(`${apiUrlBase}/projetos/${projetoId}/raias`).subscribe({
      next: (raiasProjeto) => {
        const raiasNormalizadas = raiasProjeto.map((raia) => this.normalizarRaia(raia));

        if (raiasNormalizadas.length > 0) {
          this.atualizarRaiasProjetoNoEstado(projetoId, raiasNormalizadas);
          return;
        }

        const criacoes = this.nomesPadrao.map((nome) =>
          this.http.post<Raia>(`${apiUrlBase}/projetos/${projetoId}/raias`, {
            nome,
            cor: null,
          }),
        );

        forkJoin(criacoes).subscribe({
          next: () => {
            this.recarregarRaiasProjeto(projetoId);
          },
          error: (erro) => {
            console.error('Falha ao criar raias padrão na API.', erro);
          },
        });
      },
      error: (erro) => {
        console.error('Falha ao verificar raias do projeto na API.', erro);
      },
    });
  }

  criarRaia(projetoId: string, nome: string): void {
    this.http
      .post<Raia>(`${apiUrlBase}/projetos/${projetoId}/raias`, {
        nome,
        cor: null,
      })
      .subscribe({
        next: (raiaCriada) => {
          this.raiasInterno.update((listaAtual) => [...listaAtual, this.normalizarRaia(raiaCriada)]);
        },
        error: (erro) => {
          console.error('Falha ao criar raia na API.', erro);
        },
      });
  }

  editarNomeRaia(raiaId: string, nome: string): void {
    const raiaAtual = this.raiasInterno().find((raia) => raia.id === raiaId);
    if (!raiaAtual) {
      return;
    }

    this.http
      .put<Raia>(`${apiUrlBase}/raias/${raiaId}`, {
        nome,
        cor: raiaAtual.cor ?? null,
      })
      .subscribe({
        next: (raiaAtualizada) => {
          this.raiasInterno.update((listaAtual) =>
            listaAtual.map((raia) => (raia.id === raiaId ? this.normalizarRaia(raiaAtualizada) : raia)),
          );
        },
        error: (erro) => {
          console.error('Falha ao editar nome da raia na API.', erro);
        },
      });
  }

  excluirRaia(raiaId: string): void {
    const snapshotAnterior = this.raiasInterno();
    const raiaRemovida = snapshotAnterior.find((raia) => raia.id === raiaId);

    if (!raiaRemovida) {
      return;
    }

    this.raiasInterno.update((listaAtual) => {
      const semRaia = listaAtual.filter((raia) => raia.id !== raiaId);
      return semRaia
        .map((raia) => {
          if (raia.projetoId !== raiaRemovida.projetoId) {
            return raia;
          }

          const novaOrdem = raia.ordem > raiaRemovida.ordem ? raia.ordem - 1 : raia.ordem;
          return novaOrdem === raia.ordem ? raia : { ...raia, ordem: novaOrdem };
        })
        .sort((a, b) => a.ordem - b.ordem);
    });

    this.http.delete<void>(`${apiUrlBase}/raias/${raiaId}`).subscribe({
      next: () => {
        this.recarregarRaiasProjeto(raiaRemovida.projetoId);
      },
      error: (erro) => {
        this.raiasInterno.set(snapshotAnterior);
        console.error('Falha ao excluir raia na API.', erro);
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
    this.http.get<Raia[]>(`${apiUrlBase}/projetos/${projetoId}/raias`).subscribe({
      next: (raiasProjeto) => {
        this.atualizarRaiasProjetoNoEstado(
          projetoId,
          raiasProjeto.map((raia) => this.normalizarRaia(raia)),
        );
      },
      error: (erro) => {
        console.error('Falha ao recarregar raias do projeto na API.', erro);
      },
    });
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

