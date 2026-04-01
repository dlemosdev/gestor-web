import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Projeto } from '../../../../models/projeto.model';
import { StatusProjeto } from '../../../../models/enums/status-projeto.enum';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-card-projeto',
  standalone: true,
  imports: [DatePipe, BadgeUiComponent, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-card)]">
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-base font-semibold text-cor-texto">{{ projeto().nome }}</h3>
        <div class="mt-0.5 flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            [class.text-amber-400]="projeto().principal"
            [class.hover:text-amber-300]="projeto().principal"
            [class.text-cor-texto-suave]="!projeto().principal"
            [class.hover:text-cor-texto]="!projeto().principal"
            [class.cursor-default]="projeto().principal"
            [disabled]="projeto().principal"
            (click)="alternarProjetoPrincipal.emit(projeto())"
            [attr.aria-label]="projeto().principal ? 'Projeto principal selecionado' : 'Definir como projeto principal'"
            [attr.title]="projeto().principal ? 'Projeto principal selecionado' : 'Definir principal'"
          >
            @if (projeto().principal) {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            } @else {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            }
          </button>
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent text-red-500 transition hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            (click)="solicitarExclusaoProjeto.emit(projeto())"
            aria-label="Excluir projeto"
            title="Excluir projeto"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      <p class="mt-1.5 text-sm text-cor-texto-secundaria">{{ projeto().descricao }}</p>

      <div class="mt-4 flex items-center justify-between gap-2 border-b border-borda pb-3">
        <div class="flex items-center gap-2">
          <app-badge-ui
            [texto]="projeto().status"
            [variante]="projeto().status === statusProjeto.ATIVO ? 'sucesso' : 'neutro'"
          />
          @if (projeto().principal) {
            <app-badge-ui texto="Principal" variante="info" />
          }
        </div>
        <span class="text-xs text-cor-texto-secundaria">Atualizado em {{ projeto().atualizadoEm | date: 'dd/MM/yyyy' }}</span>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <app-botao-ui texto="Abrir Board" tamanho="sm" [rota]="['/projetos', projeto().id, 'board']" />
        <app-botao-ui texto="Editar" tamanho="sm" variante="secundario" (click)="editarProjeto.emit(projeto())" />
      </div>
    </section>
  `,
})
export class CardProjetoComponent {
  readonly statusProjeto = StatusProjeto;

  readonly projeto = input.required<Projeto>();

  readonly editarProjeto = output<Projeto>();
  readonly alternarProjetoPrincipal = output<Projeto>();
  readonly solicitarExclusaoProjeto = output<Projeto>();
}

