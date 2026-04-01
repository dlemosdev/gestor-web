import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-estado-vazio-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-dashed border-borda bg-superficie p-8 text-center">
      <p class="text-base font-semibold text-cor-texto">{{ titulo() }}</p>
      <p class="mt-2 text-sm text-cor-texto-secundaria">{{ descricao() }}</p>

      @if (textoAcao()) {
        <div class="mt-4 flex justify-center">
          <button
            type="button"
            class="inline-flex h-10 items-center rounded-xl border border-transparent bg-primaria px-4 text-sm font-semibold text-white transition hover:bg-primaria-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria focus-visible:ring-offset-2"
            (click)="acaoPrimaria.emit()"
          >
            {{ textoAcao() }}
          </button>
        </div>
      }

      <div class="mt-4 flex justify-center">
        <ng-content />
      </div>
    </section>
  `,
})
export class EstadoVazioUiComponent {
  readonly titulo = input<string>('Nada por aqui ainda');
  readonly descricao = input<string>('Adicione novos dados para começar.');
  readonly textoAcao = input<string>('');
  readonly acaoPrimaria = output<void>();
}
