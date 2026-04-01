import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, inject, signal } from '@angular/core';

import { ArmazenamentoLocalService } from './armazenamento-local.service';

export type TemaAparencia = 'claro' | 'escuro';

@Injectable({
  providedIn: 'root',
})
export class TemaAparenciaService {
  private readonly chaveTema = 'preferencia-tema-aparencia';
  private readonly documento = inject(DOCUMENT);
  private readonly armazenamentoLocalService = inject(ArmazenamentoLocalService);

  private readonly temaAtualSignal = signal<TemaAparencia>('escuro');
  readonly temaAtual: Signal<TemaAparencia> = this.temaAtualSignal.asReadonly();

  constructor() {
    this.inicializarTema();
  }

  alternarTema(): void {
    const proximoTema: TemaAparencia = this.temaAtual() === 'escuro' ? 'claro' : 'escuro';
    this.definirTema(proximoTema);
  }

  definirTema(tema: TemaAparencia): void {
    this.temaAtualSignal.set(tema);
    this.armazenamentoLocalService.salvarItem(this.chaveTema, tema);
    this.aplicarTemaNoDocumento(tema);
  }

  private inicializarTema(): void {
    const temaSalvo = this.armazenamentoLocalService.obterItem<TemaAparencia>(this.chaveTema);

    if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
      this.temaAtualSignal.set(temaSalvo);
      this.aplicarTemaNoDocumento(temaSalvo);
      return;
    }

    this.temaAtualSignal.set('escuro');
    this.aplicarTemaNoDocumento('escuro');
  }

  private aplicarTemaNoDocumento(tema: TemaAparencia): void {
    const elementoRaiz = this.documento.documentElement;
    elementoRaiz.classList.toggle('tema-escuro', tema === 'escuro');
    elementoRaiz.setAttribute('data-tema', tema);
  }
}
