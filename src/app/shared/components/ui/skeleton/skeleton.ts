import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
})
export class UiSkeletonComponent {
  /** 'text' | 'circular' | 'rectangular' */
  variant = input<'text' | 'circular' | 'rectangular'>('rectangular');
  /** Ancho: ej. 'w-full', 'w-12', 'w-3/4' */
  width = input<string>('w-full');
  /** Alto: ej. 'h-4', 'h-12' */
  height = input<string>('h-4');
  class = input<string>('');

  protected get rootClasses(): string {
    const base = 'animate-pulse bg-gray-200 dark:bg-dark-border rounded';
    const variants = {
      text: 'rounded',
      circular: 'rounded-full',
      rectangular: 'rounded-md',
    };
    return [base, variants[this.variant()], this.width(), this.height(), this.class()].filter(Boolean).join(' ');
  }
}
