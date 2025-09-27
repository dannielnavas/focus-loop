import { Sprints } from '@/core/services/sprints';
import { StorageService } from '@/core/services/storage.service';
import { Store } from '@/core/store/store';
import { Location } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  NgZone,
  OnDestroy,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnDestroy {
  countTasks = input(0);

  showDaily = signal(false);
  dailyContent = signal('');
  showMenu = signal(false);
  isLoadingDaily = signal(false);

  user_id = computed(() => this.storage.getUserId());
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly sprintService = inject(Sprints);
  private readonly ngZone = inject(NgZone);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);

  // Variable estática para controlar si ya se registraron los listeners
  private static listenersRegistered = false;
  // Referencia estática a la instancia actual para manejar los callbacks
  private static currentInstance: Header | null = null;

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
    this.storage.clearUserData();

    // Navigate to login
    this.router.navigate(['/']);
  }

  closeDaily() {
    this.showDaily.set(false);
    this.dailyContent.set('');
    this.isLoadingDaily.set(false);
  }

  generateDailyAi() {
    console.log('generateDailyAi');
    console.log(this.store.getSprints());
    const activeSprint = this.store.getSprints();
    // .filter((sprint) => sprint.status === 'active')[0];
    const idSprintActive = activeSprint().find(
      (sprint) => sprint.status === 'active'
    )?.sprint_id;
    if (!idSprintActive) {
      alert('There is no active sprint to generate the daily report');
      return;
    }

    // Mostrar el modal y activar el loading
    this.showDaily.set(true);
    this.isLoadingDaily.set(true);
    this.dailyContent.set('');

    this.sprintService.generateDaily(idSprintActive).subscribe({
      next: (res) => {
        this.dailyContent.set(res.content);
        this.isLoadingDaily.set(false);
      },
      error: (err) => {
        this.isLoadingDaily.set(false);
        this.showDaily.set(false);
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
    // Solo registrar los listeners una vez para evitar duplicaciones
    if (window.electronAPI && !Header.listenersRegistered) {
      window.electronAPI.onMenuGenerateDaily(() => {
        if (Header.currentInstance) {
          Header.currentInstance.ngZone.run(() =>
            Header.currentInstance!.generateDailyAi()
          );
        }
      });
      window.electronAPI.onMenuProfile(() => {
        if (Header.currentInstance) {
          Header.currentInstance.ngZone.run(() =>
            Header.currentInstance!.goToProfile()
          );
        }
      });
      window.electronAPI.onMenuLogout(() => {
        if (Header.currentInstance) {
          Header.currentInstance.ngZone.run(() =>
            Header.currentInstance!.logout()
          );
        }
      });
      window.electronAPI.onMenuAbout(() => {
        if (Header.currentInstance) {
          Header.currentInstance.ngZone.run(() => alert('FocusLoop'));
        }
      });

      // Marcar que los listeners ya se registraron
      Header.listenersRegistered = true;
    }

    // Establecer esta instancia como la actual
    Header.currentInstance = this;
  }

  ngOnDestroy() {
    // Limpiar la referencia estática si esta es la instancia actual
    if (Header.currentInstance === this) {
      Header.currentInstance = null;
    }
  }
}
