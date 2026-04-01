import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Atividade } from '../../../../models/atividade.model';
import { Prioridade } from '../../../../models/enums/prioridade.enum';
import { StatusAtividade } from '../../../../models/enums/status-atividade.enum';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';
import { OpcaoSeletorUi } from '../../../../shared/ui/seletor/seletor-ui.component';

@Component({
  selector: 'app-formulario-atividade',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form [formGroup]="formularioAtividade" class="space-y-5 rounded-2xl border border-borda bg-superficie-secundaria p-4" (ngSubmit)="salvarFormulario()">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Título</span>
        <input formControlName="titulo" type="text" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria" />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold text-cor-texto-secundaria">Descrição</span>
        <textarea formControlName="descricao" rows="4" class="rounded-xl border border-borda px-3 py-2.5 text-sm outline-none focus:border-primaria"></textarea>
      </label>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Raia</span>
          <select formControlName="raiaId" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesRaias(); track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Prioridade</span>
          <select formControlName="prioridade" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesPrioridade; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Status</span>
          <select formControlName="status" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of opcoesStatus; track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Responsável</span>
          <select formControlName="responsavel" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria">
            @for (opcao of responsaveis(); track opcao.valor) {
              <option [value]="opcao.valor">{{ opcao.rotulo }}</option>
            }
          </select>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-xs font-semibold text-cor-texto-secundaria">Prazo</span>
          <input type="date" formControlName="prazo" class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria" />
        </label>
      </div>

      <div class="flex justify-end border-t border-borda pt-4">
        <app-botao-ui
          tipo="submit"
          [texto]="modoCriacao() ? 'Criar atividade' : 'Salvar alteracoes'"
          [desabilitado]="formularioAtividade.invalid"
        />
      </div>
    </form>
  `,
})
export class FormularioAtividadeComponent {
  private readonly fb = inject(FormBuilder);

  readonly atividade = input.required<Atividade>();
  readonly responsaveis = input<OpcaoSeletorUi[]>([]);
  readonly opcoesRaias = input<OpcaoSeletorUi[]>([]);
  readonly modoCriacao = input(false);
  readonly salvar = output<Atividade>();

  readonly opcoesPrioridade: OpcaoSeletorUi[] = [
    { valor: Prioridade.BAIXA, rotulo: 'Baixa' },
    { valor: Prioridade.MEDIA, rotulo: 'Média' },
    { valor: Prioridade.ALTA, rotulo: 'Alta' },
    { valor: Prioridade.CRITICA, rotulo: 'Crítica' },
  ];

  readonly opcoesStatus: OpcaoSeletorUi[] = [
    { valor: StatusAtividade.BACKLOG, rotulo: 'Backlog' },
    { valor: StatusAtividade.EM_ANDAMENTO, rotulo: 'Em andamento' },
    { valor: StatusAtividade.BLOQUEADA, rotulo: 'Bloqueada' },
    { valor: StatusAtividade.CONCLUIDA, rotulo: 'Concluída' },
  ];

  readonly formularioAtividade = this.fb.group({
    raiaId: ['', Validators.required],
    titulo: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(8)]],
    prioridade: [Prioridade.MEDIA, Validators.required],
    status: [StatusAtividade.BACKLOG, Validators.required],
    responsavel: ['', Validators.required],
    prazo: ['', Validators.required],
  });

  constructor() {
    effect(() => {
      const atividade = this.atividade();
      this.formularioAtividade.patchValue({
        raiaId: atividade.raiaId,
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        prioridade: atividade.prioridade,
        status: atividade.status,
        responsavel: atividade.responsavel,
        prazo: atividade.prazo,
      });
    });
  }

  salvarFormulario(): void {
    if (this.formularioAtividade.invalid) {
      this.formularioAtividade.markAllAsTouched();
      return;
    }

    const valor = this.formularioAtividade.getRawValue();

    this.salvar.emit({
      ...this.atividade(),
      raiaId: valor.raiaId ?? this.atividade().raiaId,
      titulo: valor.titulo ?? this.atividade().titulo,
      descricao: valor.descricao ?? this.atividade().descricao,
      prioridade: (valor.prioridade as Prioridade) ?? this.atividade().prioridade,
      status: (valor.status as StatusAtividade) ?? this.atividade().status,
      responsavel: valor.responsavel ?? this.atividade().responsavel,
      prazo: valor.prazo ?? this.atividade().prazo,
      atualizadoEm: new Date().toISOString(),
    });
  }
}
