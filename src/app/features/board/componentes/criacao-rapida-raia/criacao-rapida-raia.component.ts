import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-criacao-rapida-raia',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="rounded-2xl border border-dashed border-borda bg-superficie p-3" [formGroup]="formularioRaia" (ngSubmit)="criarRaia()">
      <label class="flex flex-col gap-1">
        <span class="text-xs font-medium text-cor-texto-secundaria">Nova Raia</span>
        <input
          id="input-criacao-raia"
          formControlName="nome"
          type="text"
          placeholder="Ex.: Em revisao"
          class="h-10 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-blue-100"
        />
      </label>
      <div class="mt-3 flex justify-end">
        <app-botao-ui texto="Criar" tamanho="sm" [desabilitado]="formularioRaia.invalid" />
      </div>
    </form>
  `,
})
export class CriacaoRapidaRaiaComponent {
  private readonly fb = new FormBuilder();

  readonly desabilitado = input(false);
  readonly criar = output<string>();

  readonly formularioRaia = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
  });

  criarRaia(): void {
    if (this.formularioRaia.invalid) {
      this.formularioRaia.markAllAsTouched();
      return;
    }

    const nome = this.formularioRaia.controls.nome.value?.trim() ?? '';
    this.criar.emit(nome);
    this.formularioRaia.reset({ nome: '' });
  }
}

