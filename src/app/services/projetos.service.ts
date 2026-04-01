import { Injectable, signal } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { StatusProjeto } from '../models/enums/status-projeto.enum';
import { Projeto } from '../models/projeto.model';
import { DadosMockService } from './dados-mock.service';

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
  ) {
    this.dadosMockService.garantirDadosIniciais();
    this.carregar();
  }

  obterProjetoPorId(projetoId: string): Projeto | null {
    return this.projetosInterno().find((projeto) => projeto.id === projetoId) ?? null;
  }

  criarProjeto(dadosProjeto: Pick<Projeto, 'nome' | 'descricao' | 'cor'>): void {
    const agora = new Date().toISOString();

    const novoProjeto: Projeto = {
      id: crypto.randomUUID(),
      nome: dadosProjeto.nome,
      descricao: dadosProjeto.descricao,
      cor: dadosProjeto.cor,
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

  alternarStatusProjeto(projetoId: string): void {
    this.projetosInterno.update((listaAtual) =>
      listaAtual.map((projeto) =>
        projeto.id === projetoId
          ? {
              ...projeto,
              status: projeto.status === StatusProjeto.ATIVO ? StatusProjeto.INATIVO : StatusProjeto.ATIVO,
              atualizadoEm: new Date().toISOString(),
            }
          : projeto,
      ),
    );

    this.persistir();
  }

  private carregar(): void {
    const projetosSalvos = this.armazenamentoLocalService.obterItem<Projeto[]>(this.chaveProjetos);
    this.projetosInterno.set(projetosSalvos ?? []);
  }

  private persistir(): void {
    this.armazenamentoLocalService.salvarItem(this.chaveProjetos, this.projetosInterno());
  }
}


