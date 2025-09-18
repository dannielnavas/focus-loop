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
          @switch (notification.type) { @case ('success') { ✅ } @case ('error')
          { ❌ } @case ('warning') { ⚠️ } @case ('info') { ℹ️ } }
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
        top: 20px;
        left: 20px;
        z-index: 1001;
        max-width: 400px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .notification {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        cursor: pointer;
        transition: all 0.3s ease;
        animation: slideIn 0.3s ease-out;
      }

      .notification:hover {
        transform: translateX(4px);
      }

      .notification.success {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }

      .notification.error {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
      }

      .notification.warning {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .notification.info {
        background: linear-gradient(135deg, #3b82f6, #2563eb);
        color: white;
      }

      .notification-icon {
        font-size: 20px;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .notification-content {
        flex: 1;
        min-width: 0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .notification-message {
        font-size: 13px;
        opacity: 0.9;
        line-height: 1.4;
      }

      .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
      }

      .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }

      @keyframes slideIn {
        from {
          transform: translateX(-100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .notifications-container {
          left: 10px;
          right: 10px;
          max-width: none;
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
