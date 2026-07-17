import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.html',
})
export class UiButtonComponent {
  /** 'primary' | 'secondary' | 'outline' | 'ghost' */
  variant = input<ButtonVariant>('primary');
  /** 'sm' | 'md' | 'lg' */
  size = input<ButtonSize>('md');
  disabled = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  /** Accesibilidad: anunciado por lectores de pantalla (p. ej. botón solo icono) */
  ariaLabel = input<string | undefined>(undefined);
  /** Clases adicionales */
  class = input<string>('');

  protected get variantClasses(): string {
    const v = this.variant();
    const base =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream dark:focus:ring-offset-dark disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed';
    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-accent text-white border-0 hover:bg-accent-hover active:scale-[0.99] shadow-sm focus:ring-accent dark:bg-dark-accent dark:hover:bg-dark-accent-hover dark:focus:ring-dark-accent',
      secondary:
        'bg-cream-elevated dark:bg-dark-elevated text-ink dark:text-dark-text border border-line dark:border-dark-border hover:border-line-hover dark:hover:border-dark-border-hover focus:ring-accent dark:focus:ring-dark-accent',
      outline:
        'bg-transparent border border-line dark:border-dark-border text-ink dark:text-dark-text hover:bg-black/[0.03] dark:hover:bg-white/5 focus:ring-accent dark:focus:ring-dark-accent',
      ghost:
        'bg-transparent text-ink-muted dark:text-dark-text-muted hover:bg-black/[0.04] dark:hover:bg-white/5 focus:ring-accent dark:focus:ring-dark-accent',
      accent:
        'bg-accent text-white hover:bg-accent-hover dark:bg-dark-accent dark:text-white dark:hover:bg-dark-accent-hover focus:ring-accent dark:focus:ring-dark-accent',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };
    return [base, variants[v], sizes[this.size()]].filter(Boolean).join(' ');
  }
}
