import { SprintResponse } from '@/core/models/sprint.model';
import { Sprints } from '@/core/services/sprints';
import { Location } from '@angular/common';
import { Component, computed, inject, NgZone, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  showDaily = signal(false);
  dailyContent = signal('');
  showMenu = signal(false);

  user_id = computed(() => localStorage.getItem('user_id'));
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sprintService = inject(Sprints);
  private readonly ngZone = inject(NgZone);

  resourcesSprints = rxResource<SprintResponse[], { user_id: number }>({
    stream: ({ params }) => this.sprintService.getSprints(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  goToProfile() {
    this.router.navigate(['/private/profile']);
  }

  toggleMenu() {
    this.showMenu.set(!this.showMenu());
  }

  closeMenu() {
    this.showMenu.set(false);
  }

  logout() {
    // Clear session data
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');

    // Navigate to login
    this.router.navigate(['/']);
  }

  closeDaily() {
    this.showDaily.set(false);
    this.dailyContent.set('');
  }

  generateDailyAi() {
    const activeSprint = this.resourcesSprints
      .value()
      .filter((sprint) => sprint.status === 'active')[0];

    if (!activeSprint) {
      alert('There is no active sprint to generate the daily report');
      return;
    }

    this.sprintService.generateDaily(activeSprint.sprint_id).subscribe({
      next: (res) => {
        this.dailyContent.set(res.content);
        this.showDaily.set(true);
      },
      error: (err) => {
        console.error('Error generating daily report:', err);
        alert('Error generating daily report. Please try again.');
      },
    });
  }

  goToBack() {
    const currentUrl = this.router.url;

    // Si estamos en la página principal, verificar si hay historial
    if (currentUrl === '/private' || currentUrl === '/private/') {
      if (window.history.length > 1) {
        this.location.back();
      } else {
        // Si no hay historial, quedarse en la página principal
        console.log('Ya estás en la página principal');
      }
      return;
    }

    // Verificar si estamos en una ruta que debe volver a la página principal
    const shouldGoToMain = [
      '/private/work',
      '/private/timer',
      '/private/profile',
      '/private/settings',
      '/private/sprints',
    ].some((route) => currentUrl.startsWith(route));

    // Verificar si estamos en board con parámetros
    const isBoardRoute = currentUrl.startsWith('/private/board/');

    if (shouldGoToMain || isBoardRoute) {
      // Navegar directamente a la página principal
      this.router.navigate(['/private']);
      return;
    }

    // Para cualquier otra ruta, intentar navegar hacia atrás
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Fallback: navegar a la página principal
      this.router.navigate(['/private']);
    }
  }

  constructor() {
    // Subscribe to native menu events if available
    if (window.electronAPI) {
      window.electronAPI.onMenuGenerateDaily(() => {
        this.ngZone.run(() => this.generateDailyAi());
      });
      window.electronAPI.onMenuProfile(() => {
        this.ngZone.run(() => this.goToProfile());
      });
      window.electronAPI.onMenuLogout(() => {
        this.ngZone.run(() => this.logout());
      });
      window.electronAPI.onMenuAbout(() => {
        this.ngZone.run(() => alert('FocusLoop'));
      });
    }
  }
}
