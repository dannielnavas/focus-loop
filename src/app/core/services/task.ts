import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task as TaskModel, TaskResponse } from '../models/task.model';
import { OptimisticUIService } from './optimistic-ui';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class Task {
  private readonly http = inject(HttpClient);
  private readonly optimisticUI = inject(OptimisticUIService);
  private readonly storage = inject(StorageService);

  private readonly session = computed(() => this.storage.getToken());

  getTasks(sprint_id: string | number) {
    return this.http.get<TaskResponse[]>(
      `https://my-tracker-backend-pied.vercel.app/tasks?sprint_id=${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  createTask(task: TaskModel) {
    return this.http.post<TaskModel>(
      'https://my-tracker-backend-pied.vercel.app/tasks',
      task,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  /**
   * Crea una tarea de manera optimista
   */
  createTaskOptimistic(task: TaskModel): Observable<TaskModel> {
    const operationId = this.optimisticUI.generateOperationId('create_task');

    // Crear tarea temporal con ID temporal
    const optimisticTask: TaskModel = {
      ...task,
      task_id: -Date.now(), // ID temporal negativo
    };

    return this.optimisticUI.createOptimistic(
      operationId,
      optimisticTask,
      this.createTask(task)
    );
  }

  updateTask(id: number, task: Partial<TaskModel>) {
    return this.http.patch<TaskModel>(
      `https://my-tracker-backend-pied.vercel.app/tasks/${id}`,
      task,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  /**
   * Actualiza una tarea de manera optimista
   */
  updateTaskOptimistic(
    id: number,
    task: Partial<TaskModel>,
    originalTask?: TaskResponse
  ): Observable<any> {
    const operationId = this.optimisticUI.generateOperationId(
      `update_task_${id}`
    );

    // Crear datos optimistas
    const optimisticData = originalTask
      ? {
          ...originalTask,
          ...task,
          updated_at: new Date().toISOString(),
        }
      : task;

    return this.optimisticUI.executeOptimistic(
      operationId,
      optimisticData,
      this.updateTask(id, task),
      originalTask
    );
  }

  getCountPendingTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `https://my-tracker-backend-pied.vercel.app/tasks/count-task-pending/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  getCountInProgressTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `https://my-tracker-backend-pied.vercel.app/tasks/count-task-in-progress/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  getCountCompletedTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `https://my-tracker-backend-pied.vercel.app/tasks/count-task-completed/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }
}
