import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { StatusProjeto } from '../../../../models/enums/status-projeto.enum';
import { Projeto } from '../../../../models/projeto.model';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-card-projeto',
  standalone: true,
  imports: [DatePipe, BadgeUiComponent, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="rounded-2xl border bg-superficie p-5 shadow-[var(--sombra-card)] transition"
      [class.border-blue-400/35]="projeto().status === statusProjeto.ATIVO"
      [class.border-emerald-400/35]="projeto().status === statusProjeto.CONCLUIDO"
      [class.border-amber-400/35]="projeto().status === statusProjeto.INATIVO"
      [class.bg-emerald-500/10]="projeto().status === statusProjeto.CONCLUIDO"
      [class.opacity-65]="projeto().status === statusProjeto.INATIVO"
    >
      <div class="flex items-start justify-between gap-2">
        <h3 class="text-base font-semibold text-cor-texto">{{ projeto().nome }}</h3>
        <div class="mt-0.5 flex items-center gap-1">
          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent text-cor-texto-suave transition hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            (click)="visualizarDetalhes.emit(projeto())"
            aria-label="Visualizar detalhes do projeto"
            title="Visualizar detalhes"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>

          <button
            type="button"
            class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            [class.text-amber-400]="projeto().principal"
            [class.hover:text-amber-300]="projeto().principal"
            [class.text-cor-texto-suave]="!projeto().principal && projeto().status === statusProjeto.ATIVO"
            [class.hover:text-cor-texto]="!projeto().principal && projeto().status === statusProjeto.ATIVO"
            [class.text-cor-texto-suave/40]="projeto().status !== statusProjeto.ATIVO"
            [class.cursor-default]="projeto().principal || projeto().status !== statusProjeto.ATIVO"
            [disabled]="projeto().principal || projeto().status !== statusProjeto.ATIVO"
            (click)="alternarProjetoPrincipal.emit(projeto())"
            [attr.aria-label]="projeto().principal ? 'Projeto principal selecionado' : 'Definir como projeto principal'"
            [attr.title]="
              projeto().status !== statusProjeto.ATIVO
                ? 'Somente projetos ativos podem ser definidos como principal'
                : projeto().principal
                  ? 'Projeto principal selecionado'
                  : 'Definir principal'
            "
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

          @if (projeto().status === statusProjeto.ATIVO) {
            <button
              type="button"
              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent text-amber-400 transition hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              (click)="inativarProjeto.emit(projeto())"
              aria-label="Arquivar projeto"
              title="Arquivar projeto"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 8v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8" />
                <path d="M23 3H1v5h22z" />
                <path d="M10 12h4" />
              </svg>
            </button>

            <button
              type="button"
              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-transparent bg-transparent text-emerald-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              (click)="concluirProjeto.emit(projeto())"
              aria-label="Concluir projeto"
              title="Concluir projeto"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </button>
          }
        </div>
      </div>

      <p class="mt-1.5 line-clamp-3 text-sm text-cor-texto-secundaria">{{ projeto().descricao }}</p>

      <div class="mt-4 flex items-center justify-between gap-2 border-b border-borda pb-3">
        <div class="flex items-center gap-2">
          <app-badge-ui [texto]="rotuloStatusProjeto()" [variante]="varianteStatusProjeto()" />
          @if (projeto().principal) {
            <app-badge-ui texto="Principal" variante="info" />
          }
        </div>
        <span class="text-xs text-cor-texto-secundaria">Atualizado em {{ projeto().atualizadoEm | date: 'dd/MM/yyyy' }}</span>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <app-botao-ui texto="Abrir Board" tamanho="sm" [rota]="['/projetos', projeto().id, 'board']" />
        <app-botao-ui texto="Editar" tamanho="sm" variante="secundario" (click)="editarProjeto.emit(projeto())" />
        @if (projeto().status === statusProjeto.INATIVO) {
          <app-botao-ui texto="Ativar" tamanho="sm" (click)="ativarProjeto.emit(projeto())" />
        }
      </div>
    </section>
  `,
})
export class CardProjetoComponent {
  readonly statusProjeto = StatusProjeto;

  readonly projeto = input.required<Projeto>();

  readonly visualizarDetalhes = output<Projeto>();
  readonly editarProjeto = output<Projeto>();
  readonly alternarProjetoPrincipal = output<Projeto>();
  readonly inativarProjeto = output<Projeto>();
  readonly concluirProjeto = output<Projeto>();
  readonly ativarProjeto = output<Projeto>();

  rotuloStatusProjeto(): string {
    if (this.projeto().status === StatusProjeto.CONCLUIDO) {
      return 'Concluído';
    }

    if (this.projeto().status === StatusProjeto.INATIVO) {
      return 'Arquivado';
    }

    return 'Ativo';
  }

  varianteStatusProjeto(): 'sucesso' | 'neutro' | 'info' | 'alerta' {
    if (this.projeto().status === StatusProjeto.CONCLUIDO) {
      return 'sucesso';
    }

    if (this.projeto().status === StatusProjeto.INATIVO) {
      return 'alerta';
    }

    return 'info';
  }
}
