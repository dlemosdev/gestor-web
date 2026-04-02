import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { apiUrlBase } from '../core/config/api.config';
import { StatusProjeto } from '../models/enums/status-projeto.enum';
import { HistoricoProjeto } from '../models/historico-projeto.model';
import { Projeto } from '../models/projeto.model';
import { RaiaPadraoProjeto } from '../models/raias-padrao-projeto';
import { RaiasService } from './raias.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private readonly urlProjetos = `${apiUrlBase}/projetos`;

  private readonly projetosInterno = signal<Projeto[]>([]);
  private readonly historicosProjetoInterno = signal<Record<string, HistoricoProjeto[]>>({});
  readonly projetos = this.projetosInterno.asReadonly();
  readonly historicosProjeto = this.historicosProjetoInterno.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly raiasService: RaiasService,
  ) {
    this.carregarProjetos();
  }

  obterProjetoPorId(projetoId: string): Projeto | null {
    return this.projetosInterno().find((projeto) => projeto.id === projetoId) ?? null;
  }

  obterProjetoPrincipal(): Projeto | null {
    return this.projetosInterno().find((projeto) => projeto.principal) ?? null;
  }

  obterHistoricoProjeto(projetoId: string): HistoricoProjeto[] {
    return this.historicosProjetoInterno()[projetoId] ?? [];
  }

  projetoPossuiBoard(projetoId: string): boolean {
    return this.raiasService.obterRaiasPorProjeto(projetoId).length > 0;
  }

  criarProjeto(dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'dataInicial' | 'dataFinal'> & { raiasPadrao: RaiaPadraoProjeto[] }): void {
    this.http
      .post<Projeto>(this.urlProjetos, {
        nome: dadosProjeto.nome,
        descricao: dadosProjeto.descricao,
        dataInicial: dadosProjeto.dataInicial ?? null,
        dataFinal: dadosProjeto.dataFinal ?? null,
        raiasPadrao: dadosProjeto.raiasPadrao,
      })
      .subscribe({
        next: (projetoCriado) => {
          this.projetosInterno.update((listaAtual) => [this.normalizarProjeto(projetoCriado), ...listaAtual]);
          this.raiasService.carregarRaiasProjeto(projetoCriado.id);
          this.carregarHistoricoProjeto(projetoCriado.id);
          this.garantirProjetoPrincipalLocal();
        },
        error: (erro) => {
          console.error('Falha ao criar projeto na API.', erro);
        },
      });
  }

  atualizarProjeto(projetoId: string, dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'dataInicial' | 'dataFinal'>): void {
    this.http
      .put<Projeto>(`${this.urlProjetos}/${projetoId}`, {
        nome: dadosProjeto.nome,
        descricao: dadosProjeto.descricao,
        dataInicial: dadosProjeto.dataInicial ?? null,
        dataFinal: dadosProjeto.dataFinal ?? null,
      })
      .subscribe({
        next: (projetoAtualizado) => {
          this.projetosInterno.update((listaAtual) =>
            listaAtual.map((projeto) => (projeto.id === projetoId ? this.normalizarProjeto(projetoAtualizado) : projeto)),
          );
          this.carregarHistoricoProjeto(projetoId);
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
        this.carregarHistoricoProjeto(projetoId);
      },
      error: (erro) => {
        console.error('Falha ao definir projeto principal na API.', erro);
      },
    });
  }

  atualizarStatusProjeto(projetoId: string, status: StatusProjeto): void {
    this.http.patch<Projeto>(`${this.urlProjetos}/${projetoId}/status`, { status }).subscribe({
      next: (projetoAtualizado) => {
        this.projetosInterno.update((listaAtual) =>
          listaAtual.map((projeto) => (projeto.id === projetoId ? this.normalizarProjeto(projetoAtualizado) : projeto)),
        );
        this.carregarHistoricoProjeto(projetoId);
      },
      error: (erro) => {
        this.carregarProjetos();
        console.error('Falha ao atualizar status do projeto na API.', erro);
      },
    });
  }

  private carregarProjetos(): void {
    this.http.get<Projeto[]>(this.urlProjetos).subscribe({
      next: (projetosApi) => {
        const projetosNormalizados = projetosApi.map((projeto) => this.normalizarProjeto(projeto));
        this.projetosInterno.set(projetosNormalizados);
        projetosNormalizados.forEach((projeto) => this.carregarHistoricoProjeto(projeto.id));
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

  private carregarHistoricoProjeto(projetoId: string): void {
    this.http.get<HistoricoProjeto[]>(`${this.urlProjetos}/${projetoId}/historico`).subscribe({
      next: (historico) => {
        this.historicosProjetoInterno.update((estadoAtual) => ({
          ...estadoAtual,
          [projetoId]: historico,
        }));
      },
      error: (erro) => {
        console.error('Falha ao carregar histórico do projeto na API.', erro);
      },
    });
  }

  private normalizarProjeto(projeto: Projeto): Projeto {
    return {
      ...projeto,
      status: projeto.status ?? StatusProjeto.ATIVO,
      principal: Boolean(projeto.principal),
      dataInicial: projeto.dataInicial ?? null,
      dataFinal: projeto.dataFinal ?? null,
      inativadoEm: projeto.inativadoEm ?? null,
      concluidoEm: projeto.concluidoEm ?? null,
      reativadoEm: projeto.reativadoEm ?? null,
    };
  }
}

