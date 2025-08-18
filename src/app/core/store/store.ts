import { Injectable, signal } from '@angular/core';
import { TaskResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class Store {
  private taskForWork = signal<TaskResponse[]>([]);
  private oneTaskForWork = signal<TaskResponse | null>(null);

  getTaskForWork() {
    return this.taskForWork();
  }

  setTaskForWork(task: TaskResponse[]) {
    this.taskForWork.set(task);
  }

  getOneTaskForWork() {
    return this.oneTaskForWork();
  }

  setOneTaskForWork(task: TaskResponse) {
    this.oneTaskForWork.set(task);
  }
}
