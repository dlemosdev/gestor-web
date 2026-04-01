import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';

import { EstadoSidebarService } from '../../core/services/estado-sidebar.service';
import { AcoesInterfaceService } from '../../core/services/acoes-interface.service';
import { ProjetosService } from '../../services/projetos.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  template: `
    <header class="relative bg-superficie/92 backdrop-blur-md" role="banner">
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

          @if (estaNoBoard()) {
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="inline-flex h-9 items-center rounded-xl border border-borda bg-superficie-secundaria px-3 text-sm font-semibold text-cor-texto-secundaria transition hover:border-borda-forte hover:bg-superficie hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
                (click)="solicitarNovaRaia()"
              >
                Nova Raia
              </button>
              <button
                type="button"
                class="inline-flex h-9 items-center rounded-xl border border-transparent bg-primaria px-3 text-sm font-semibold text-white transition hover:bg-primaria-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
                (click)="solicitarNovaAtividade()"
              >
                Nova Atividade
              </button>
            </div>
          }
        </div>
      </div>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-borda-forte/90 to-transparent"
      ></div>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 -bottom-1 h-3 bg-gradient-to-b from-superficie-secundaria/35 to-transparent"
      ></div>
    </header>
  `,
})
export class TopbarComponent {
  private readonly roteador = inject(Router);
  private readonly projetosService = inject(ProjetosService);
  private readonly estadoSidebarService = inject(EstadoSidebarService);
  private readonly acoesInterfaceService = inject(AcoesInterfaceService);

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

    return 'Visao Geral';
  });

  alternarSidebar(): void {
    this.estadoSidebarService.alternarSidebar();
  }

  solicitarNovaAtividade(): void {
    this.acoesInterfaceService.solicitarNovaAtividade();
  }

  solicitarNovaRaia(): void {
    this.acoesInterfaceService.solicitarNovaRaia();
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
