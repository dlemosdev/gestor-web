import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

import { HistoricoProjeto } from '../../../../models/historico-projeto.model';
import { Projeto } from '../../../../models/projeto.model';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-modal-detalhes-projeto',
  standalone: true,
  imports: [DatePipe, BadgeUiComponent, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto() && projeto()) {
      <div class="fixed inset-0 z-[85] bg-slate-950/60 backdrop-blur-[3px]" aria-hidden="true" (click)="fechar.emit()"></div>

      <section class="fixed inset-0 z-[90] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Detalhes do projeto">
        <div class="w-full max-w-3xl rounded-3xl border border-borda bg-superficie p-6 shadow-[var(--sombra-suave)]">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-cor-texto-secundaria">Detalhes do projeto</p>
              <h3 class="mt-1 text-2xl font-semibold text-cor-texto">{{ projeto()!.nome }}</h3>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-cor-texto-secundaria">{{ projeto()!.descricao }}</p>
            </div>

            <div class="flex items-center gap-2">
              <app-badge-ui [texto]="rotuloStatus()" [variante]="varianteStatus()" />
              @if (projeto()!.principal) {
                <app-badge-ui texto="Principal" variante="info" />
              }
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <section class="rounded-2xl border border-borda bg-superficie-secundaria/35 p-4">
              <h4 class="text-sm font-semibold text-cor-texto">Resumo</h4>
              <ul class="mt-3 space-y-2 text-sm text-cor-texto-secundaria">
                @if (projeto()!.dataInicial) {
                  <li>Data inicial {{ projeto()!.dataInicial | date: 'dd/MM/yyyy' }}</li>
                }
                @if (projeto()!.dataFinal) {
                  <li>Data final {{ projeto()!.dataFinal | date: 'dd/MM/yyyy' }}</li>
                }
                <li>Criado em {{ projeto()!.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                <li>Atualizado em {{ projeto()!.atualizadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                @if (projeto()!.inativadoEm) {
                  <li>Arquivado em {{ projeto()!.inativadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                }
                @if (projeto()!.reativadoEm) {
                  <li>Reativado em {{ projeto()!.reativadoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                }
                @if (projeto()!.concluidoEm) {
                  <li>Concluído em {{ projeto()!.concluidoEm | date: 'dd/MM/yyyy HH:mm' }}</li>
                }
              </ul>
            </section>

            <section class="rounded-2xl border border-borda bg-superficie-secundaria/35 p-4">
              <h4 class="text-sm font-semibold text-cor-texto">Linha do tempo</h4>
              @if (historico().length === 0) {
                <p class="mt-3 text-sm text-cor-texto-secundaria">Nenhum evento registrado para este projeto.</p>
              } @else {
                <ul class="mt-3 max-h-72 space-y-2 overflow-y-auto text-sm text-cor-texto-secundaria">
                  @for (evento of historico(); track evento.id) {
                    <li class="rounded-xl border border-borda bg-superficie px-3 py-2.5">
                      <p class="font-medium text-cor-texto">{{ evento.descricao }}</p>
                      <span class="text-xs">{{ evento.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </li>
                  }
                </ul>
              }
            </section>
          </div>

          <div class="mt-6 flex justify-end">
            <app-botao-ui texto="Fechar" variante="secundario" (click)="fechar.emit()" />
          </div>
        </div>
      </section>
    }
  `,
})
export class ModalDetalhesProjetoComponent {
  readonly aberto = input(false);
  readonly projeto = input<Projeto | null>(null);
  readonly historico = input<HistoricoProjeto[]>([]);

  readonly fechar = output<void>();

  rotuloStatus(): string {
    if (this.projeto()?.status === 'CONCLUIDO') {
      return 'Concluído';
    }

    if (this.projeto()?.status === 'INATIVO') {
      return 'Arquivado';
    }

    return 'Ativo';
  }

  varianteStatus(): 'info' | 'sucesso' | 'alerta' {
    if (this.projeto()?.status === 'CONCLUIDO') {
      return 'sucesso';
    }

    if (this.projeto()?.status === 'INATIVO') {
      return 'alerta';
    }

    return 'info';
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.aberto()) {
      this.fechar.emit();
    }
  }
}
