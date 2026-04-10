import { Injectable, inject } from '@angular/core';
import { StorageService } from '@/core/services/storage.service';

/**
 * Sincroniza `html.dark` con las preferencias del usuario (localStorage compartido en Electron)
 * y, si no hay preferencia guardada, con `prefers-color-scheme`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storage = inject(StorageService);

  /** Aplica el tema leyendo `user_data.preferences.dark_mode` o el sistema. */
  syncFromStorage(): void {
    const user = this.storage.getUserData();
    let dark: boolean;
    if (
      user?.preferences &&
      typeof (user.preferences as { dark_mode?: boolean }).dark_mode ===
        'boolean'
    ) {
      dark = (user.preferences as { dark_mode: boolean }).dark_mode;
    } else {
      dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    this.setDark(dark);
  }

  /** Solo actualiza la clase en `<html>`. */
  setDark(dark: boolean): void {
    document.documentElement.classList.toggle('dark', dark);
  }

  /**
   * Actualiza tema y persiste `dark_mode` dentro de `user_data` para que coincida en todas las ventanas.
   */
  setDarkPersist(dark: boolean): void {
    this.setDark(dark);
    const user = this.storage.getUserData() || {};
    const prev = (user.preferences || {}) as {
      email_notifications?: boolean;
      dark_mode?: boolean;
      task_reminders?: boolean;
    };
    this.storage.setUserData({
      ...user,
      preferences: {
        email_notifications: prev.email_notifications ?? true,
        task_reminders: prev.task_reminders ?? true,
        dark_mode: dark,
      },
    });
  }
}
