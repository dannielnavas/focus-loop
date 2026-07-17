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
      'rounded-2xl bg-cream-elevated/80 dark:bg-dark-elevated/70 backdrop-blur-xl border border-line dark:border-dark-border/60 transition-all duration-300';
    const variants: Record<CardVariant, string> = {
      default: 'shadow-sm hover:shadow-lg',
      elevated: 'shadow-2xl',
      bordered: 'shadow-none border-2',
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
