import { Injectable, Signal, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EstadoSidebarService {
  private readonly sidebarRecolhidaSignal = signal(false);
  readonly sidebarRecolhida: Signal<boolean> = this.sidebarRecolhidaSignal.asReadonly();

  alternarSidebar(): void {
    this.sidebarRecolhidaSignal.update((valorAtual) => !valorAtual);
  }
}
