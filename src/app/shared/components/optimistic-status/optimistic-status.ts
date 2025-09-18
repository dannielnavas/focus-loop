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
        <div class="error-icon">⚠️</div>
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
        top: 20px;
        right: 20px;
        z-index: 1000;
        max-width: 300px;
      }

      .pending-operations,
      .error-operations {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        font-size: 14px;
        font-weight: 500;
      }

      .pending-operations {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.2);
        color: #1e40af;
      }

      .error-operations {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #dc2626;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      .error-icon {
        font-size: 16px;
      }

      .retry-btn {
        background: #dc2626;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        margin-left: auto;
      }

      .retry-btn:hover {
        background: #b91c1c;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class OptimisticStatusComponent {
  private readonly optimisticUI = inject(OptimisticUIService);

  pendingCount = computed(
    () => this.optimisticUI.getPendingOperations().length
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
