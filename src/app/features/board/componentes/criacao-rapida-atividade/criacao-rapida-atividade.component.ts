import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-criacao-rapida-atividade',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="mt-4 rounded-xl border border-borda bg-superficie-secundaria p-2.5" [formGroup]="formularioAtividade" (ngSubmit)="criarAtividade()">
      <input
        formControlName="titulo"
        type="text"
        placeholder="Adicionar nova atividade"
        class="entrada-criacao-atividade h-10 w-full rounded-lg border border-borda bg-superficie px-2.5 text-sm outline-none focus:border-primaria"
      />
      <div class="mt-2 flex justify-end">
        <app-botao-ui texto="Adicionar" tamanho="sm" variante="secundario" [desabilitado]="formularioAtividade.invalid" />
      </div>
    </form>
  `,
})
export class CriacaoRapidaAtividadeComponent {
  private readonly fb = new FormBuilder();

  readonly criar = output<string>();
  readonly desabilitado = input(false);

  readonly formularioAtividade = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3)]],
  });

  criarAtividade(): void {
    if (this.formularioAtividade.invalid) {
      return;
    }

    const titulo = this.formularioAtividade.controls.titulo.value?.trim() ?? '';
    this.criar.emit(titulo);
    this.formularioAtividade.reset({ titulo: '' });
  }
}

