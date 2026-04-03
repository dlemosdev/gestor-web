import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { EstadoSidebarService } from '../../core/services/estado-sidebar.service';
import { ProjetosService } from '../../services/projetos.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header
      class="relative overflow-hidden bg-[linear-gradient(0deg,rgba(37,99,235,0.18)_0%,rgba(59,130,246,0.10)_24%,rgba(255,255,255,0.05)_52%,rgba(15,23,42,0.02)_100%)] backdrop-blur-md"
      role="banner"
    >
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_46%,rgba(255,255,255,0)_100%)]"
      ></div>
      <div class="flex h-[3.75rem] min-w-0">
        <div
          class="relative flex shrink-0 items-center justify-center transition-[width,padding] duration-200"
          [class.w-60]="!sidebarRecolhida()"
          [class.w-20]="sidebarRecolhida()"
          [class.px-4]="!sidebarRecolhida()"
          [class.px-2.5]="sidebarRecolhida()"
        >
          <button
            type="button"
            class="absolute -right-3 top-1/2 z-10 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-borda bg-superficie-secundaria text-cor-texto-secundaria shadow-sm transition hover:border-borda-forte hover:bg-superficie hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            aria-label="Alternar menu lateral"
            title="Alternar menu lateral"
            (click)="alternarSidebar()"
          >
            @if (sidebarRecolhida()) {
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path d="m9 6 6 6-6 6" />
              </svg>
            } @else {
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">
                <path d="m15 6-6 6 6 6" />
              </svg>
            }
          </button>

          @if (sidebarRecolhida()) {
            <img src="assets/marca/gestor-logo-icon.svg" alt="Gestor" class="h-7 w-7 shrink-0" />
          } @else {
            <img src="assets/marca/gestor-logo.svg" alt="Gestor" class="h-8 w-auto shrink-0" />
          }
        </div>

        <div class="flex min-w-0 flex-1 items-center justify-between gap-3 px-3 md:px-5 lg:px-6">
          <div class="min-w-0 pl-3 md:pl-4">
            <h2 class="truncate text-lg font-semibold text-cor-texto md:text-xl">{{ tituloPagina() }}</h2>
          </div>

        </div>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly roteador = inject(Router);
  private readonly projetosService = inject(ProjetosService);
  private readonly estadoSidebarService = inject(EstadoSidebarService);

  private readonly urlAtual = toSignal(
    this.roteador.events.pipe(
      filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
      startWith(this.roteador.url),
    ),
    { initialValue: this.roteador.url },
  );

  readonly estaNoBoard = computed(() => {
    const url = this.urlAtual();
    return url.includes('/projetos/') && url.includes('/board');
  });
  readonly sidebarRecolhida = computed(() => this.estadoSidebarService.sidebarRecolhida());

  readonly tituloPagina = computed(() => {
    if (this.estaNoBoard()) {
      const nomeProjeto = this.nomeProjetoAtual();
      return nomeProjeto ? `Board de ${nomeProjeto}` : 'Board do Projeto';
    }

    const url = this.urlAtual();

    if (url.includes('/projetos')) {
      return 'Projetos';
    }

    return 'Visão Geral';
  });

  alternarSidebar(): void {
    this.estadoSidebarService.alternarSidebar();
  }
  private nomeProjetoAtual(): string | null {
    const url = this.urlAtual();
    const correspondencia = url.match(/\/projetos\/([^/]+)\/board/);

    if (!correspondencia?.[1]) {
      return null;
    }

    const projetoId = decodeURIComponent(correspondencia[1]);
    return this.projetosService.obterProjetoPorId(projetoId)?.nome ?? null;
  }
}
