import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';

import { EstadoSidebarService } from '../../core/services/estado-sidebar.service';
import { ProjetosService } from '../../services/projetos.service';

@Component({
  selector: 'app-topbar',
  template: `
    <header class="sticky top-0 z-20 border-b border-borda bg-superficie/95 backdrop-blur" role="banner">
      <div class="flex min-h-20 items-center justify-between gap-4 px-5 py-3 md:px-8 lg:px-10">
        <div class="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-borda bg-superficie-secundaria text-cor-texto-secundaria transition hover:bg-superficie hover:text-cor-texto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primaria"
            aria-label="Alternar menu lateral"
            title="Alternar menu lateral"
            (click)="alternarSidebar()"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
          </button>

          <div class="flex min-w-0 items-center gap-3">
            <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primaria text-sm font-semibold text-white">GR</div>
            <div class="min-w-0">
              <p class="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-secundaria">Workspace</p>
              <h1 class="truncate text-lg font-semibold text-cor-texto">Gestor</h1>
            </div>
          </div>

          <div class="hidden min-w-0 border-l border-borda pl-4 md:block">
            <p class="truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-secundaria">{{ breadcrumb() }}</p>
            <h2 class="truncate text-base font-semibold text-cor-texto">{{ tituloPagina() }}</h2>
          </div>
        </div>

        <div class="hidden items-center gap-2 sm:flex">
          <span class="inline-flex items-center gap-2 rounded-xl border border-borda bg-superficie-secundaria px-3 py-2 text-xs font-semibold text-cor-texto-secundaria">
            <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
            Ambiente online
          </span>
          <span class="inline-flex items-center rounded-xl border border-borda bg-superficie px-3 py-2 text-xs font-semibold text-cor-texto-secundaria">
            {{ tituloPagina() }}
          </span>
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

  readonly breadcrumb = computed(() => {
    if (this.estaNoBoard()) {
      const nomeProjeto = this.nomeProjetoAtual();
      return nomeProjeto ? `Projetos / ${nomeProjeto} / Board` : 'Projetos / Board';
    }

    const url = this.urlAtual();

    if (url.includes('/projetos')) {
      return 'Projetos';
    }

    return 'Dashboard';
  });

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


