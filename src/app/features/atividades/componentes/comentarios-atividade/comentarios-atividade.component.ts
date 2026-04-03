import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { Comentario } from '../../../../models/comentario.model';
import { BotaoUiComponent } from '../../../../shared/ui/botao/botao-ui.component';

@Component({
  selector: 'app-comentarios-atividade',
  standalone: true,
  imports: [DatePipe, BotaoUiComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="space-y-4 rounded-2xl border border-borda bg-superficie-secundaria p-4">
      <h4 class="text-sm font-semibold text-cor-texto">Comentários</h4>

      @if (comentarios().length === 0) {
        <p class="text-xs text-cor-texto-secundaria">Nenhum comentário ainda.</p>
      }

      @for (comentario of comentarios(); track comentario.id) {
        <article class="rounded-xl bg-superficie p-3 text-sm">
          <header class="mb-1.5 flex items-center justify-between text-xs text-cor-texto-secundaria">
            <span>{{ comentario.usuarioId }}</span>
            <span>{{ comentario.criadoEm | date: 'dd/MM HH:mm' }}</span>
          </header>
          <p class="text-cor-texto">{{ comentario.texto }}</p>
        </article>
      }

      <div class="pt-1 flex gap-2">
        <input
          #inputComentario
          type="text"
          placeholder="Adicionar comentário"
          class="h-10 flex-1 rounded-xl border border-borda px-3 text-sm outline-none focus:border-primaria"
          (keydown.enter)="adicionarComentario(inputComentario.value); inputComentario.value = ''"
        />
        <app-botao-ui
          texto="Enviar"
          icone="send"
          tamanho="sm"
          variante="secundario"
          (click)="adicionarComentario(inputComentario.value); inputComentario.value = ''"
        />
      </div>
    </section>
  `,
})
export class ComentariosAtividadeComponent {
  readonly comentarios = input<Comentario[]>([]);
  readonly adicionar = output<string>();

  adicionarComentario(texto: string): void {
    const textoNormalizado = texto.trim();

    if (!textoNormalizado) {
      return;
    }

    this.adicionar.emit(textoNormalizado);
  }
}

