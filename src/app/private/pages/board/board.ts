import { TaskResponse } from '@/core/models/task.model';
import { NotificationService } from '@/core/services/notification.service';
import { OptimisticUIService } from '@/core/services/optimistic-ui';
import { PlanService } from '@/core/services/plan.service';
import { Sprints } from '@/core/services/sprints';
import { StorageService } from '@/core/services/storage.service';
import { Task as TaskService } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { Header } from '@/shared/components/header/header';
import { NotificationsComponent } from '@/shared/components/notifications/notifications';
import { OptimisticStatusComponent } from '@/shared/components/optimistic-status/optimistic-status';
import { UiButtonComponent } from '@/shared/components/ui';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, input, OnDestroy, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { formatISO } from 'date-fns';
import { take } from 'rxjs';

@Component({
  selector: 'app-board',
  imports: [
    CdkDropList,
    CdkDrag,
    FormsModule,
    Header,
    OptimisticStatusComponent,
    NotificationsComponent,
    UiButtonComponent,
  ],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export default class Board implements OnInit, OnDestroy {
  newTodoTask = '';
  showTodoInput = false;
  user_id = computed(() => this.storage.getUserId());
  sprint_id = input<string>();

  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(Store);
  private readonly storage = inject(StorageService);
  private readonly optimisticUI = inject(OptimisticUIService);
  private readonly planService = inject(PlanService);
  private readonly sprintService = inject(Sprints);
  private readonly notificationService = inject(NotificationService);

  resourcesTasks = rxResource<TaskResponse[], { user_id: number }>({
    stream: ({ params }) => this.taskService.getTasks(Number(this.sprint_id())),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
      sprint_id: this.sprint_id(),
    }),
    defaultValue: [],
  });

  todo = computed(() => this.filterAndSortTasks(1));
  today = computed(() => this.filterAndSortTasks(2));
  done = computed(() => this.filterAndSortTasks(3, true));

  /** Nombre del sprint para el encabezado (si está en el store). */
  readonly sprintHeading = computed(() => {
    const rawId = this.sprint_id();
    const id = Number(rawId);
    if (!Number.isFinite(id)) return 'Tablero';
    const sprint = this.store
      .getSprints()()
      .find((s) => s.sprint_id === id);
    const name = sprint?.name?.trim();
    return name || `Sprint ${id}`;
  });

  ngOnInit() {
    this.store.setSprintId(Number(this.sprint_id()));
    this.setBoardWindowLayout();
  }

  ngOnDestroy() {
    this.resetWindowLayout();
  }

  private async setBoardWindowLayout() {
    if (!window.desktopAPI) return;

    try {
      const aw = window.screen.availWidth || window.screen.width;
      const ah = window.screen.availHeight || window.screen.height;
      /** Tablero: ventana moderada, no pantalla completa; el IPC ya centra tras resize. */
      const targetWidth = Math.max(960, Math.min(1120, Math.floor(aw * 0.68)));
      const targetHeight = Math.max(600, Math.min(760, Math.floor(ah * 0.78)));
      await window.desktopAPI.resizeWindow(targetWidth, targetHeight);
    } catch (error) {
      console.error('Error configuring board window:', error);
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

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updatePositions(
        event.container.data,
        this.getStatusFromContainer(event.container)
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const movedTask = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainer(event.container);
      this.updateTaskStatus(movedTask, newStatus);
      this.updatePositions(event.container.data, newStatus);
      this.updatePositions(
        event.previousContainer.data,
        this.getStatusFromContainer(event.previousContainer)
      );
    }
  }

  private filterAndSortTasks(status: number, isDone: boolean = false) {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    let filtered = tasks.filter(
      (task) => task.statusTask.status_task_id === status
    );
    if (isDone) {
      filtered = filtered.sort((a, b) => {
        const updatedDiff =
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        if (updatedDiff !== 0) return updatedDiff;
        return a.position - b.position;
      });
    } else {
      filtered = filtered.sort((a, b) => a.position - b.position);
    }
    return filtered;
  }

  private updateTaskStatus(task: any, newStatus: number) {
    // Actualizar inmediatamente en el store optimista
    this.store.updateOptimisticTask(task.task_id, {
      statusTask: { ...task.statusTask, status_task_id: newStatus },
      date_end: newStatus === 3 ? formatISO(new Date()) : null,
      updated_at: new Date().toISOString(),
    });

    // Ejecutar actualización real
    this.taskService
      .updateTaskOptimistic(
        task.task_id,
        {
          title: task.title,
          status_task_id: newStatus,
          date_end: newStatus === 3 ? formatISO(new Date()) : undefined,
        },
        task
      )
      .subscribe({
        next: () => {
          // Actualizar el store real y recargar
          this.store.setTasks(this.resourcesTasks.value() || []);
          this.resourcesTasks.reload();
        },
        error: (err) => {
          console.error('Error updating task:', err);
          // Rollback: restaurar estado original
          this.store.updateOptimisticTask(task.task_id, {
            statusTask: task.statusTask,
            date_end: task.date_end,
            updated_at: task.updated_at,
          });
        },
      });
  }

  updatePositions(tasks: any[], status_task_id: number) {
    tasks.forEach((task, index) => {
      this.taskService
        .updateTask(task.task_id, {
          position: index + 1,
        })
        .subscribe({
          error: (err) => console.error(err),
        });
    });
  }

  getStatusFromContainer(container: any): number {
    // Comparar directamente con los datos de cada columna
    if (container.data === this.today()) {
      return 2; // Today
    } else if (container.data === this.done()) {
      return 3; // Completed
    } else if (container.data === this.todo()) {
      return 1; // Pending
    }

    // Fallback: intentar determinar por el contenido de los datos
    if (container.data && container.data.length > 0) {
      const firstTask = container.data[0];
      if (firstTask && firstTask.statusTask) {
        return firstTask.statusTask.status_task_id;
      }
    }

    // If cannot be determined, return pending as default value
    return 1;
  }

  addTodoTask() {
    if (!this.newTodoTask.trim()) return;

    const doCreate = () => {
      const newTask = {
        title: this.newTodoTask.trim(),
        status_task_id: 1,
        sprint_id: Number(this.sprint_id()),
        position: this.todo().length + 1,
      };

      const optimisticTask: TaskResponse = {
        task_id: -Date.now(),
        title: newTask.title,
        position: newTask.position,
        date_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        statusTask: {
          status_task_id: 1,
          name: 'Pending',
          created_at: '',
          updated_at: '',
        },
        description: null,
      };

      this.store.addOptimisticTask(optimisticTask);

      this.taskService.createTaskOptimistic(newTask).subscribe({
        next: () => {
          this.store.removeOptimisticTask(optimisticTask.task_id);
          this.resourcesTasks.reload();
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.store.removeOptimisticTask(optimisticTask.task_id);
        },
      });

      this.newTodoTask = '';
      this.showTodoInput = false;
    };

    if (this.planService.isFreePlan()) {
      this.sprintService
        .getSprints(Number(this.user_id()) || 0)
        .pipe(take(1))
        .subscribe({
          next: (sprints) => {
            const total = sprints.reduce(
              (sum, s) =>
                sum +
                s.countTaskPending +
                s.countTaskInProgress +
                s.countTaskCompleted,
              0
            );
            if (total >= this.planService.getTaskLimit()) {
              this.notificationService.warning(
                'Task limit reached',
                'You have reached the limit of 30 tasks on the Free plan. Upgrade to Monthly or Lifetime for unlimited tasks.'
              );
              return;
            }
            doCreate();
          },
          error: () => {
            this.notificationService.error(
              'Could not verify plan limits',
              'Please try again.'
            );
          },
        });
    } else {
      doCreate();
    }
  }

  cancelInput() {
    this.newTodoTask = '';
    this.showTodoInput = false;
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodoTask();
    } else if (event.key === 'Escape') {
      this.cancelInput();
    }
  }

  startTasks() {
    if (this.today().length > 0) {
      this.store.setTaskForWork(this.today());
      this.store.setOneTaskForWork(this.today()[0]);
      this.router.navigate(['/private/timer']);
    }
  }
}
