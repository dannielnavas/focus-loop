import { TaskResponse } from '@/core/models/task.model';
import { Task as TaskService } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { Header } from '@/shared/components/header/header';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-board',
  imports: [CdkDropList, CdkDrag, FormsModule, Header],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export default class Board {
  newTodoTask = '';
  showTodoInput = false;
  user_id = computed(() => localStorage.getItem('user_id'));
  sprint_id = input<string>();

  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(Store);

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

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.updatePositions(
        event.container.data,
        this.getStatusFromContainerId(event.container.id)
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      const movedTask = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromContainerId(event.container.id);
      this.updateTaskStatus(movedTask, newStatus);
      this.updatePositions(event.container.data, newStatus);
      this.updatePositions(
        event.previousContainer.data,
        this.getStatusFromContainerId(event.previousContainer.id)
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
    this.taskService
      .updateTask(task.task_id, {
        title: task.title,
        status_task_id: newStatus,
      })
      .subscribe({
        next: () => this.resourcesTasks.reload(),
        error: (err) => console.error(err),
      });
  }

  updatePositions(tasks: any[], status_task_id: number) {
    tasks.forEach((task, index) => {
      this.taskService
        .updateTask(task.task_id, {
          position: index + 1,
          status_task_id,
        })
        .subscribe({
          error: (err) => console.error(err),
        });
    });
  }

  getStatusFromContainerId(containerId: string): number {
    if (containerId && containerId.includes('cdk-drop-list-1')) {
      return 2; // Hoy
    } else if (containerId && containerId.includes('cdk-drop-list-2')) {
      return 3; // Completado
    }
    return 1; // Pendiente
  }

  addTodoTask() {
    if (this.newTodoTask.trim()) {
      this.taskService
        .createTask({
          title: this.newTodoTask.trim(),
          status_task_id: 1,
          sprint_id: Number(this.sprint_id()),
          position: this.todo().length + 1,
        })
        .subscribe({
          next: () => this.resourcesTasks.reload(),
          error: (err) => console.error(err),
        });
      this.newTodoTask = '';
      this.showTodoInput = false;
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

  iniciarTareas() {
    if (this.today().length > 0) {
      this.store.setTaskForWork(this.today());
      this.router.navigate(['/private/work']);
    }
  }
}
