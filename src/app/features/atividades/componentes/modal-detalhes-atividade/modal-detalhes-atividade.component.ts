import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

import { Atividade } from '../../../../models/atividade.model';
import { Prioridade } from '../../../../models/enums/prioridade.enum';
import { HistoricoAtividade } from '../../../../models/historico-atividade.model';
import { BadgeUiComponent } from '../../../../shared/ui/badge/badge-ui.component';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-modal-detalhes-atividade',
  standalone: true,
  imports: [DatePipe, BadgeUiComponent, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (aberto() && atividade()) {
      <div class="fixed inset-0 z-[85] bg-slate-950/60 backdrop-blur-[3px]" aria-hidden="true" (click)="fechar.emit()"></div>

      <section class="fixed inset-0 z-[90] p-4" role="dialog" aria-modal="true" aria-label="Detalhes da atividade">
        <div class="mx-auto flex h-full w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-borda bg-superficie shadow-[var(--sombra-suave)]">
          <header class="relative shrink-0 overflow-hidden bg-[linear-gradient(0deg,rgba(37,99,235,0.18)_0%,rgba(59,130,246,0.10)_24%,rgba(255,255,255,0.05)_52%,rgba(15,23,42,0.02)_100%)] px-6 pt-6 pb-5">
            <div
              aria-hidden="true"
              class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)_46%,rgba(255,255,255,0)_100%)]"
            ></div>
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cor-texto-secundaria">Detalhes da atividade</p>
                <h3
                  class="mt-2 text-2xl font-semibold text-cor-texto"
                  [class.line-through]="atividade()!.dataConclusao"
                  [class.text-cor-texto-secundaria]="atividade()!.dataConclusao"
                >
                  {{ atividade()!.titulo }}
                </h3>
                <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <app-badge-ui [texto]="atividade()!.codigoReferencia || 'Codigo automatico'" variante="neutro" />
                  <app-badge-ui [texto]="atividade()!.tipo" variante="info" />
                  <app-badge-ui [texto]="textoPrioridade(atividade()!.prioridade)" [variante]="variantePrioridade(atividade()!.prioridade)" />
                  <app-badge-ui [texto]="textoStatus(atividade()!.status)" [variante]="varianteStatus(atividade()!.status)" />
                </div>
              </div>

              <div class="flex items-center gap-2">
                <app-botao-ui texto="Editar" icone="edit" variante="secundario" (click)="editar.emit(atividade()!)" />
                <app-botao-ui texto="Fechar" icone="close" variante="secundario" (click)="fechar.emit()" />
              </div>
            </div>
          </header>

          <div class="grid min-h-0 flex-1 grid-cols-1 gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
            <main class="min-w-0 overflow-y-auto px-6 pt-5 pb-6">
              <section class="grid grid-cols-2 gap-4 border-b border-borda pb-6 sm:grid-cols-4">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Responsavel</p>
                  <p class="mt-2 text-sm font-medium text-cor-texto">{{ atividade()!.responsavel }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Prazo</p>
                  <p class="mt-2 text-sm font-medium text-cor-texto">{{ atividade()!.prazo | date: 'dd/MM/yyyy' }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Criada em</p>
                  <p class="mt-2 text-sm font-medium text-cor-texto">{{ atividade()!.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Atualizada em</p>
                  <p class="mt-2 text-sm font-medium text-cor-texto">{{ atividade()!.atualizadoEm | date: 'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </section>

              <section class="space-y-8 py-6">
                <section>
                  <h4 class="text-sm font-semibold text-cor-texto">Resumo</h4>
                  <p class="mt-3 whitespace-pre-line text-sm leading-7 text-cor-texto-secundaria">
                    {{ atividade()!.descricao || 'Nenhuma descricao resumida informada.' }}
                  </p>
                </section>

                @if (atividade()!.descricaoDetalhada) {
                  <section class="border-t border-borda pt-6">
                    <h4 class="text-sm font-semibold text-cor-texto">Descricao detalhada</h4>
                    <p class="mt-3 whitespace-pre-line text-sm leading-7 text-cor-texto-secundaria">
                      {{ atividade()!.descricaoDetalhada }}
                    </p>
                  </section>
                }

                <section class="border-t border-borda pt-6">
                  <div class="flex items-center justify-between gap-3">
                    <h4 class="text-sm font-semibold text-cor-texto">Checklist</h4>
                    <span class="text-xs text-cor-texto-suave">{{ atividade()!.checklist.length }} item(ns)</span>
                  </div>

                  @if (atividade()!.checklist.length > 0) {
                    <ul class="mt-4 space-y-3">
                      @for (item of atividade()!.checklist; track item.id) {
                        <li class="flex items-start gap-3">
                          <span
                            class="mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                            [class.bg-emerald-500/15]="item.concluido"
                            [class.text-emerald-200]="item.concluido"
                            [class.bg-slate-500/10]="!item.concluido"
                            [class.text-cor-texto-secundaria]="!item.concluido"
                          >
                            {{ item.concluido ? 'OK' : '...' }}
                          </span>
                          <div class="min-w-0">
                            <p class="text-sm font-medium text-cor-texto" [class.line-through]="item.concluido" [class.text-cor-texto-secundaria]="item.concluido">
                              {{ item.titulo }}
                            </p>
                            <p class="mt-1 text-xs text-cor-texto-suave">{{ item.concluido ? 'Item concluido' : 'Pendente' }}</p>
                          </div>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="mt-4 text-sm text-cor-texto-secundaria">Nenhum item cadastrado no checklist.</p>
                  }
                </section>

                <section class="border-t border-borda pt-6">
                  <div class="flex items-center justify-between gap-3">
                    <h4 class="text-sm font-semibold text-cor-texto">Comentarios</h4>
                    <span class="text-xs text-cor-texto-suave">{{ atividade()!.comentarios.length }} registro(s)</span>
                  </div>

                  @if (atividade()!.comentarios.length > 0) {
                    <ul class="mt-4 space-y-4">
                      @for (comentario of atividade()!.comentarios; track comentario.id) {
                        <li class="border-l border-borda pl-4">
                          <div class="flex items-center justify-between gap-3">
                            <p class="text-sm font-medium text-cor-texto">{{ comentario.usuarioId }}</p>
                            <span class="text-xs text-cor-texto-suave">{{ comentario.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                          </div>
                          <p class="mt-2 whitespace-pre-line text-sm leading-7 text-cor-texto-secundaria">{{ comentario.texto }}</p>
                        </li>
                      }
                    </ul>
                  } @else {
                    <p class="mt-4 text-sm text-cor-texto-secundaria">Nenhum comentario registrado.</p>
                  }
                </section>
              </section>
            </main>

            <aside class="min-h-0 overflow-y-auto border-t border-borda bg-superficie-secundaria/20 px-5 py-5 xl:border-l xl:border-t-0">
              <div class="flex min-h-full flex-col gap-4">
              <section class="rounded-2xl border border-borda bg-superficie-secundaria/35 px-4 py-4">
                <h4 class="text-sm font-semibold text-cor-texto">Contexto</h4>
                <dl class="mt-4 space-y-4">
                  <div>
                    <dt class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Vinculo com HU</dt>
                    <dd class="mt-1 text-sm text-cor-texto">{{ textoVinculoHu() }}</dd>
                  </div>
                  @if (atividade()!.dataConclusao) {
                    <div>
                      <dt class="text-[11px] font-semibold uppercase tracking-[0.16em] text-cor-texto-suave">Concluida em</dt>
                      <dd class="mt-1 text-sm text-emerald-300">{{ atividade()!.dataConclusao | date: 'dd/MM/yyyy HH:mm' }}</dd>
                    </div>
                  }
                </dl>
              </section>

              <section class="rounded-2xl border border-borda bg-superficie-secundaria/35 px-4 py-4">
                <div class="flex items-center justify-between gap-3">
                  <h4 class="text-sm font-semibold text-cor-texto">Etiquetas</h4>
                  <span class="text-xs text-cor-texto-suave">{{ atividade()!.etiquetas.length }}</span>
                </div>

                @if (atividade()!.etiquetas.length > 0) {
                  <div class="mt-4 flex flex-wrap gap-2">
                    @for (etiqueta of atividade()!.etiquetas; track etiqueta.nome) {
                      <span
                        class="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold"
                        [style.backgroundColor]="etiqueta.cor + '1A'"
                        [style.borderColor]="etiqueta.cor + '5C'"
                        [style.color]="etiqueta.cor"
                      >
                        {{ etiqueta.nome }}
                      </span>
                    }
                  </div>
                } @else {
                  <p class="mt-4 text-sm text-cor-texto-secundaria">Nenhuma etiqueta vinculada.</p>
                }
              </section>

              <section class="rounded-2xl border border-borda bg-superficie-secundaria/35 px-4 py-4">
                <div class="flex items-center justify-between gap-3">
                  <h4 class="text-sm font-semibold text-cor-texto">Historico</h4>
                  <span class="text-xs text-cor-texto-suave">{{ historico().length + 1 }}</span>
                </div>

                <ol class="mt-4 space-y-4">
                  <li class="relative border-l border-borda pl-4">
                    <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primaria"></span>
                    <p class="text-sm font-medium text-cor-texto">Atividade criada</p>
                    <span class="mt-1 block text-xs text-cor-texto-suave">{{ atividade()!.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                  </li>
                  @for (evento of historico(); track evento.id) {
                    <li class="relative border-l border-borda pl-4">
                      <span class="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-borda-forte"></span>
                      <p class="text-sm font-medium text-cor-texto">{{ evento.descricao }}</p>
                      <span class="mt-1 block text-xs text-cor-texto-suave">{{ evento.criadoEm | date: 'dd/MM/yyyy HH:mm' }}</span>
                    </li>
                  }
                </ol>
              </section>
              </div>
            </aside>
          </div>
        </div>
      </section>
    }
  `,
})
export class ModalDetalhesAtividadeComponent {
  readonly aberto = input(false);
  readonly atividade = input<Atividade | null>(null);
  readonly historico = input<HistoricoAtividade[]>([]);
  readonly historiasUsuarioDisponiveis = input<Atividade[]>([]);
  readonly fechar = output<void>();
  readonly editar = output<Atividade>();

  textoStatus(status: Atividade['status']): string {
    if (status === 'EM_ANDAMENTO') return 'Em andamento';
    if (status === 'BLOQUEADA') return 'Bloqueada';
    if (status === 'CONCLUIDA') return 'Concluida';
    return 'Backlog';
  }

  varianteStatus(status: Atividade['status']): 'neutro' | 'info' | 'alerta' | 'sucesso' {
    if (status === 'EM_ANDAMENTO') return 'info';
    if (status === 'BLOQUEADA') return 'alerta';
    if (status === 'CONCLUIDA') return 'sucesso';
    return 'neutro';
  }

  textoPrioridade(prioridade: Atividade['prioridade']): string {
    if (prioridade === 'CRITICA') return 'Critica';
    if (prioridade === 'ALTA') return 'Alta';
    if (prioridade === 'MEDIA') return 'Media';
    return 'Baixa';
  }

  variantePrioridade(prioridade: Atividade['prioridade']): 'neutro' | 'info' | 'alerta' | 'critico' {
    if (prioridade === Prioridade.MEDIA) return 'info';
    if (prioridade === Prioridade.ALTA) return 'alerta';
    if (prioridade === Prioridade.CRITICA) return 'critico';
    return 'neutro';
  }

  textoVinculoHu(): string {
    const atividadePaiId = this.atividade()?.atividadePaiId;
    if (!atividadePaiId) return 'Nao vinculada';
    const hu = this.historiasUsuarioDisponiveis().find((atividade) => atividade.id === atividadePaiId);
    return hu ? `${hu.codigoReferencia} - ${hu.titulo}` : 'HU vinculada nao encontrada';
  }

  @HostListener('document:keydown.escape')
  aoPressionarEsc(): void {
    if (this.aberto()) this.fechar.emit();
  }
}
