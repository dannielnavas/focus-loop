import { Sprints } from '@/core/services/sprints';
import { Store } from '@/core/store/store';
import { Location } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  NgZone,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  countTasks = input(0);

  showDaily = signal(false);
  dailyContent = signal('');
  showMenu = signal(false);

  user_id = computed(() => localStorage.getItem('user_id'));
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sprintService = inject(Sprints);
  private readonly ngZone = inject(NgZone);
  private readonly store = inject(Store);

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
    console.log('generateDailyAi');
    console.log(this.store.getSprints());
    const activeSprint = this.store.getSprints();
    // .filter((sprint) => sprint.status === 'active')[0];
    const idSprintActive = activeSprint().find(
      (sprint) => sprint.status === 'active'
    )?.sprint_id;
    console.log(idSprintActive);
    if (!idSprintActive) {
      alert('There is no active sprint to generate the daily report');
      return;
    }

    console.log(idSprintActive);

    this.sprintService.generateDaily(idSprintActive).subscribe({
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
