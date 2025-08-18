import { SprintResponse } from '@/core/models/sprint.model';
import { Sprints } from '@/core/services/sprints';
import { Task } from '@/core/services/task';
import { Header } from '@/shared/components/header/header';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  imports: [FormsModule, Header],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export default class Principal {
  showCreateForm = signal(false);
  newSprint = signal({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planned' as const,
  });

  user_id = computed(() => localStorage.getItem('user_id'));
  private readonly sprintService = inject(Sprints);
  private readonly router = inject(Router);
  private readonly taskService = inject(Task);

  resourcesSprints = rxResource<SprintResponse[], { user_id: number }>({
    stream: ({ params }) => this.sprintService.getSprints(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  createSprint() {
    const sprintData = this.newSprint();
    if (!sprintData.name.trim()) {
      alert('El título es obligatorio');
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
      alert('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    this.sprintService
      .createSprint({
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
          alert('Error al crear el sprint. Inténtalo de nuevo.');
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
          alert('Error al actualizar el sprint. Inténtalo de nuevo.');
        },
      });
  }

  deleteSprint(sprintId: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este sprint?')) {
      this.sprintService.deleteSprint(sprintId).subscribe({
        next: () => this.resourcesSprints.reload(),
        error: (err) => {
          console.error('Error deleting sprint:', err);
          alert('Error al eliminar el sprint. Inténtalo de nuevo.');
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

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'planned':
        return 'Planned';
      default:
        return status;
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'bg-green-500 text-green-900';
      case 'completed':
        return 'bg-blue-500 text-blue-900';
      case 'planned':
        return 'bg-yellow-500 text-yellow-900';
      default:
        return 'bg-gray-500 text-gray-900';
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
    // Por ahora retornamos valores de ejemplo
    // En el futuro esto se calcularía basado en las tareas reales del sprint
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
    // Por ahora solo navegamos al board, en el futuro podríamos navegar a una vista específica del sprint
    this.router.navigate(['/private/board', sprint.sprint_id]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
