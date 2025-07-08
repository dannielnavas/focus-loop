import { TaskResponse } from '@/core/models/task.model';
import { Task as TaskService } from '@/core/services/task';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  imports: [CdkDropList, CdkDrag, FormsModule],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export default class Principal {
  newTodoTask = '';
  showTodoInput = false;
  user_id = computed(() => localStorage.getItem('user_id'));

  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  resourcesTasks = rxResource<TaskResponse[], { user_id: number }>({
    stream: ({ params }) => this.taskService.getTasks(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  todo = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks
      .filter((task) => task.statusTask.status_task_id === 1)
      .sort((a, b) => a.position - b.position);
  });

  today = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks
      .filter((task) => task.statusTask.status_task_id === 2)
      .sort((a, b) => a.position - b.position);
  });

  done = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks
      .filter((task) => task.statusTask.status_task_id === 3)
      .sort((a, b) => a.position - b.position);
  });

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      // Actualizar el orden en la columna actual
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

      // Obtener la tarea movida
      const movedTask = event.container.data[event.currentIndex];

      // Determinar el nuevo estado según la lista destino
      const newStatus = this.getStatusFromContainerId(event.container.id);

      // Llamar al servicio para actualizar el estado de la tarea movida
      this.taskService
        .updateTask(movedTask.task_id, {
          title: movedTask.title,
          status_task_id: newStatus,
          user_id: Number(this.user_id()),
        })
        .subscribe({
          next: () => this.resourcesTasks.reload(),
          error: (err) => console.error(err),
        });

      // Actualizar el orden en ambas columnas
      this.updatePositions(event.container.data, newStatus);
      this.updatePositions(
        event.previousContainer.data,
        this.getStatusFromContainerId(event.previousContainer.id)
      );
    }
  }

  // Nuevo método para actualizar el campo position de todas las tareas de una columna
  updatePositions(tasks: any[], status_task_id: number) {
    tasks.forEach((task, index) => {
      this.taskService
        .updateTask(task.task_id, {
          position: index + 1,
          status_task_id,
          user_id: Number(this.user_id()),
        })
        .subscribe({
          error: (err) => console.error(err),
        });
    });
  }

  // Nuevo método para obtener el status_task_id según el id del contenedor
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
          user_id: Number(this.user_id()),
        })
        .subscribe({
          next: (res) => {
            this.resourcesTasks.reload();
          },
          error: (err) => {
            console.error(err);
          },
        });
      this.newTodoTask = '';
      this.showTodoInput = false;
    }
  }

  // Método para cancelar la entrada
  cancelInput() {
    this.newTodoTask = '';
    this.showTodoInput = false;
  }

  // Método para manejar la tecla Enter
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.addTodoTask();
    } else if (event.key === 'Escape') {
      this.cancelInput();
    }
  }

  iniciarTareas() {
    if (this.today().length > 0) {
      this.router.navigate(['/private/work']);
    }
  }
}
