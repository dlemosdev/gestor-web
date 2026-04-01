import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-dialogo-confirmacao-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto()) {
      <div class="fixed inset-0 z-[85] bg-slate-950/60 backdrop-blur-[3px]" aria-hidden="true" (click)="fechar.emit()"></div>

      <section
        class="fixed inset-0 z-[90] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="titulo()"
      >
        <div class="w-full max-w-md rounded-2xl border border-borda bg-superficie p-5 shadow-[var(--sombra-suave)]">
          <div class="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </div>

          <h3 class="text-base font-semibold text-cor-texto">{{ titulo() }}</h3>
          <p class="mt-2 text-sm leading-6 text-cor-texto-secundaria">{{ descricao() }}</p>

          <div class="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-borda bg-superficie-secundaria px-4 text-sm font-semibold text-cor-texto transition hover:border-borda-forte hover:bg-superficie focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
              (click)="fechar.emit()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-xl border border-transparent bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              (click)="confirmar.emit()"
            >
              {{ textoAcao() }}
            </button>
          </div>
        </div>
      </section>
    }
  `,
})
export class DialogoConfirmacaoUiComponent {
  readonly aberto = input(false);
  readonly titulo = input<string>('Confirmacao');
  readonly descricao = input<string>('');
  readonly textoAcao = input<string>('Excluir');

  readonly fechar = output<void>();
  readonly confirmar = output<void>();

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.aberto()) {
      this.fechar.emit();
    }
  }
}
