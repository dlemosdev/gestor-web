import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Projeto } from '../../../../models/projeto.model';
import { OPCOES_RAIAS_PADRAO_PROJETO, RaiaPadraoProjeto } from '../../../../models/raias-padrao-projeto';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

export interface DadosFormularioProjeto {
  id?: string;
  nome: string;
  descricao: string;
  cor?: string;
  raiasPadrao: RaiaPadraoProjeto[];
}

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

        @if (!projetoEdicao()) {
          <section class="md:col-span-2 rounded-2xl border border-borda bg-superficie-secundaria/35 p-4">
            <div class="mb-3">
              <h4 class="text-sm font-semibold text-cor-texto">Raias padrão do board</h4>
              <p class="mt-1 text-xs text-cor-texto-secundaria">Selecione quais etapas padrão esse projeto terá ao nascer.</p>
            </div>

            <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
              @for (opcao of opcoesRaiasPadrao; track opcao.valor) {
                <label class="flex items-center gap-3 rounded-xl border border-borda bg-superficie px-3 py-2.5 text-sm text-cor-texto">
                  <input
                    type="checkbox"
                    [checked]="raiaSelecionada(opcao.valor)"
                    (change)="alternarRaiaPadrao(opcao.valor, $event)"
                    class="h-4 w-4 rounded border-borda text-primaria focus:ring-primaria"
                  />
                  <span>{{ opcao.rotulo }}</span>
                </label>
              }
            </div>

            @if (selecionouAlgumaRaiaInvalida()) {
              <p class="mt-3 text-xs font-semibold text-red-300">Selecione pelo menos uma raia padrão.</p>
            }
          </section>
        }

        <div class="md:col-span-2 flex justify-end gap-2 pt-2">
          <app-botao-ui texto="Cancelar" variante="secundario" (click)="cancelarEdicao.emit()" />
          <app-botao-ui
            tipo="submit"
            [texto]="projetoEdicao() ? 'Salvar alterações' : 'Criar projeto'"
            [desabilitado]="formularioProjeto.invalid || (!projetoEdicao() && raiasSelecionadas().length === 0)"
          />
        </div>
      </form>
    </section>
  `,
})
export class FormularioProjetoComponent {
  private readonly fb = inject(FormBuilder);

  readonly opcoesRaiasPadrao = OPCOES_RAIAS_PADRAO_PROJETO;
  readonly projetoEdicao = input<Projeto | null>(null);

  readonly salvarProjeto = output<DadosFormularioProjeto>();
  readonly cancelarEdicao = output<void>();

  readonly formularioProjeto = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    descricao: ['', [Validators.required, Validators.minLength(8)]],
    cor: ['#2563eb'],
  });

  private readonly raiasSelecionadasInterno = this.fb.nonNullable.control<RaiaPadraoProjeto[]>([
    'BACKLOG',
    'EM_ANDAMENTO',
    'TESTE',
    'AGUARDANDO_PUBLICACAO',
    'CONCLUIDAS',
  ]);

  constructor() {
    effect(() => {
      const projeto = this.projetoEdicao();

      if (projeto) {
        this.formularioProjeto.patchValue({
          nome: projeto.nome,
          descricao: projeto.descricao,
          cor: projeto.cor ?? '#2563eb',
        });
        return;
      }

      this.formularioProjeto.reset({
        nome: '',
        descricao: '',
        cor: '#2563eb',
      });
      this.raiasSelecionadasInterno.setValue(['BACKLOG', 'EM_ANDAMENTO', 'TESTE', 'AGUARDANDO_PUBLICACAO', 'CONCLUIDAS']);
    });
  }

  raiasSelecionadas(): RaiaPadraoProjeto[] {
    return this.raiasSelecionadasInterno.value;
  }

  raiaSelecionada(raia: RaiaPadraoProjeto): boolean {
    return this.raiasSelecionadas().includes(raia);
  }

  selecionouAlgumaRaiaInvalida(): boolean {
    return !this.projetoEdicao() && this.raiasSelecionadas().length === 0;
  }

  alternarRaiaPadrao(raia: RaiaPadraoProjeto, evento: Event): void {
    const selecionado = (evento.target as HTMLInputElement).checked;
    const atuais = this.raiasSelecionadas();

    if (selecionado) {
      this.raiasSelecionadasInterno.setValue([...atuais, raia]);
      return;
    }

    this.raiasSelecionadasInterno.setValue(atuais.filter((item) => item !== raia));
  }

  salvar(): void {
    if (this.formularioProjeto.invalid || (!this.projetoEdicao() && this.raiasSelecionadas().length === 0)) {
      this.formularioProjeto.markAllAsTouched();
      return;
    }

    const valor = this.formularioProjeto.getRawValue();

    this.salvarProjeto.emit({
      id: this.projetoEdicao()?.id,
      nome: valor.nome?.trim() ?? '',
      descricao: valor.descricao?.trim() ?? '',
      cor: valor.cor ?? '#2563eb',
      raiasPadrao: this.projetoEdicao() ? [] : this.raiasSelecionadas(),
    });

    if (!this.projetoEdicao()) {
      this.formularioProjeto.reset({ nome: '', descricao: '', cor: '#2563eb' });
      this.raiasSelecionadasInterno.setValue(['BACKLOG', 'EM_ANDAMENTO', 'TESTE', 'AGUARDANDO_PUBLICACAO', 'CONCLUIDAS']);
    }
  }
}
