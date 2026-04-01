import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface OpcaoSeletorUi {
  valor: string;
  rotulo: string;
}

@Component({
  selector: 'app-seletor-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex w-full flex-col gap-1.5">
      @if (rotulo()) {
        <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">{{ rotulo() }}</span>
      }

      <select
        class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-sm text-cor-texto outline-none transition focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:cursor-not-allowed disabled:opacity-70"
        [disabled]="desabilitado()"
        [attr.aria-label]="ariaLabel() || rotulo()"
      >
        @for (opcao of opcoes(); track opcao.valor) {
          <option [value]="opcao.valor" [selected]="opcao.valor === valor()">{{ opcao.rotulo }}</option>
        }
      </select>
    </label>
  `,
})
export class SeletorUiComponent {
  readonly rotulo = input<string>('');
  readonly valor = input<string>('');
  readonly opcoes = input<OpcaoSeletorUi[]>([]);
  readonly desabilitado = input(false);
  readonly ariaLabel = input<string>('');
}

