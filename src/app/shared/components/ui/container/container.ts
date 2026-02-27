import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './container.html',
})
export class UiContainerComponent {
  /** Clases adicionales */
  class = input<string>('');

  protected get rootClasses(): string {
    return ['max-w-7xl mx-auto px-4 sm:px-6 lg:px-8', this.class()].filter(Boolean).join(' ');
  }
}
