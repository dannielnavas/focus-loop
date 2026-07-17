import { OptimisticUIService } from '@/core/services/optimistic-ui';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-optimistic-status',
  standalone: true,
  template: `
    @if (hasPendingOperations() || hasErrorOperations()) {
      <div class="optimistic-status">
        <!-- Indicador de operaciones pendientes -->
        @if (hasPendingOperations()) {
          <div class="pending-operations">
            <div class="spinner"></div>
            <span>{{ pendingCount() }} pending operation(s)</span>
          </div>
        }
        <!-- Indicador de errores -->
        @if (hasErrorOperations()) {
          <div class="error-operations">
            <svg
              class="error-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-8.18 14.18A2 2 0 004 21h16a2 2 0 001.89-2.96L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
            <span>{{ errorCount() }} error(s) - Retrying...</span>
            <button (click)="retryFailedOperations()" class="retry-btn">
              Retry
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .optimistic-status {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-end;
      }

      .pending-operations,
      .error-operations {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.8rem;
        border-radius: 9999px;
        font-size: 0.8125rem;
        font-weight: 500;
        box-shadow: 0 10px 26px rgba(30, 41, 48, 0.12);
      }

      .pending-operations {
        background: var(--color-cream-elevated);
        color: var(--color-ink-muted);
        border: 1px solid var(--color-line);
      }

      html.dark .pending-operations {
        background: var(--color-dark-elevated);
        color: var(--color-dark-text-muted);
        border-color: var(--color-dark-border);
      }

      .error-operations {
        background: color-mix(in srgb, #b3453a 10%, var(--color-cream-elevated));
        color: #8a3327;
        border: 1px solid rgba(179, 69, 58, 0.25);
      }

      html.dark .error-operations {
        background: color-mix(in srgb, var(--color-dark-error) 16%, var(--color-dark-elevated));
        color: var(--color-dark-error);
        border-color: rgba(217, 138, 120, 0.3);
      }

      .spinner {
        width: 0.9rem;
        height: 0.9rem;
        border-radius: 50%;
        border: 2px solid currentColor;
        border-right-color: transparent;
        opacity: 0.6;
        animation: optimistic-spin 0.7s linear infinite;
      }

      .error-icon {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }

      .retry-btn {
        border: none;
        background: transparent;
        color: inherit;
        font-weight: 600;
        font-size: 0.75rem;
        text-decoration: underline;
        text-underline-offset: 2px;
        cursor: pointer;
        padding: 0;
      }

      @keyframes optimistic-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OptimisticStatusComponent {
  private readonly optimisticUI = inject(OptimisticUIService);

  pendingCount = computed(
    () => this.optimisticUI.getPendingOperations().length,
  );
  errorCount = computed(() => this.optimisticUI.getErrorOperations().length);

  hasPendingOperations = computed(() => this.pendingCount() > 0);
  hasErrorOperations = computed(() => this.errorCount() > 0);

  retryFailedOperations() {
    // Aquí podrías implementar lógica para reintentar operaciones fallidas.
    // Por ahora, simplemente limpiamos los errores
    this.optimisticUI.clearAllOperations();
  }
}
