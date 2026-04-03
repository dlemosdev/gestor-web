import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

import { apiUrlBase } from '../core/config/api.config';
import { Atividade } from '../models/atividade.model';
import { ChecklistItem } from '../models/checklist-item.model';
import { Prioridade } from '../models/enums/prioridade.enum';
import { StatusAtividade } from '../models/enums/status-atividade.enum';
import { TipoAtividade } from '../models/enums/tipo-atividade.enum';
import { EtiquetaAtividade } from '../models/etiqueta-atividade.model';
import { HistoricoAtividade } from '../models/historico-atividade.model';

@Injectable({
  providedIn: 'root',
})
export class AtividadesService {
  private readonly urlAtividades = `${apiUrlBase}/atividades`;

  private readonly atividadesInterno = signal<Atividade[]>([]);
  private readonly historicosAtividadeInterno = signal<Record<string, HistoricoAtividade[]>>({});
  readonly atividades = this.atividadesInterno.asReadonly();
  readonly historicosAtividade = this.historicosAtividadeInterno.asReadonly();

  constructor(private readonly http: HttpClient) {
    this.carregarAtividades();
  }

  obterAtividadesPorProjeto(projetoId: string): Atividade[] {
    return this.atividadesInterno().filter((atividade) => atividade.projetoId === projetoId);
  }

  obterAtividadePorId(atividadeId: string): Atividade | null {
    return this.atividadesInterno().find((atividade) => atividade.id === atividadeId) ?? null;
  }

  obterHistoricoAtividade(atividadeId: string): HistoricoAtividade[] {
    return this.historicosAtividadeInterno()[atividadeId] ?? [];
  }

  criarAtividadeRapida(projetoId: string, titulo: string, responsavelPadrao: string): void {
    const agora = new Date().toISOString();

    this.http
      .post<Atividade>(`${apiUrlBase}/projetos/${projetoId}/atividades`, {
        tipo: TipoAtividade.HU,
        atividadePaiId: null,
        titulo,
        descricao: 'Descricao inicial. Edite pelos detalhes da atividade.',
        descricaoDetalhada: null,
        prioridade: Prioridade.MEDIA,
        responsavel: responsavelPadrao,
        prazo: agora.slice(0, 10),
        etiquetas: [],
        checklist: [],
        comentarios: [],
      })
      .subscribe({
        next: (atividadeCriada) => {
          this.atividadesInterno.update((listaAtual) => [...listaAtual, this.normalizarAtividade(atividadeCriada)]);
          this.carregarHistoricoAtividade(atividadeCriada.id);
        },
        error: (erro) => {
          console.error('Falha ao criar atividade rápida na API.', erro);
        },
      });
  }

  criarAtividadeCompleta(novaAtividade: Atividade): void {
    this.http
      .post<Atividade>(`${apiUrlBase}/projetos/${novaAtividade.projetoId}/atividades`, {
        tipo: novaAtividade.tipo,
        atividadePaiId: novaAtividade.atividadePaiId,
        titulo: novaAtividade.titulo,
        descricao: novaAtividade.descricao,
        descricaoDetalhada: novaAtividade.descricaoDetalhada,
        prioridade: novaAtividade.prioridade,
        responsavel: novaAtividade.responsavel,
        prazo: novaAtividade.prazo,
        etiquetas: novaAtividade.etiquetas,
        checklist: novaAtividade.checklist,
        comentarios: novaAtividade.comentarios,
      })
      .subscribe({
        next: (atividadeCriada) => {
          this.atividadesInterno.update((listaAtual) => [...listaAtual, this.normalizarAtividade(atividadeCriada)]);
          this.carregarHistoricoAtividade(atividadeCriada.id);
        },
        error: (erro) => {
          console.error('Falha ao criar atividade na API.', erro);
        },
      });
  }

  salvarAtividade(atividadeAtualizada: Atividade): void {
    this.substituirAtividadeNoEstado(atividadeAtualizada);

    this.http
      .put<Atividade>(`${this.urlAtividades}/${atividadeAtualizada.id}`, {
        raiaId: atividadeAtualizada.raiaId,
        tipo: atividadeAtualizada.tipo,
        atividadePaiId: atividadeAtualizada.atividadePaiId,
        titulo: atividadeAtualizada.titulo,
        descricao: atividadeAtualizada.descricao,
        descricaoDetalhada: atividadeAtualizada.descricaoDetalhada,
        prioridade: atividadeAtualizada.prioridade,
        status: atividadeAtualizada.status,
        responsavel: atividadeAtualizada.responsavel,
        prazo: atividadeAtualizada.prazo,
        etiquetas: atividadeAtualizada.etiquetas,
        checklist: atividadeAtualizada.checklist,
        comentarios: atividadeAtualizada.comentarios,
      })
      .subscribe({
        next: (atividadeApi) => {
          this.substituirAtividadeNoEstado(this.normalizarAtividade(atividadeApi));
          this.carregarHistoricoAtividade(atividadeAtualizada.id);
        },
        error: (erro) => {
          this.recarregarAtividadePorId(atividadeAtualizada.id);
          console.error('Falha ao salvar atividade na API.', erro);
        },
      });
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

    this.http
      .put<Atividade>(`${this.urlAtividades}/${atividadeMovida.id}`, {
        raiaId: atividadeMovida.raiaId,
        tipo: atividadeMovida.tipo,
        atividadePaiId: atividadeMovida.atividadePaiId,
        titulo: atividadeMovida.titulo,
        descricao: atividadeMovida.descricao,
        descricaoDetalhada: atividadeMovida.descricaoDetalhada,
        prioridade: atividadeMovida.prioridade,
        status: atividadeMovida.status,
        responsavel: atividadeMovida.responsavel,
        prazo: atividadeMovida.prazo,
        etiquetas: atividadeMovida.etiquetas,
        checklist: atividadeMovida.checklist,
        comentarios: atividadeMovida.comentarios,
      })
      .subscribe({
        next: () => {
          this.reordenarAtividadesRaiaNaApi(atividadeAtual.raiaId, atividadesOrigem, () => {
            this.reordenarAtividadesRaiaNaApi(atividadeMovida.raiaId, [...atividadesDestino, atividadeMovida], () => {
              this.carregarHistoricoAtividade(atividadeMovida.id);
            });
          });
        },
        error: (erro) => {
          this.carregarAtividades();
          console.error('Falha ao mover atividade entre raias via API.', erro);
        },
      });
  }

  excluirAtividade(atividadeId: string): void {
    const atividade = this.obterAtividadePorId(atividadeId);
    if (!atividade) {
      return;
    }

    const snapshotAnterior = this.atividadesInterno();
    this.atividadesInterno.update((listaAtual) => listaAtual.filter((item) => item.id !== atividadeId));

    this.http.delete<void>(`${this.urlAtividades}/${atividadeId}`).subscribe({
      next: () => {
        this.recarregarAtividadesRaia(atividade.raiaId);
      },
      error: (erro) => {
        this.atividadesInterno.set(snapshotAnterior);
        console.error('Falha ao excluir atividade na API.', erro);
      },
    });
  }

  excluirAtividadesDaRaia(raiaId: string): void {
    this.atividadesInterno.update((listaAtual) => listaAtual.filter((atividade) => atividade.raiaId !== raiaId));
  }

  excluirAtividadesDoProjeto(projetoId: string): void {
    this.atividadesInterno.update((listaAtual) => listaAtual.filter((atividade) => atividade.projetoId !== projetoId));
  }

  atualizarChecklist(atividadeId: string, checklist: ChecklistItem[]): void {
    const atividade = this.obterAtividadePorId(atividadeId);

    if (!atividade) {
      return;
    }

    this.substituirAtividadeNoEstado({
      ...atividade,
      checklist,
      atualizadoEm: new Date().toISOString(),
    });

    this.http
      .patch<Atividade>(`${this.urlAtividades}/${atividadeId}/checklist`, {
        checklist,
      })
      .subscribe({
        next: (atividadeApi) => {
          this.substituirAtividadeNoEstado(this.normalizarAtividade(atividadeApi));
          this.carregarHistoricoAtividade(atividadeId);
        },
        error: (erro) => {
          this.recarregarAtividadePorId(atividadeId);
          console.error('Falha ao atualizar checklist na API.', erro);
        },
      });
  }

  adicionarComentario(atividadeId: string, texto: string): void {
    const atividade = this.obterAtividadePorId(atividadeId);

    if (!atividade) {
      return;
    }

    this.http
      .post<Atividade>(`${this.urlAtividades}/${atividadeId}/comentarios`, {
        texto,
      })
      .subscribe({
        next: (atividadeApi) => {
          this.substituirAtividadeNoEstado(this.normalizarAtividade(atividadeApi));
        },
        error: (erro) => {
          console.error('Falha ao adicionar comentário na API.', erro);
        },
      });
  }

  moverAtividade(evento: CdkDragDrop<Atividade[]>, raiaDestinoId: string, raiaOrigemId: string): void {
    const atividadeMovida = evento.item.data as Atividade;

    if (raiaOrigemId === raiaDestinoId && evento.previousIndex === evento.currentIndex) {
      return;
    }

    if (raiaOrigemId === raiaDestinoId) {
      const atividadesRaia = this.obterAtividadesPorRaia(raiaOrigemId);
      const indiceOrigem = atividadesRaia.findIndex((atividade) => atividade.id === atividadeMovida.id);

      if (indiceOrigem === -1) {
        return;
      }

      const [item] = atividadesRaia.splice(indiceOrigem, 1);
      atividadesRaia.splice(evento.currentIndex, 0, { ...item, atualizadoEm: new Date().toISOString() });

      const idsRaia = new Set(atividadesRaia.map((atividade) => atividade.id));
      this.atividadesInterno.update((listaAtual) =>
        listaAtual
          .filter((atividade) => !idsRaia.has(atividade.id))
          .concat(atividadesRaia.map((atividade, indice) => ({ ...atividade, ordem: indice + 1 }))),
      );

      this.reordenarAtividadesRaiaNaApi(raiaOrigemId, atividadesRaia);
      return;
    }

    const atividadesOrigem = this.obterAtividadesPorRaia(raiaOrigemId);
    const atividadesDestino = this.obterAtividadesPorRaia(raiaDestinoId);

    const indiceOrigem = atividadesOrigem.findIndex((atividade) => atividade.id === atividadeMovida.id);

    if (indiceOrigem === -1) {
      return;
    }

    const [item] = atividadesOrigem.splice(indiceOrigem, 1);
    const atividadeComNovaRaia = { ...item, raiaId: raiaDestinoId, atualizadoEm: new Date().toISOString() };
    atividadesDestino.splice(evento.currentIndex, 0, atividadeComNovaRaia);

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

    this.http
      .put<Atividade>(`${this.urlAtividades}/${atividadeMovida.id}`, {
        raiaId: raiaDestinoId,
        tipo: atividadeMovida.tipo,
        atividadePaiId: atividadeMovida.atividadePaiId,
        titulo: atividadeMovida.titulo,
        descricao: atividadeMovida.descricao,
        descricaoDetalhada: atividadeMovida.descricaoDetalhada,
        prioridade: atividadeMovida.prioridade,
        status: atividadeMovida.status,
        responsavel: atividadeMovida.responsavel,
        prazo: atividadeMovida.prazo,
        etiquetas: atividadeMovida.etiquetas,
        checklist: atividadeMovida.checklist,
        comentarios: atividadeMovida.comentarios,
      })
      .subscribe({
        next: () => {
          this.reordenarAtividadesRaiaNaApi(raiaOrigemId, atividadesOrigem);
          this.reordenarAtividadesRaiaNaApi(raiaDestinoId, atividadesDestino);
          this.carregarHistoricoAtividade(atividadeMovida.id);
        },
        error: (erro) => {
          this.carregarAtividades();
          console.error('Falha ao persistir drag and drop de atividade na API.', erro);
        },
      });
  }

  private carregarAtividades(): void {
    this.http.get<Atividade[]>(this.urlAtividades).subscribe({
      next: (atividadesApi) => {
        const atividadesNormalizadas = atividadesApi.map((atividade) => this.normalizarAtividade(atividade));
        this.atividadesInterno.set(atividadesNormalizadas);
        atividadesNormalizadas.forEach((atividade) => this.carregarHistoricoAtividade(atividade.id));
      },
      error: (erro) => {
        console.error('Falha ao carregar atividades da API.', erro);
      },
    });
  }

  private recarregarAtividadePorId(atividadeId: string): void {
    this.http.get<Atividade>(`${this.urlAtividades}/${atividadeId}`).subscribe({
      next: (atividadeApi) => {
        this.substituirAtividadeNoEstado(this.normalizarAtividade(atividadeApi));
        this.carregarHistoricoAtividade(atividadeId);
      },
      error: (erro) => {
        console.error('Falha ao recarregar atividade na API.', erro);
      },
    });
  }

  private recarregarAtividadesRaia(raiaId: string): void {
    this.http
      .put<Atividade[]>(`${apiUrlBase}/raias/${raiaId}/atividades/reordenar`, {
        atividades: this.obterAtividadesPorRaia(raiaId).map((atividade) => ({ id: atividade.id })),
      })
      .subscribe({
        next: (atividadesRaiaApi) => {
          const idsRaia = new Set(atividadesRaiaApi.map((atividade) => atividade.id));
          this.atividadesInterno.update((listaAtual) => {
            const outrasAtividades = listaAtual.filter((atividade) => !idsRaia.has(atividade.id));
            return [...outrasAtividades, ...atividadesRaiaApi.map((atividade) => this.normalizarAtividade(atividade))];
          });
        },
        error: (erro) => {
          console.error('Falha ao sincronizar raia de atividades na API.', erro);
        },
      });
  }

  private reordenarAtividadesRaiaNaApi(raiaId: string, atividadesRaia: Atividade[], aoConcluir?: () => void): void {
    this.http
      .put<Atividade[]>(`${apiUrlBase}/raias/${raiaId}/atividades/reordenar`, {
        atividades: atividadesRaia.map((atividade) => ({ id: atividade.id })),
      })
      .subscribe({
        next: (atividadesRaiaApi) => {
          const idsRaia = new Set(atividadesRaiaApi.map((atividade) => atividade.id));
          this.atividadesInterno.update((listaAtual) => {
            const outrasAtividades = listaAtual.filter((atividade) => !idsRaia.has(atividade.id));
            return [...outrasAtividades, ...atividadesRaiaApi.map((atividade) => this.normalizarAtividade(atividade))];
          });
          aoConcluir?.();
        },
        error: (erro) => {
          console.error('Falha ao reordenar atividades da raia na API.', erro);
        },
      });
  }

  private substituirAtividadeNoEstado(atividadeAtualizada: Atividade): void {
    const atividadeNormalizada = this.normalizarAtividade(atividadeAtualizada);

    this.atividadesInterno.update((listaAtual) => {
      const indice = listaAtual.findIndex((atividade) => atividade.id === atividadeNormalizada.id);

      if (indice === -1) {
        return [...listaAtual, atividadeNormalizada];
      }

      return listaAtual.map((atividade) => (atividade.id === atividadeNormalizada.id ? atividadeNormalizada : atividade));
    });
  }

  private carregarHistoricoAtividade(atividadeId: string): void {
    this.http.get<HistoricoAtividade[]>(`${this.urlAtividades}/${atividadeId}/historico`).subscribe({
      next: (historico) => {
        this.historicosAtividadeInterno.update((estadoAtual) => ({
          ...estadoAtual,
          [atividadeId]: historico,
        }));
      },
      error: (erro) => {
        console.error('Falha ao carregar histórico da atividade na API.', erro);
      },
    });
  }

  private obterAtividadesPorRaia(raiaId: string): Atividade[] {
    return this.atividadesInterno()
      .filter((atividade) => atividade.raiaId === raiaId)
      .sort((a, b) => a.ordem - b.ordem)
      .map((atividade) => ({ ...atividade }));
  }

  private normalizarAtividade(atividade: Atividade): Atividade {
    return {
      ...atividade,
      codigoReferencia: atividade.codigoReferencia ?? '',
      tipo: atividade.tipo ?? TipoAtividade.HU,
      atividadePaiId: atividade.atividadePaiId ?? null,
      descricaoDetalhada: atividade.descricaoDetalhada ?? null,
      dataConclusao: atividade.dataConclusao ?? null,
      etiquetas: this.normalizarEtiquetas(atividade.etiquetas as unknown[]),
      checklist: Array.isArray(atividade.checklist) ? atividade.checklist : [],
      comentarios: Array.isArray(atividade.comentarios) ? atividade.comentarios : [],
    };
  }

  private normalizarEtiquetas(etiquetas: unknown[]): EtiquetaAtividade[] {
    if (!Array.isArray(etiquetas)) {
      return [];
    }

    return etiquetas
      .map((etiqueta) => {
        if (typeof etiqueta === 'string') {
          return { nome: etiqueta, cor: '#64748B' };
        }

        const etiquetaObj = etiqueta as Partial<EtiquetaAtividade>;
        if (typeof etiquetaObj.nome !== 'string' || !etiquetaObj.nome.trim()) {
          return null;
        }

        return {
          nome: etiquetaObj.nome.trim(),
          cor: etiquetaObj.cor && /^#([0-9A-Fa-f]{6})$/.test(etiquetaObj.cor) ? etiquetaObj.cor : '#64748B',
        };
      })
      .filter((etiqueta): etiqueta is EtiquetaAtividade => etiqueta !== null);
  }
}
