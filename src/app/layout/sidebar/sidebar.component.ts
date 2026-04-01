import { Component, computed, inject } from '@angular/core';

import { EstadoSidebarService } from '../../core/services/estado-sidebar.service';
import { TemaAparenciaService } from '../../core/services/tema-aparencia.service';
import { AvatarUiComponent } from '../../shared/ui/avatar/avatar-ui.component';
import { ItemSidebarUiComponent } from '../../shared/ui/item-sidebar/item-sidebar-ui.component';

@Component({
  selector: 'app-sidebar',
  imports: [ItemSidebarUiComponent, AvatarUiComponent],
  template: `
    <aside
      class="relative hidden h-full min-h-0 shrink-0 border-r border-borda bg-superficie py-3.5 transition-[width,padding] duration-200 lg:flex lg:flex-col"
      [class.w-72]="!sidebarRecolhida()"
      [class.w-20]="sidebarRecolhida()"
      [class.px-4]="!sidebarRecolhida()"
      [class.px-2.5]="sidebarRecolhida()"
    >
      <div class="flex min-h-0 flex-1 flex-col">
        <nav class="flex flex-1 flex-col gap-1.5 overflow-y-auto pt-2 pr-1" aria-label="Menu principal">
          <app-item-sidebar-ui titulo="Dashboard" rota="/dashboard" icone="dashboard" [compacto]="sidebarRecolhida()" />
          <app-item-sidebar-ui titulo="Projetos" rota="/projetos" icone="projetos" [compacto]="sidebarRecolhida()" />
          <app-item-sidebar-ui titulo="Minhas tarefas" icone="tarefas" [compacto]="sidebarRecolhida()" />
          <app-item-sidebar-ui titulo="Relatorios" icone="relatorios" [compacto]="sidebarRecolhida()" />
          <app-item-sidebar-ui titulo="Configuracoes" icone="configuracoes" [compacto]="sidebarRecolhida()" />
        </nav>

        <div class="mt-3 border-t border-borda pt-3">
          <button
            type="button"
            class="inline-flex h-10 items-center justify-center rounded-xl border border-borda bg-superficie-secundaria text-cor-texto-secundaria transition hover:border-borda-forte hover:bg-superficie hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            [class.w-full]="!sidebarRecolhida()"
            [class.w-10]="sidebarRecolhida()"
            [attr.aria-label]="temaEscuroAtivo() ? 'Ativar tema claro' : 'Ativar tema escuro'"
            [attr.title]="temaEscuroAtivo() ? 'Ativar tema claro' : 'Ativar tema escuro'"
            (click)="alternarTemaAparencia()"
          >
            @if (temaEscuroAtivo()) {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            } @else {
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
              </svg>
            }

            @if (!sidebarRecolhida()) {
              <span class="ml-2 text-sm font-semibold">{{ temaEscuroAtivo() ? 'Tema claro' : 'Tema escuro' }}</span>
            }
          </button>
        </div>
      </div>

      <footer
        class="mt-3 flex items-center rounded-2xl border border-borda bg-superficie-secundaria transition-all duration-200"
        [class.justify-center]="sidebarRecolhida()"
        [class.gap-3]="!sidebarRecolhida()"
        [class.p-2.5]="sidebarRecolhida()"
        [class.p-3.5]="!sidebarRecolhida()"
      >
        <app-avatar-ui iniciais="DL" textoAlternativo="Avatar do usuario logado" />
        @if (!sidebarRecolhida()) {
          <div>
            <p class="text-sm font-semibold text-cor-texto">Denner Lemos</p>
            <p class="text-xs text-cor-texto-secundaria">Administrador</p>
          </div>
        }
      </footer>
    </aside>
  `,
})
export class SidebarComponent {
  private readonly estadoSidebarService = inject(EstadoSidebarService);
  private readonly temaAparenciaService = inject(TemaAparenciaService);

  readonly sidebarRecolhida = computed(() => this.estadoSidebarService.sidebarRecolhida());
  readonly temaEscuroAtivo = computed(() => this.temaAparenciaService.temaAtual() === 'escuro');

  alternarTemaAparencia(): void {
    this.temaAparenciaService.alternarTema();
  }
}
