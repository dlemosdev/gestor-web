import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-item-sidebar-ui',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (rota()) {
      <a
        [routerLink]="rota()"
        routerLinkActive="bg-superficie-secundaria text-primaria"
        class="flex items-center rounded-xl px-3 py-2 text-sm font-medium transition"
        [class.justify-center]="compacto()"
        [class.gap-2]="!compacto()"
        [class]="classesBase()"
        [attr.title]="compacto() ? titulo() : null"
      >
        <span class="inline-flex h-5 w-5 items-center justify-center">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            @switch (icone()) {
              @case ('dashboard') {
                <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" />
              }
              @case ('projetos') {
                <path d="M4 6h16v12H4z" />
                <path d="M9 6v12M4 10h16" />
              }
              @case ('tarefas') {
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              }
              @case ('relatorios') {
                <path d="M4 19h16" />
                <path d="M7 15V9M12 15V5M17 15v-3" />
              }
              @case ('configuracoes') {
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"
                />
              }
              @default {
                <circle cx="12" cy="12" r="4" />
              }
            }
          </svg>
        </span>
        @if (!compacto()) {
          <span>{{ titulo() }}</span>
        }
      </a>
    } @else {
      <button
        type="button"
        class="flex w-full items-center rounded-xl px-3 py-2 text-left text-sm font-medium transition"
        [class.justify-center]="compacto()"
        [class.gap-2]="!compacto()"
        [class]="classesBase()"
        [attr.title]="compacto() ? titulo() : null"
      >
        <span class="inline-flex h-5 w-5 items-center justify-center">
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            @switch (icone()) {
              @case ('dashboard') {
                <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" />
              }
              @case ('projetos') {
                <path d="M4 6h16v12H4z" />
                <path d="M9 6v12M4 10h16" />
              }
              @case ('tarefas') {
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              }
              @case ('relatorios') {
                <path d="M4 19h16" />
                <path d="M7 15V9M12 15V5M17 15v-3" />
              }
              @case ('configuracoes') {
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 0 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 0 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 0 1 4 0v.09a1.7 1.7 0 0 0 1 1.55h.01a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 0 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"
                />
              }
              @default {
                <circle cx="12" cy="12" r="4" />
              }
            }
          </svg>
        </span>
        @if (!compacto()) {
          <span>{{ titulo() }}</span>
        }
      </button>
    }
  `,
})
export class ItemSidebarUiComponent {
  readonly titulo = input.required<string>();
  readonly icone = input<string>('dashboard');
  readonly rota = input<string>('');
  readonly ativo = input(false);
  readonly compacto = input(false);

  readonly classesBase = computed(() => {
    if (this.ativo()) {
      return 'bg-superficie-secundaria text-primaria';
    }

    return 'text-cor-texto-secundaria hover:bg-superficie-secundaria hover:text-cor-texto';
  });
}
