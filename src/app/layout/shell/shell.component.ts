import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SidebarComponent, TopbarComponent],
  template: `
    <a
      href="#conteudo-principal"
      class="sr-only absolute left-2 top-2 z-[100] rounded-lg bg-primaria px-3 py-2 text-sm font-semibold text-white focus:not-sr-only"
    >
      Ir para conteudo principal
    </a>

    <div class="flex h-screen min-h-dvh flex-col overflow-hidden bg-fundo">
      <app-topbar />

      <div class="flex min-h-0 flex-1 overflow-hidden">
        <app-sidebar />

        <main
          id="conteudo-principal"
          class="flex min-h-0 flex-1 flex-col px-5 py-6 pb-16 md:px-8 md:py-7 lg:px-10 lg:py-8 lg:pb-8"
          tabindex="-1"
        >
          <router-outlet />
        </main>
      </div>
    </div>

    <nav class="fixed inset-x-0 bottom-0 z-30 grid h-14 grid-cols-2 border-t border-borda bg-superficie lg:hidden" aria-label="Navegação mobile">
      <a
        routerLink="/dashboard"
        routerLinkActive="text-primaria"
        class="flex items-center justify-center text-sm font-semibold text-cor-texto-secundaria"
      >
        Dashboard
      </a>
      <a
        routerLink="/projetos"
        routerLinkActive="text-primaria"
        class="flex items-center justify-center text-sm font-semibold text-cor-texto-secundaria"
      >
        Projetos
      </a>
    </nav>
  `,
})
export class ShellComponent {}
