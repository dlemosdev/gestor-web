import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';
import { OpcaoSeletorUi } from '../../../../shared/ui/seletor/seletor-ui.component';

export interface FiltrosBoard {
  busca: string;
  prioridade: string;
  status: string;
  responsavel: string;
  prazo: string;
}

@Component({
  selector: 'app-barra-filtros-board',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="formularioFiltros" class="space-y-4" (ngSubmit)="aplicarFiltros()">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Buscar</span>
        <input
          type="search"
          formControlName="busca"
          placeholder="Titulo, descrição ou etiqueta"
          aria-label="Busca de atividades"
          class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto outline-none transition placeholder:text-slate-400 focus:border-primaria focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Prioridade</span>
          <select
            formControlName="prioridade"
            class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto outline-none transition focus:border-primaria focus:ring-2 focus:ring-blue-100"
          >
            @for (opcao of opcoesPrioridade; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Status</span>
          <select
            formControlName="status"
            class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto outline-none transition focus:border-primaria focus:ring-2 focus:ring-blue-100"
          >
            @for (opcao of opcoesStatus; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Responsável</span>
          <select
            formControlName="responsavel"
            class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm text-cor-texto outline-none transition focus:border-primaria focus:ring-2 focus:ring-blue-100"
          >
            @for (opcao of opcoesResponsavel(); track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Prazo</span>
          <input
            type="date"
            formControlName="prazo"
            class="h-11 rounded-xl border border-borda bg-superficie px-3 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <div class="flex justify-end gap-2 border-t border-borda pt-4">
        <app-botao-ui texto="Limpar filtros" variante="secundario" tamanho="sm" (click)="limparFiltros()" />
        <app-botao-ui texto="Pesquisar" tamanho="sm" tipo="submit" />
      </div>
    </form>
  `,
})
export class BarraFiltrosBoardComponent {
  private readonly fb = new FormBuilder();

  readonly responsaveis = input<OpcaoSeletorUi[]>([]);
  readonly filtrosAtuais = input<FiltrosBoard | null>(null);
  readonly filtrosAlterados = output<FiltrosBoard>();

  readonly opcoesPrioridade: OpcaoSeletorUi[] = [
    { valor: '', rotulo: 'Todas' },
    { valor: 'BAIXA', rotulo: 'Baixa' },
    { valor: 'MEDIA', rotulo: 'Média' },
    { valor: 'ALTA', rotulo: 'Alta' },
    { valor: 'CRITICA', rotulo: 'Crítica' },
  ];

  readonly opcoesStatus: OpcaoSeletorUi[] = [
    { valor: '', rotulo: 'Todos' },
    { valor: 'BACKLOG', rotulo: 'Backlog' },
    { valor: 'EM_ANDAMENTO', rotulo: 'Em andamento' },
    { valor: 'BLOQUEADA', rotulo: 'Bloqueada' },
    { valor: 'CONCLUIDA', rotulo: 'Concluída' },
  ];

  readonly formularioFiltros = this.fb.group({
    busca: [''],
    prioridade: [''],
    status: [''],
    responsavel: [''],
    prazo: [''],
  });

  constructor() {
    effect(() => {
      const filtros = this.filtrosAtuais();

      if (!filtros) {
        return;
      }

      this.formularioFiltros.patchValue(
        {
          busca: filtros.busca,
          prioridade: filtros.prioridade,
          status: filtros.status,
          responsavel: filtros.responsavel,
          prazo: filtros.prazo,
        },
        { emitEvent: false },
      );
    });
  }

  opcoesResponsavel(): OpcaoSeletorUi[] {
    return [{ valor: '', rotulo: 'Todos' }, ...this.responsaveis()];
  }

  aplicarFiltros(): void {
    const valor = this.formularioFiltros.getRawValue();

    this.filtrosAlterados.emit({
      busca: valor.busca ?? '',
      prioridade: valor.prioridade ?? '',
      status: valor.status ?? '',
      responsavel: valor.responsavel ?? '',
      prazo: valor.prazo ?? '',
    });
  }

  limparFiltros(): void {
    this.formularioFiltros.reset({ busca: '', prioridade: '', status: '', responsavel: '', prazo: '' });
    this.aplicarFiltros();
  }
}
