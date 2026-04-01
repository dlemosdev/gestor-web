import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-estado-carregamento-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-borda bg-superficie p-6">
      <div class="animate-pulse space-y-3">
        <div class="h-5 w-40 rounded bg-slate-200"></div>
        <div class="h-4 w-full rounded bg-slate-100"></div>
        <div class="h-4 w-5/6 rounded bg-slate-100"></div>
      </div>
      @if (mensagem()) {
        <p class="mt-4 text-sm text-cor-texto-secundaria">{{ mensagem() }}</p>
      }
    </section>
  `,
})
export class EstadoCarregamentoUiComponent {
  readonly mensagem = input<string>('Carregando dados...');
}

