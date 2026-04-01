import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-botao-ui',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.w-full]': 'larguraTotal()',
  },
  template: `
    @if (rota()) {
      <a [routerLink]="rota()!" [class]="classesBotao()" [attr.aria-label]="ariaLabel() || texto()">
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
        <ng-content />
        @if (!temConteudoPersonalizado()) {
          <span>{{ texto() }}</span>
        }
      </button>
    }
  `,
})
export class BotaoUiComponent {
  readonly texto = input<string>('Ação');
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
      'inline-flex items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

    const mapaTamanho: Record<string, string> = {
      sm: 'h-9 px-3',
      md: 'h-10 px-4',
    };

    const mapaVariante: Record<string, string> = {
      primario: 'border-transparent bg-primaria text-white hover:bg-primaria-hover',
      secundario: 'border-borda bg-superficie text-cor-texto hover:bg-superficie-secundaria',
      fantasma: 'border-transparent bg-transparent text-cor-texto hover:bg-superficie-secundaria',
      perigo: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
    };

    return `${classesBase} ${mapaTamanho[this.tamanho()]} ${mapaVariante[this.variante()]}`;
  });
}
