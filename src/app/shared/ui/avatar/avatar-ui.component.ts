import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (urlImagem()) {
      <img
        [src]="urlImagem()"
        [alt]="textoAlternativo()"
        class="h-10 w-10 rounded-full border border-borda object-cover"
      />
    } @else {
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primaria text-xs font-semibold uppercase text-white">
        {{ iniciais() }}
      </div>
    }
  `,
})
export class AvatarUiComponent {
  readonly iniciais = input<string>('US');
  readonly urlImagem = input<string>('');
  readonly textoAlternativo = input<string>('Avatar do usu�rio');
}

