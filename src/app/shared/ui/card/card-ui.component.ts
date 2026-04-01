import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-borda bg-superficie p-5 shadow-sm">
      @if (titulo()) {
        <h3 class="text-base font-semibold text-cor-texto">{{ titulo() }}</h3>
      }

      @if (descricao()) {
        <p class="mt-1.5 text-sm text-cor-texto-secundaria">{{ descricao() }}</p>
      }

      <div class="mt-4">
        <ng-content />
      </div>
    </section>
  `,
})
export class CardUiComponent {
  readonly titulo = input<string>('');
  readonly descricao = input<string>('');
}
