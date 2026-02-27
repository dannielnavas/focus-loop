import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CardVariant = 'default' | 'elevated' | 'bordered';

@Component({
  selector: 'app-ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.html',
})
export class UiCardComponent {
  /** 'default' (shadow-sm + border) | 'elevated' (shadow-md) | 'bordered' (solo borde) */
  variant = input<CardVariant>('default');
  /** Padding: 'none' | 'sm' | 'md' | 'lg' */
  padding = input<'none' | 'sm' | 'md' | 'lg'>('md');
  /** Clases adicionales para el contenedor */
  class = input<string>('');

  protected get rootClasses(): string {
    const base =
      'rounded-xl bg-white dark:bg-dark-elevated border border-gray-200 dark:border-dark-border';
    const variants: Record<CardVariant, string> = {
      default: 'shadow-sm',
      elevated: 'shadow-md',
      bordered: '',
    };
    const paddings: Record<string, string> = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };
    return [base, variants[this.variant()], paddings[this.padding()], this.class()].filter(Boolean).join(' ');
  }
}
