import { Injectable, signal } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { StatusProjeto } from '../models/enums/status-projeto.enum';
import { Projeto } from '../models/projeto.model';
import { AtividadesService } from './atividades.service';
import { DadosMockService } from './dados-mock.service';
import { RaiasService } from './raias.service';

@Injectable({
  providedIn: 'root',
})
export class ProjetosService {
  private readonly chaveProjetos = 'gestor:projetos';

  private readonly projetosInterno = signal<Projeto[]>([]);
  readonly projetos = this.projetosInterno.asReadonly();

  constructor(
    private readonly armazenamentoLocalService: ArmazenamentoLocalService,
    private readonly dadosMockService: DadosMockService,
    private readonly raiasService: RaiasService,
    private readonly atividadesService: AtividadesService,
  ) {
    this.dadosMockService.garantirDadosIniciais();
    this.carregar();
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

  criarProjeto(dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'cor'>): void {
    const agora = new Date().toISOString();

    const novoProjeto: Projeto = {
      id: crypto.randomUUID(),
      nome: dadosProjeto.nome,
      descricao: dadosProjeto.descricao,
      cor: dadosProjeto.cor,
      principal: false,
      criadoEm: agora,
      atualizadoEm: agora,
      status: StatusProjeto.ATIVO,
    };

    this.projetosInterno.update((listaAtual) => [novoProjeto, ...listaAtual]);
    this.persistir();
  }

  atualizarProjeto(projetoId: string, dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'cor'>): void {
    this.projetosInterno.update((listaAtual) =>
      listaAtual.map((projeto) =>
        projeto.id === projetoId
          ? {
              ...projeto,
              ...dadosProjeto,
              atualizadoEm: new Date().toISOString(),
            }
          : projeto,
      ),
    );

    this.persistir();
  }

  definirProjetoPrincipal(projetoId: string): void {
    const agora = new Date().toISOString();

    this.projetosInterno.update((listaAtual) =>
      listaAtual.map((projeto) => ({
        ...projeto,
        principal: projeto.id === projetoId,
        atualizadoEm: projeto.id === projetoId ? agora : projeto.atualizadoEm,
      })),
    );

    this.persistir();
  }

  excluirProjeto(projetoId: string): void {
    this.projetosInterno.update((listaAtual) => listaAtual.filter((projeto) => projeto.id !== projetoId));
    this.raiasService.excluirRaiasDoProjeto(projetoId);
    this.atividadesService.excluirAtividadesDoProjeto(projetoId);
    this.garantirProjetoPrincipal();
    this.persistir();
  }

  private carregar(): void {
    const projetosSalvos = this.armazenamentoLocalService.obterItem<Projeto[]>(this.chaveProjetos);
    const projetosNormalizados = (projetosSalvos ?? []).map((projeto) => ({
      ...projeto,
      status: StatusProjeto.ATIVO,
      principal: projeto.principal ?? false,
    }));

    this.projetosInterno.set(projetosNormalizados);
    this.garantirProjetoPrincipal();
  }

  private garantirProjetoPrincipal(): void {
    const projetosAtuais = this.projetosInterno();
    if (projetosAtuais.length === 0) {
      return;
    }

    const projetosPrincipais = projetosAtuais.filter((projeto) => projeto.principal);

    if (projetosPrincipais.length === 1) {
      return;
    }

    if (projetosPrincipais.length > 1) {
      const primeiroPrincipal = projetosPrincipais[0];
      this.projetosInterno.update((listaAtual) =>
        listaAtual.map((projeto) => ({
          ...projeto,
          principal: projeto.id === primeiroPrincipal.id,
        })),
      );
      this.persistir();
      return;
    }

    const primeiroProjeto = projetosAtuais[0];
    if (!primeiroProjeto) {
      return;
    }

    this.projetosInterno.update((listaAtual) =>
      listaAtual.map((projeto) => ({
        ...projeto,
        principal: projeto.id === primeiroProjeto.id,
      })),
    );
    this.persistir();
  }

  private persistir(): void {
    this.armazenamentoLocalService.salvarItem(this.chaveProjetos, this.projetosInterno());
  }
}


