import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { apiUrlBase } from '../core/config/api.config';
import { StatusProjeto } from '../models/enums/status-projeto.enum';
import { Projeto } from '../models/projeto.model';
import { RaiaPadraoProjeto } from '../models/raias-padrao-projeto';
import { AtividadesService } from './atividades.service';
import { RaiasService } from './raias.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private readonly urlProjetos = `${apiUrlBase}/projetos`;

  private readonly projetosInterno = signal<Projeto[]>([]);
  readonly projetos = this.projetosInterno.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly raiasService: RaiasService,
    private readonly atividadesService: AtividadesService,
  ) {
    this.carregarProjetos();
  }

  obterProjetoPorId(projetoId: string): Projeto | null {
    return this.projetosInterno().find((projeto) => projeto.id === projetoId) ?? null;
  }

  obterProjetoPrincipal(): Projeto | null {
    return this.projetosInterno().find((projeto) => projeto.principal) ?? null;
  }

  projetoPossuiBoard(projetoId: string): boolean {
    return this.raiasService.obterRaiasPorProjeto(projetoId).length > 0;
  }

  criarProjeto(dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'cor'> & { raiasPadrao: RaiaPadraoProjeto[] }): void {
    this.http
      .post<Projeto>(this.urlProjetos, {
        nome: dadosProjeto.nome,
        descricao: dadosProjeto.descricao,
        cor: dadosProjeto.cor ?? null,
        raiasPadrao: dadosProjeto.raiasPadrao,
      })
      .subscribe({
        next: (projetoCriado) => {
          this.projetosInterno.update((listaAtual) => [this.normalizarProjeto(projetoCriado), ...listaAtual]);
          this.raiasService.carregarRaiasProjeto(projetoCriado.id);
          this.garantirProjetoPrincipalLocal();
        },
        error: (erro) => {
          console.error('Falha ao criar projeto na API.', erro);
        },
      });
  }

  atualizarProjeto(projetoId: string, dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'cor'>): void {
    this.http
      .put<Projeto>(`${this.urlProjetos}/${projetoId}`, {
        nome: dadosProjeto.nome,
        descricao: dadosProjeto.descricao,
        cor: dadosProjeto.cor ?? null,
      })
      .subscribe({
        next: (projetoAtualizado) => {
          this.projetosInterno.update((listaAtual) =>
            listaAtual.map((projeto) => (projeto.id === projetoId ? this.normalizarProjeto(projetoAtualizado) : projeto)),
          );
        },
        error: (erro) => {
          console.error('Falha ao atualizar projeto na API.', erro);
        },
      });
  }

  definirProjetoPrincipal(projetoId: string): void {
    this.http.patch<Projeto>(`${this.urlProjetos}/${projetoId}/principal`, {}).subscribe({
      next: (projetoPrincipalAtualizado) => {
        this.projetosInterno.update((listaAtual) =>
          listaAtual.map((projeto) => ({
            ...projeto,
            principal: projeto.id === projetoPrincipalAtualizado.id,
            atualizadoEm: projeto.id === projetoPrincipalAtualizado.id ? projetoPrincipalAtualizado.atualizadoEm : projeto.atualizadoEm,
          })),
        );
      },
      error: (erro) => {
        console.error('Falha ao definir projeto principal na API.', erro);
      },
    });
  }

  excluirProjeto(projetoId: string): void {
    const snapshotAnterior = this.projetosInterno();

    this.projetosInterno.update((listaAtual) => listaAtual.filter((projeto) => projeto.id !== projetoId));
    this.raiasService.excluirRaiasDoProjeto(projetoId);
    this.atividadesService.excluirAtividadesDoProjeto(projetoId);
    this.garantirProjetoPrincipalLocal();

    this.http.delete<void>(`${this.urlProjetos}/${projetoId}`).subscribe({
      next: () => {
        this.carregarProjetos();
      },
      error: (erro) => {
        this.projetosInterno.set(snapshotAnterior);
        this.carregarProjetos();
        console.error('Falha ao excluir projeto na API.', erro);
      },
    });
  }

  private carregarProjetos(): void {
    this.http.get<Projeto[]>(this.urlProjetos).subscribe({
      next: (projetosApi) => {
        this.projetosInterno.set(projetosApi.map((projeto) => this.normalizarProjeto(projeto)));
        this.garantirProjetoPrincipalLocal();
      },
      error: (erro) => {
        console.error('Falha ao carregar projetos da API.', erro);
      },
    });
  }

  private garantirProjetoPrincipalLocal(): void {
    const projetosAtuais = this.projetosInterno();
    if (projetosAtuais.length === 0) {
      return;
    }

    const projetosPrincipais = projetosAtuais.filter((projeto) => projeto.principal);
    if (projetosPrincipais.length === 1) {
      return;
    }

    const idPrincipal = projetosPrincipais[0]?.id ?? projetosAtuais[0]?.id;
    if (!idPrincipal) {
      return;
    }

    this.projetosInterno.update((listaAtual) =>
      listaAtual.map((projeto) => ({
        ...projeto,
        principal: projeto.id === idPrincipal,
      })),
    );
  }

  private normalizarProjeto(projeto: Projeto): Projeto {
    return {
      ...projeto,
      cor: projeto.cor ?? undefined,
      status: projeto.status ?? StatusProjeto.ATIVO,
      principal: Boolean(projeto.principal),
    };
  }
}

