import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-acao-topbar-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [attr.aria-label]="ariaLabel() || titulo()"
      [disabled]="desabilitado()"
      class="inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2 disabled:opacity-60"
      [class]="primario() ? 'border-transparent bg-primaria text-white hover:bg-primaria-hover' : 'border-borda bg-superficie text-cor-texto hover:bg-superficie-secundaria'"
      (click)="clique.emit()"
    >
      @if (icone()) {
        <span>{{ icone() }}</span>
      }
      <span>{{ titulo() }}</span>
    </button>
  `,
})
export class AcaoTopbarUiComponent {
  readonly titulo = input.required<string>();
  readonly icone = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly desabilitado = input(false);
  readonly primario = input(false);
  readonly clique = output<void>();
}

