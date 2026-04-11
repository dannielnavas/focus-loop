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
      'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-dark disabled:opacity-50 disabled:pointer-events-none';
    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 focus:ring-black dark:focus:ring-white',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-dark-elevated dark:text-dark-text dark:hover:bg-dark-border focus:ring-gray-500 dark:focus:ring-dark-accent',
      outline:
        'bg-transparent border border-gray-200 text-gray-900 hover:bg-gray-50 dark:border-dark-border dark:text-dark-text dark:hover:bg-dark-border focus:ring-gray-500 dark:focus:ring-dark-accent',
      ghost:
        'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-dark-text-muted dark:hover:bg-dark-border focus:ring-gray-500 dark:focus:ring-dark-accent',
      accent:
        'bg-indigo-500 text-white hover:bg-indigo-600 dark:bg-dark-accent dark:text-white dark:hover:bg-dark-accent-hover focus:ring-indigo-500 dark:focus:ring-dark-accent',
    };
    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-base',
    };
    return [base, variants[v], sizes[this.size()]].filter(Boolean).join(' ');
  }
}
