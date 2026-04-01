import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Injectable, signal } from '@angular/core';

import { ArmazenamentoLocalService } from '../core/services/armazenamento-local.service';
import { Atividade } from '../models/atividade.model';
import { ChecklistItem } from '../models/checklist-item.model';
import { Prioridade } from '../models/enums/prioridade.enum';
import { StatusAtividade } from '../models/enums/status-atividade.enum';
import { DadosMockService } from './dados-mock.service';

@Injectable({
  providedIn: 'root',
})
export class AtividadesService {
  private readonly chaveAtividades = 'gestor:atividades';

  private readonly atividadesInterno = signal<Atividade[]>([]);
  readonly atividades = this.atividadesInterno.asReadonly();

  constructor(
    private readonly armazenamentoLocalService: ArmazenamentoLocalService,
    private readonly dadosMockService: DadosMockService,
  ) {
    this.dadosMockService.garantirDadosIniciais();
    this.carregar();
  }

  obterAtividadesPorProjeto(projetoId: string): Atividade[] {
    return this.atividadesInterno().filter((atividade) => atividade.projetoId === projetoId);
  }

  obterAtividadePorId(atividadeId: string): Atividade | null {
    return this.atividadesInterno().find((atividade) => atividade.id === atividadeId) ?? null;
  }

  criarAtividadeRapida(projetoId: string, raiaId: string, titulo: string, responsavelPadrao: string): void {
    const ordem = this.obterAtividadesPorRaia(raiaId).length + 1;
    const agora = new Date().toISOString();

    const novaAtividade: Atividade = {
      id: crypto.randomUUID(),
      projetoId,
      raiaId,
      titulo,
      descricao: 'Descricao inicial. Edite pelos detalhes da atividade.',
      prioridade: Prioridade.MEDIA,
      status: StatusAtividade.BACKLOG,
      responsavel: responsavelPadrao,
      prazo: agora.slice(0, 10),
      etiquetas: [],
      checklist: [],
      comentarios: [],
      ordem,
      criadoEm: agora,
      atualizadoEm: agora,
    };

    this.atividadesInterno.update((listaAtual) => [...listaAtual, novaAtividade]);
    this.persistir();
  }

  criarAtividadeCompleta(novaAtividade: Atividade): void {
    this.atividadesInterno.update((listaAtual) => [...listaAtual, novaAtividade]);
    this.persistir();
  }

  salvarAtividade(atividadeAtualizada: Atividade): void {
    this.atividadesInterno.update((listaAtual) =>
      listaAtual.map((atividade) => (atividade.id === atividadeAtualizada.id ? atividadeAtualizada : atividade)),
    );

    this.persistir();
  }

  salvarAtividadeComReordenacao(atividadeAtualizada: Atividade): void {
    const atividadeAtual = this.obterAtividadePorId(atividadeAtualizada.id);

    if (!atividadeAtual) {
      return;
    }

    if (atividadeAtual.raiaId === atividadeAtualizada.raiaId) {
      this.salvarAtividade({ ...atividadeAtualizada, ordem: atividadeAtual.ordem });
      return;
    }

    const atividadesOrigem = this.obterAtividadesPorRaia(atividadeAtual.raiaId).filter((atividade) => atividade.id !== atividadeAtualizada.id);
    const atividadesDestino = this.obterAtividadesPorRaia(atividadeAtualizada.raiaId);

    const atividadeMovida: Atividade = {
      ...atividadeAtualizada,
      ordem: atividadesDestino.length + 1,
      atualizadoEm: new Date().toISOString(),
    };

    const idsOrigem = new Set(atividadesOrigem.map((atividade) => atividade.id));
    const idsDestino = new Set(atividadesDestino.map((atividade) => atividade.id));

    this.atividadesInterno.update((listaAtual) =>
      listaAtual
        .filter((atividade) => !idsOrigem.has(atividade.id) && !idsDestino.has(atividade.id) && atividade.id !== atividadeMovida.id)
        .concat(
          atividadesOrigem.map((atividade, indice) => ({ ...atividade, ordem: indice + 1 })),
          atividadesDestino.map((atividade, indice) => ({ ...atividade, ordem: indice + 1 })),
          atividadeMovida,
        ),
    );

    this.persistir();
  }

  excluirAtividade(atividadeId: string): void {
    this.atividadesInterno.update((listaAtual) => listaAtual.filter((atividade) => atividade.id !== atividadeId));
    this.persistir();
  }

  excluirAtividadesDaRaia(raiaId: string): void {
    this.atividadesInterno.update((listaAtual) => listaAtual.filter((atividade) => atividade.raiaId !== raiaId));
    this.persistir();
  }

  atualizarChecklist(atividadeId: string, checklist: ChecklistItem[]): void {
    const atividade = this.obterAtividadePorId(atividadeId);

    if (!atividade) {
      return;
    }

    this.salvarAtividade({ ...atividade, checklist, atualizadoEm: new Date().toISOString() });
  }

  adicionarComentario(atividadeId: string, texto: string): void {
    const atividade = this.obterAtividadePorId(atividadeId);

    if (!atividade) {
      return;
    }

    this.salvarAtividade({
      ...atividade,
      comentarios: [
        ...atividade.comentarios,
        {
          id: crypto.randomUUID(),
          atividadeId,
          usuarioId: 'Usuario atual',
          texto,
          criadoEm: new Date().toISOString(),
        },
      ],
      atualizadoEm: new Date().toISOString(),
    });
  }

  moverAtividade(evento: CdkDragDrop<Atividade[]>, raiaDestinoId: string, raiaOrigemId: string): void {
    const atividadeMovida = evento.item.data as Atividade;

    if (raiaOrigemId === raiaDestinoId && evento.previousIndex === evento.currentIndex) {
      return;
    }

    const atividadesOrigem = this.obterAtividadesPorRaia(raiaOrigemId);
    const atividadesDestino = raiaOrigemId === raiaDestinoId ? atividadesOrigem : this.obterAtividadesPorRaia(raiaDestinoId);

    const indiceOrigem = atividadesOrigem.findIndex((atividade) => atividade.id === atividadeMovida.id);

    if (indiceOrigem === -1) {
      return;
    }

    const [item] = atividadesOrigem.splice(indiceOrigem, 1);
    atividadesDestino.splice(evento.currentIndex, 0, { ...item, raiaId: raiaDestinoId, atualizadoEm: new Date().toISOString() });

    const idsOrigem = new Set(atividadesOrigem.map((atividade) => atividade.id));
    const idsDestino = new Set(atividadesDestino.map((atividade) => atividade.id));

    this.atividadesInterno.update((listaAtual) =>
      listaAtual
        .filter((atividade) => !idsOrigem.has(atividade.id) && !idsDestino.has(atividade.id))
        .concat(
          atividadesOrigem.map((atividade, indice) => ({ ...atividade, ordem: indice + 1 })),
          atividadesDestino.map((atividade, indice) => ({ ...atividade, ordem: indice + 1 })),
        ),
    );

    this.persistir();
  }

  private obterAtividadesPorRaia(raiaId: string): Atividade[] {
    return this.atividadesInterno()
      .filter((atividade) => atividade.raiaId === raiaId)
      .sort((a, b) => a.ordem - b.ordem)
      .map((atividade) => ({ ...atividade }));
  }

  private carregar(): void {
    const atividadesSalvas = this.armazenamentoLocalService.obterItem<Atividade[]>(this.chaveAtividades);
    this.atividadesInterno.set(atividadesSalvas ?? []);
  }

  private persistir(): void {
    this.armazenamentoLocalService.salvarItem(this.chaveAtividades, this.atividadesInterno());
  }
}

