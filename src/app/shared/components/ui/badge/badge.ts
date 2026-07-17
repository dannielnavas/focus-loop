import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
})
export class UiBadgeComponent {
  variant = input<BadgeVariant>('neutral');
  class = input<string>('');

  protected get variantClasses(): string {
    const v = this.variant();
    const base = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium';
    const variants: Record<BadgeVariant, string> = {
      neutral:
        'bg-cream-elevated text-ink-muted dark:bg-dark-elevated dark:text-dark-text-muted border border-line dark:border-dark-border',
      success:
        'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      warning:
        'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
      error:
        'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800',
    };
    return [base, variants[v], this.class()].filter(Boolean).join(' ');
  }
}
