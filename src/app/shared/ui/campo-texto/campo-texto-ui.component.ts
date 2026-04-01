import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campo-texto-ui',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="flex w-full flex-col gap-1.5">
      @if (rotulo()) {
        <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">{{ rotulo() }}</span>
      }

      <input
        [type]="tipo()"
        [placeholder]="placeholder()"
        [value]="valor()"
        [disabled]="desabilitado()"
        [attr.aria-label]="ariaLabel() || rotulo()"
        class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-sm text-cor-texto outline-none transition placeholder:text-cor-texto-suave focus:border-primaria focus:ring-2 focus:ring-primaria/20 disabled:cursor-not-allowed disabled:opacity-70"
      />

      @if (mensagemAjuda()) {
        <small class="text-xs text-cor-texto-secundaria">{{ mensagemAjuda() }}</small>
      }
    </label>
  `,
})
export class CampoTextoUiComponent {
  readonly rotulo = input<string>('');
  readonly tipo = input<'text' | 'search' | 'email' | 'date'>('text');
  readonly placeholder = input<string>('');
  readonly valor = input<string>('');
  readonly desabilitado = input(false);
  readonly mensagemAjuda = input<string>('');
  readonly ariaLabel = input<string>('');
}

