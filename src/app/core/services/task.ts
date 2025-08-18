import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { Task as TaskModel, TaskResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class Task {
  private readonly http = inject(HttpClient);
  private readonly session = computed(() => localStorage.getItem('token'));

  getTasks(sprint_id: string | number) {
    return this.http.get<TaskResponse[]>(
      `http://localhost:3000/tasks?sprint_id=${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  createTask(task: TaskModel) {
    return this.http.post<TaskModel>('http://localhost:3000/tasks', task, {
      headers: {
        Authorization: `Bearer ${this.session()}`,
      },
    });
  }

  updateTask(id: number, task: Partial<TaskModel>) {
    return this.http.patch<TaskModel>(
      `http://localhost:3000/tasks/${id}`,
      task,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  getCountPendingTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `http://localhost:3000/tasks/count-task-pending/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  getCountInProgressTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `http://localhost:3000/tasks/count-task-in-progress/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }

  getCountCompletedTasks(sprint_id: string | number) {
    return this.http.get<number>(
      `http://localhost:3000/tasks/count-task-completed/${sprint_id}`,
      {
        headers: {
          Authorization: `Bearer ${this.session()}`,
        },
      }
    );
  }
}
