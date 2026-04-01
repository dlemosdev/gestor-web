import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer-lateral-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-40 bg-slate-950/25 backdrop-blur-[1px]" aria-hidden="true" (click)="fechar.emit()"></div>
      <aside
        class="fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-borda bg-superficie p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <header class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-cor-texto">{{ titulo() }}</h2>
          <button
            type="button"
            aria-label="Fechar painel lateral"
            class="rounded-lg border border-borda px-2 py-1 text-sm text-cor-texto hover:bg-superficie-secundaria focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            (click)="fechar.emit()"
          >
            Fechar
          </button>
        </header>
        <div class="max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
          <ng-content />
        </div>
      </aside>
    }
  `,
})
export class DrawerLateralUiComponent {
  readonly aberto = input(false);
  readonly titulo = input<string>('Detalhes');
  readonly fechar = output<void>();

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.aberto()) {
      this.fechar.emit();
    }
  }
}

