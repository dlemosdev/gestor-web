import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

type IconeBotao =
  | ''
  | 'plus'
  | 'arrow-right'
  | 'board'
  | 'edit'
  | 'close'
  | 'back'
  | 'trash'
  | 'save'
  | 'folder'
  | 'search'
  | 'filter-x'
  | 'send'
  | 'check';

@Component({
  selector: 'app-botao-ui',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.w-full]': 'larguraTotal()',
  },
  template: `
    @if (rota()) {
      <a [routerLink]="rota()!" [class]="classesBotao()" [attr.aria-label]="ariaLabel() || texto()" (click)="navegarPorRota($event)">
        <ng-container [ngTemplateOutlet]="iconeTemplate"></ng-container>
        <ng-content />
        @if (!temConteudoPersonalizado()) {
          <span>{{ texto() }}</span>
        }
      </a>
    } @else {
      <button
        [attr.type]="tipo()"
        [disabled]="desabilitado()"
        [class]="classesBotao()"
        [attr.aria-label]="ariaLabel() || texto()"
      >
        <ng-container [ngTemplateOutlet]="iconeTemplate"></ng-container>
        <ng-content />
        @if (!temConteudoPersonalizado()) {
          <span>{{ texto() }}</span>
        }
      </button>
    }

    <ng-template #iconeTemplate>
      @if (icone()) {
        <span class="shrink-0" aria-hidden="true">
          @switch (icone()) {
            @case ('plus') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
            }
            @case ('arrow-right') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></svg>
            }
            @case ('board') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="M15 4v16" /></svg>
            }
            @case ('edit') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" /></svg>
            }
            @case ('close') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            }
            @case ('back') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></svg>
            }
            @case ('trash') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></svg>
            }
            @case ('save') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" /></svg>
            }
            @case ('folder') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></svg>
            }
            @case ('search') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            }
            @case ('filter-x') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16l-6 7v5l-4 2v-7Z" /><path d="m17 17 4 4" /><path d="m21 17-4 4" /></svg>
            }
            @case ('send') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4 20-7Z" /></svg>
            }
            @case ('check') {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6 9 17l-5-5" /></svg>
            }
          }
        </span>
      }
    </ng-template>
  `,
})
export class BotaoUiComponent {
  private readonly roteador = inject(Router);

  readonly texto = input<string>('Acao');
  readonly icone = input<IconeBotao>('');
  readonly tipo = input<'button' | 'submit'>('button');
  readonly variante = input<'primario' | 'secundario' | 'fantasma' | 'perigo'>('primario');
  readonly tamanho = input<'sm' | 'md'>('md');
  readonly larguraTotal = input(false);
  readonly desabilitado = input(false);
  readonly ariaLabel = input<string>('');
  readonly temConteudoPersonalizado = input(false);
  readonly rota = input<string | readonly (string | number)[] | null>(null);

  readonly classesBotao = computed(() => {
    const classesBase =
      'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2 focus-visible:ring-offset-fundo disabled:cursor-not-allowed disabled:opacity-60';

    const mapaTamanho: Record<string, string> = {
      sm: 'h-9 px-3',
      md: 'h-10 px-4',
    };

    const mapaVariante: Record<string, string> = {
      primario: 'border-transparent bg-primaria text-white hover:bg-primaria-hover active:bg-primaria-ativa',
      secundario: 'border-borda bg-superficie text-cor-texto hover:border-borda-forte hover:bg-superficie-secundaria',
      fantasma: 'border-transparent bg-transparent text-cor-texto-secundaria hover:bg-superficie-secundaria hover:text-cor-texto',
      perigo: 'border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20',
    };

    const classeLargura = this.larguraTotal() ? 'w-full' : '';

    return `${classesBase} ${mapaTamanho[this.tamanho()]} ${mapaVariante[this.variante()]} ${classeLargura}`;
  });

  navegarPorRota(evento: MouseEvent): void {
    const rota = this.rota();

    if (!rota) {
      return;
    }

    evento.preventDefault();
    evento.stopPropagation();

    setTimeout(() => {
      void this.roteador.navigate(Array.isArray(rota) ? [...rota] : [rota]);
    });
  }
}
