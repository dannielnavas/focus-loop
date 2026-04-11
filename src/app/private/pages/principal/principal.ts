import { SprintResponse } from '@/core/models/sprint.model';
import { NotificationService } from '@/core/services/notification.service';
import { PlanService } from '@/core/services/plan.service';
import { Sprints } from '@/core/services/sprints';
import { StorageService } from '@/core/services/storage.service';
import { Task } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { Header } from '@/shared/components/header/header';
import { NotificationsComponent } from '@/shared/components/notifications/notifications';
import { OptimisticStatusComponent } from '@/shared/components/optimistic-status/optimistic-status';
import {
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiSkeletonComponent,
} from '@/shared/components/ui';
import type { BadgeVariant } from '@/shared/components/ui';
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  imports: [
    FormsModule,
    Header,
    OptimisticStatusComponent,
    NotificationsComponent,
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
    UiSkeletonComponent,
  ],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export default class Principal implements OnInit, OnDestroy {
  showCreateForm = signal(false);
  newSprint = signal({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planned' as const,
  });

  user_id = computed(() => this.storage.getUserId());
  private readonly sprintService = inject(Sprints);
  private readonly router = inject(Router);
  private readonly taskService = inject(Task);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);
  private readonly planService = inject(PlanService);
  private readonly notificationService = inject(NotificationService);

  resourcesSprints = rxResource<SprintResponse[], { user_id: number }>({
    stream: ({ params }) => this.sprintService.getSprints(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  // Computed para saber si está cargando
  isLoadingSprints = computed(() => this.resourcesSprints.isLoading());

  constructor() {
    effect(() => {
      this.resourcesSprints.value();
      this.store.setSprints(this.resourcesSprints.value());
    });
  }

  ngOnInit() {
    this.setPrincipalWindowLayout();
  }

  ngOnDestroy() {
    this.resetWindowLayout();
  }

  private async setPrincipalWindowLayout() {
    if (!window.desktopAPI) return;
    try {
      const aw = window.screen.availWidth || window.screen.width;
      const ah = window.screen.availHeight || window.screen.height;
      /** Ventana amplia para que varias tarjetas de sprint no queden comprimidas. */
      const targetWidth = Math.max(1080, Math.min(1360, Math.floor(aw * 0.78)));
      const targetHeight = Math.max(680, Math.min(900, Math.floor(ah * 0.86)));
      await window.desktopAPI.resizeWindow(targetWidth, targetHeight);
    } catch (error) {
      console.error('Error configuring principal window:', error);
    }
  }

  private async resetWindowLayout() {
    if (!window.desktopAPI) return;
    try {
      await window.desktopAPI.resetWindowSize();
    } catch (error) {
      console.error('Error restoring window size:', error);
    }
  }

  createSprint() {
    const sprintData = this.newSprint();
    if (!sprintData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }
    if (!sprintData.start_date) {
      alert('La fecha de inicio es obligatoria');
      return;
    }
    if (!sprintData.end_date) {
      alert('La fecha de fin es obligatoria');
      return;
    }
    if (new Date(sprintData.start_date) >= new Date(sprintData.end_date)) {
      alert('La fecha de fin debe ser posterior a la de inicio');
      return;
    }

    if (this.planService.isFreePlan()) {
      const sprints = this.store.getCombinedSprints();
      if (sprints.length >= this.planService.getSprintLimit()) {
        this.notificationService.warning(
          'Sprint limit reached',
          'You have reached the limit of 2 sprints on the Free plan. Upgrade to Monthly or Lifetime for unlimited sprints.'
        );
        return;
      }
    }

    // Crear sprint optimista
    this.sprintService
      .createSprintOptimistic({
        ...sprintData,
        user_id: Number(this.user_id()) || 0,
      })
      .subscribe({
        next: () => {
          this.resourcesSprints.reload();
          this.resetForm();
        },
        error: (err) => {
          console.error('Error creating sprint:', err);
          alert('No se pudo crear el sprint. Inténtalo de nuevo.');
        },
      });
  }

  updateSprintStatus(
    sprint: SprintResponse,
    newStatus: 'active' | 'completed' | 'planned'
  ) {
    this.sprintService
      .updateSprint(sprint.sprint_id, {
        status: newStatus,
        user_id: Number(this.user_id()),
      })
      .subscribe({
        next: () => this.resourcesSprints.reload(),
        error: (err) => {
          console.error('Error updating sprint:', err);
          alert('No se pudo actualizar el sprint. Inténtalo de nuevo.');
        },
      });
  }

  deleteSprint(sprintId: number) {
    if (confirm('Are you sure you want to delete this sprint?')) {
      this.sprintService.deleteSprint(sprintId).subscribe({
        next: () => this.resourcesSprints.reload(),
        error: (err) => {
          console.error('Error deleting sprint:', err);
          alert('Error deleting sprint. Please try again.');
        },
      });
    }
  }

  resetForm() {
    this.newSprint.set({
      name: '',
      description: '',
      start_date: '',
      end_date: '',
      status: 'planned',
    });
    this.showCreateForm.set(false);
  }

  /** Tarjeta «Añadir sprint»: clic o teclado (accesibilidad). */
  openCreateSprintForm(event?: Event) {
    event?.preventDefault();
    this.showCreateForm.set(true);
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'planned':
        return 'Planificado';
      default:
        return status;
    }
  }

  getStatusBadgeVariant(status: string): BadgeVariant {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'neutral';
      case 'planned':
        return 'warning';
      default:
        return 'neutral';
    }
  }

  getProgressPercentage(sprint: SprintResponse): number {
    const totalTasks =
      sprint.countTaskPending +
      sprint.countTaskInProgress +
      sprint.countTaskCompleted;
    const completedTasks = sprint.countTaskCompleted;
    if (totalTasks === 0) return 0;
    const progressPercentage = (completedTasks / totalTasks) * 100;
    return Math.round(progressPercentage);
  }

  getProgressBarClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'planned':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }

  getTaskCount(sprint: SprintResponse, taskStatus: string): void {
    // For now we return example values
    // In the future this would be calculated based on real sprint tasks
    // if (taskStatus === 'pending') {
    //   this.taskService.getCountPendingTasks(sprint.sprint_id).subscribe({
    //     next: (res) => {
    //       console.log(res);
    //     },
    //   });
    // }
    // if (taskStatus === 'in_progress') {
    //   this.taskService.getCountInProgressTasks(sprint.sprint_id).subscribe({
    //     next: (res) => {
    //       console.log(res);
    //     },
    //   });
    // }
    // if (taskStatus === 'completed') {
    //   this.taskService.getCountCompletedTasks(sprint.sprint_id).subscribe({
    //     next: (res) => {
    //       console.log(res);
    //     },
    //   });
    // }
  }

  viewSprintDetails(sprint: SprintResponse) {
    // For now we only navigate to the board, in the future we could navigate to a specific sprint view
    this.router.navigate(['/private/board', sprint.sprint_id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
