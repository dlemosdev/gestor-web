import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-formulario-raia',
  standalone: true,
  imports: [ReactiveFormsModule, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="space-y-5" [formGroup]="formularioRaia" (ngSubmit)="criarRaia()">
      <label class="flex flex-col gap-1.5">
        <span class="text-xs font-semibold uppercase tracking-wide text-cor-texto-secundaria">Nome da raia</span>
        <input
          formControlName="nome"
          type="text"
          placeholder="Ex.: Em revisão"
          class="h-11 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria focus:ring-2 focus:ring-blue-100"
        />
      </label>

      <div class="flex justify-end gap-2 border-t border-borda pt-4">
        <app-botao-ui texto="Cancelar" variante="secundario" (click)="cancelar.emit()" />
        <app-botao-ui texto="Criar raia" tipo="submit" [desabilitado]="formularioRaia.invalid" />
      </div>
    </form>
  `,
})
export class FormularioRaiaComponent {
  private readonly fb = new FormBuilder();

  readonly criar = output<string>();
  readonly cancelar = output<void>();

  readonly formularioRaia = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
  });

  criarRaia(): void {
    if (this.formularioRaia.invalid) {
      this.formularioRaia.markAllAsTouched();
      return;
    }

    const nome = this.formularioRaia.controls.nome.value?.trim() ?? '';

    if (!nome) {
      return;
    }

    this.criar.emit(nome);
    this.formularioRaia.reset({ nome: '' });
  }
}
