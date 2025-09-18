import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);

  /**
   * Muestra una notificación de éxito
   */
  success(title: string, message: string, duration: number = 3000) {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Muestra una notificación de error
   */
  error(title: string, message: string, duration: number = 5000) {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Muestra una notificación de advertencia
   */
  warning(title: string, message: string, duration: number = 4000) {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Muestra una notificación informativa
   */
  info(title: string, message: string, duration: number = 3000) {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration,
      timestamp: Date.now(),
    });
  }

  /**
   * Agrega una notificación
   */
  private addNotification(notification: Notification) {
    this.notifications.update((notifications) => [
      ...notifications,
      notification,
    ]);

    // Auto-remover después de la duración especificada
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Remueve una notificación
   */
  removeNotification(id: string) {
    this.notifications.update((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  }

  /**
   * Obtiene todas las notificaciones
   */
  getNotifications() {
    return this.notifications();
  }

  /**
   * Limpia todas las notificaciones
   */
  clearAll() {
    this.notifications.set([]);
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }
}
