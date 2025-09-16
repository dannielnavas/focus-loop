import { SprintResponse } from '@/core/models/sprint.model';
import { Sprints } from '@/core/services/sprints';
import { Location } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
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
    // Limpiar datos de sesión
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_data');
    localStorage.removeItem('token');

    // Navegar al login
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
      alert('No hay un sprint activo para generar el reporte diario');
      return;
    }

    this.sprintService.generateDaily(activeSprint.sprint_id).subscribe({
      next: (res) => {
        console.log(res);
        this.dailyContent.set(res.content);
        this.showDaily.set(true);
      },
      error: (err) => {
        console.error('Error generating daily report:', err);
        alert('Error al generar el reporte diario. Inténtalo de nuevo.');
      },
    });
  }

  goToBack() {
    this.location.back();
  }
}
