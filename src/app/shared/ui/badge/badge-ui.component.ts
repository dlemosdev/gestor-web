import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-badge-ui',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classesBadge()">{{ texto() }}</span>
  `,
})
export class BadgeUiComponent {
  readonly texto = input<string>('Badge');
  readonly variante = input<'neutro' | 'info' | 'sucesso' | 'alerta' | 'critico'>('neutro');

  readonly classesBadge = computed(() => {
    const base = 'inline-flex items-center rounded-lg border px-2 py-1 text-xs font-semibold';

    const mapa: Record<string, string> = {
      neutro: 'border-slate-200 bg-slate-100 text-slate-700',
      info: 'border-blue-200 bg-blue-50 text-blue-700',
      sucesso: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      alerta: 'border-amber-200 bg-amber-50 text-amber-700',
      critico: 'border-red-200 bg-red-50 text-red-700',
    };

    return `${base} ${mapa[this.variante()]}`;
  });
}

