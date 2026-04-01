import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Projeto } from '../../../../models/projeto.model';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-formulario-projeto',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-2xl border border-borda bg-superficie p-4 shadow-[var(--sombra-card)]">
      <h3 class="text-base font-semibold text-cor-texto">
        {{ projetoEdicao() ? 'Editar projeto' : 'Novo projeto' }}
      </h3>

      <form [formGroup]="formularioProjeto" class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2" (ngSubmit)="salvar()">
        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-cor-texto-secundaria">Nome</span>
          <input
            id="input-nome-projeto"
            formControlName="nome"
            type="text"
            class="h-11 rounded-xl border border-borda bg-superficie px-3.5 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20"
          />
        </label>

        <label class="flex flex-col gap-1">
          <span class="text-xs font-medium text-cor-texto-secundaria">Cor</span>
          <input
            formControlName="cor"
            type="color"
            class="h-11 rounded-xl border border-borda bg-superficie px-1.5"
          />
        </label>

        <label class="md:col-span-2 flex flex-col gap-1">
          <span class="text-xs font-medium text-cor-texto-secundaria">Descrição</span>
          <textarea
            formControlName="descricao"
            rows="3"
            class="rounded-xl border border-borda bg-superficie px-3.5 py-2.5 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-primaria/20"
          ></textarea>
        </label>

        <div class="md:col-span-2 flex justify-end gap-2 pt-2">
          <app-botao-ui texto="Cancelar" variante="secundario" (click)="cancelarEdicao.emit()" />
          <app-botao-ui
            tipo="submit"
            [texto]="projetoEdicao() ? 'Salvar alteracoes' : 'Criar projeto'"
            [desabilitado]="formularioProjeto.invalid"
          />
        </div>
      </form>
    </section>
  `,
})
export class FormularioProjetoComponent {
  private readonly fb = inject(FormBuilder);

  readonly projetoEdicao = input<Projeto | null>(null);

  readonly salvarProjeto = output<Omit<Projeto, 'id' | 'criadoEm' | 'atualizadoEm' | 'status' | 'principal'> & { id?: string }>();
  readonly cancelarEdicao = output<void>();

  readonly formularioProjeto = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(8)]],
    cor: ['#2563eb'],
  });

  constructor() {
    effect(() => {
      const projeto = this.projetoEdicao();

      if (projeto) {
        this.formularioProjeto.patchValue({
          nome: projeto.nome,
          descricao: projeto.descricao,
          cor: projeto.cor ?? '#2563eb',
        });
      } else {
        this.formularioProjeto.reset({
          nome: '',
          descricao: '',
          cor: '#2563eb',
        });
      }
    });
  }

  salvar(): void {
    if (this.formularioProjeto.invalid) {
      this.formularioProjeto.markAllAsTouched();
      return;
    }

    const valor = this.formularioProjeto.getRawValue();

    this.salvarProjeto.emit({
      id: this.projetoEdicao()?.id,
      nome: valor.nome?.trim() ?? '',
      descricao: valor.descricao?.trim() ?? '',
      cor: valor.cor ?? '#2563eb',
    });

    if (!this.projetoEdicao()) {
      this.formularioProjeto.reset({ nome: '', descricao: '', cor: '#2563eb' });
    }
  }
}


