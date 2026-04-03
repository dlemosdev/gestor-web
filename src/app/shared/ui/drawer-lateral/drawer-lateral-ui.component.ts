import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-drawer-lateral-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px]" aria-hidden="true" (click)="fechar.emit()"></div>
      <aside
        class="fixed right-0 top-0 z-50 h-full w-full max-w-xl border-l border-borda bg-superficie p-5 shadow-[var(--sombra-suave)]"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <header class="mb-4 flex items-center justify-between border-b border-borda pb-3">
          <h2 class="text-lg font-semibold text-cor-texto">{{ titulo() }}</h2>
          <button
            type="button"
            aria-label="Fechar painel lateral"
            class="inline-flex items-center gap-2 rounded-lg border border-borda bg-superficie-secundaria px-2.5 py-1.5 text-sm text-cor-texto hover:border-borda-forte hover:bg-superficie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            (click)="fechar.emit()"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
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

