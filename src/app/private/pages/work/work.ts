import { OptimisticUIService } from '@/core/services/optimistic-ui';
import { Task as TaskService } from '@/core/services/task';
import { Store } from '@/core/store/store';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-work',
  imports: [CdkDropList, CdkDrag, RouterLink],
  templateUrl: './work.html',
  styleUrl: './work.css',
})
export default class Work implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(Store);
  private readonly optimisticUI = inject(OptimisticUIService);

  today = computed(() => {
    const tasks = this.store.getTaskForWork();
    if (!tasks) return [];
    return tasks.filter((task) => task.statusTask.status_task_id === 2);
  });

  sprint_id = computed(() => this.store.getSprintId());

  ngOnInit() {
    this.setWorkWindowLayout();
  }

  ngOnDestroy() {
    this.resetWindowLayout();
  }

  private async setWorkWindowLayout() {
    if (window.electronAPI) {
      try {
        const screenHeight = window.screen.height;
        await window.electronAPI.resizeWindow(440, screenHeight);
        await window.electronAPI.moveWindow(0, 0);
      } catch (error) {
        console.error('Error configuring work window:', error);
      }
    }
  }

  private async resetWindowLayout() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.resetWindowSize();
      } catch (error) {
        console.error('Error restoring window size:', error);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.today(), event.previousIndex, event.currentIndex);
    }
  }

  deleteTask(index: number) {
    if (index >= 0 && index < this.today().length) {
      this.today().splice(index, 1);
    }
  }

  markAsCompleted(taskId: number) {
    const task = this.today().find((t) => t.task_id === taskId);
    if (!task) return;

    // Actualizar inmediatamente en el store optimista
    this.store.updateOptimisticTask(taskId, {
      statusTask: { ...task.statusTask, status_task_id: 3 },
      date_end: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Remover de la lista de trabajo inmediatamente
    this.store.setTaskForWork(
      this.store.getTaskForWork().filter((task) => task.task_id !== taskId)
    );

    // Ejecutar actualización real
    this.taskService
      .updateTaskOptimistic(
        taskId,
        {
          status_task_id: 3,
          date_end: new Date().toISOString(),
        },
        task
      )
      .subscribe({
        next: () => {
          // Éxito: la tarea ya fue removida del store
          console.log('Task marked as completed successfully');
        },
        error: (error) => {
          console.error('Error marking as completed:', error);
          // Rollback: restaurar tarea en la lista de trabajo
          this.store.setTaskForWork([...this.store.getTaskForWork(), task]);
          this.store.updateOptimisticTask(taskId, {
            statusTask: task.statusTask,
            date_end: task.date_end,
            updated_at: task.updated_at,
          });
        },
      });
  }

  startTasks() {
    this.store.setOneTaskForWork(this.today()[0]);
    this.router.navigate(['/private/timer']);
  }
}
