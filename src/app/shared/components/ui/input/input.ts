import { Component, input, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UiInputComponent,
      multi: true,
    },
  ],
})
export class UiInputComponent implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  type = input<string>('text');
  disabled = input<boolean>(false);
  /** Disabled state from form control (CVA) */
  protected disabledState = signal<boolean>(false);
  required = input<boolean>(false);
  /** Clases adicionales para el input */
  class = input<string>('');
  /** Hint o error debajo del input */
  hint = input<string>('');
  error = input<string>('');

  value = model<string>('');

  private onTouched: () => void = () => {};
  private onChange: (value: string) => void = () => {};

  protected readonly inputClasses =
    'w-full bg-transparent border rounded-md px-3 py-2 text-sm transition-all ' +
    'border-gray-300 dark:border-dark-border text-gray-900 dark:text-dark-text placeholder-gray-500 dark:placeholder-dark-text-muted ' +
    'focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-dark-accent focus:border-transparent ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  writeValue(value: string): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledState.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    const v = el.value;
    this.value.set(v);
    this.onChange(v);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
