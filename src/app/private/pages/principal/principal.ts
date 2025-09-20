import { SprintResponse } from '@/core/models/sprint.model';
import { Sprints } from '@/core/services/sprints';
import { Task } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { Header } from '@/shared/components/header/header';
import { NotificationsComponent } from '@/shared/components/notifications/notifications';
import { OptimisticStatusComponent } from '@/shared/components/optimistic-status/optimistic-status';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
  ],
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
  private readonly store = inject(Store);

  resourcesSprints = rxResource<SprintResponse[], { user_id: number }>({
    stream: ({ params }) => this.sprintService.getSprints(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  constructor() {
    effect(() => {
      this.resourcesSprints.value();
      this.store.setSprints(this.resourcesSprints.value());
    });
  }

  createSprint() {
    const sprintData = this.newSprint();
    if (!sprintData.name.trim()) {
      alert('Title is required');
      return;
    }
    if (!sprintData.start_date) {
      alert('Start date is required');
      return;
    }
    if (!sprintData.end_date) {
      alert('End date is required');
      return;
    }
    if (new Date(sprintData.start_date) >= new Date(sprintData.end_date)) {
      alert('End date must be after start date');
      return;
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
          alert('Error creating sprint. Please try again.');
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
          alert('Error updating sprint. Please try again.');
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
