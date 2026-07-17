import { NotificationService } from '@/core/services/notification.service';
import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="notifications-container">
      @for (notification of notifications(); track notification.id) {
        <div
          class="notification"
          [class]="getNotificationClass(notification.type)"
          (click)="removeNotification(notification.id)"
        >
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              }
              @case ('error') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              }
              @case ('warning') {
                <svg
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
              }
              @case ('info') {
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            }
          </div>
          <div class="notification-content">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button
            class="notification-close"
            (click)="
              removeNotification(notification.id); $event.stopPropagation()
            "
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .notifications-container {
        position: fixed;
        top: calc(env(safe-area-inset-top, 0px) + 4.5rem);
        left: 1rem;
        z-index: 1001;
        max-width: 380px;
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }

      .notification {
        display: flex;
        align-items: flex-start;
        gap: 0.65rem;
        padding: 0.8rem 0.9rem;
        border-radius: 0.85rem;
        border: 1px solid var(--color-line);
        background: var(--color-cream-elevated);
        color: var(--color-ink);
        box-shadow: 0 10px 28px rgba(30, 41, 48, 0.1);
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        animation: notification-in 0.25s ease-out;
      }

      html.dark .notification {
        background: var(--color-dark-elevated);
        color: var(--color-dark-text);
        border-color: var(--color-dark-border);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      }

      .notification:hover {
        transform: translateX(3px);
      }

      .notification-icon {
        flex-shrink: 0;
        width: 1.25rem;
        height: 1.25rem;
        margin-top: 0.05rem;
      }

      .notification-icon svg {
        width: 100%;
        height: 100%;
      }

      .notification.success .notification-icon {
        color: var(--color-accent);
      }
      html.dark .notification.success .notification-icon {
        color: var(--color-dark-success);
      }

      .notification.error .notification-icon {
        color: #b3453a;
      }
      html.dark .notification.error .notification-icon {
        color: var(--color-dark-error);
      }

      .notification.warning .notification-icon {
        color: #b8863f;
      }
      html.dark .notification.warning .notification-icon {
        color: var(--color-dark-warning);
      }

      .notification.info .notification-icon {
        color: #6e8cae;
      }
      html.dark .notification.info .notification-icon {
        color: #8fb0d4;
      }

      .notification-content {
        min-width: 0;
        flex: 1;
      }

      .notification-title {
        font-size: 0.875rem;
        font-weight: 600;
        line-height: 1.3;
      }

      .notification-message {
        margin-top: 0.15rem;
        font-size: 0.8125rem;
        line-height: 1.4;
        color: var(--color-ink-muted);
      }

      html.dark .notification-message {
        color: var(--color-dark-text-muted);
      }

      .notification-close {
        flex-shrink: 0;
        border: none;
        background: transparent;
        color: var(--color-ink-muted);
        font-size: 1.1rem;
        line-height: 1;
        cursor: pointer;
        padding: 0.1rem 0.25rem;
        border-radius: 0.35rem;
        transition: background-color 0.15s ease, color 0.15s ease;
      }

      .notification-close:hover {
        background: rgba(30, 41, 48, 0.06);
        color: var(--color-ink);
      }

      html.dark .notification-close {
        color: var(--color-dark-text-muted);
      }

      html.dark .notification-close:hover {
        background: rgba(255, 255, 255, 0.08);
        color: var(--color-dark-text);
      }

      @keyframes notification-in {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ],
})
export class NotificationsComponent {
  private readonly notificationService = inject(NotificationService);

  notifications = computed(() => this.notificationService.getNotifications());

  getNotificationClass(type: string): string {
    return `notification ${type}`;
  }

  removeNotification(id: string) {
    this.notificationService.removeNotification(id);
  }
}
