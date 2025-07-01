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
  // todo: string[] = [];

  // today: string[] = [];

  // done: string[] = [];

  // Variables para manejar la entrada de nuevas tareas (solo para Pendiente)
  newTodoTask = '';
  showTodoInput = false;

  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);

  resourcesTasks = rxResource<TaskResponse[], { user_id: string }>({
    stream: ({ params }) => this.taskService.getTasks(params.user_id),
    params: () => ({
      user_id: '1',
    }),
    defaultValue: [],
  });

  todo = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks.filter((task) => task.statusTask.status_task_id === 1);
  });

  today = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks.filter((task) => task.statusTask.status_task_id === 2);
  });

  done = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks.filter((task) => task.statusTask.status_task_id === 3);
  });

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      debugger;
      // Obtener la tarea movida
      const movedTask = event.container.data[event.currentIndex];
      console.log(movedTask);
      console.log(event.container.id);

      // Determinar el nuevo estado según la lista destino
      let newStatus = 1; // Por defecto "todo"
      if (
        event.container.id &&
        event.container.id.includes('cdk-drop-list-1')
      ) {
        newStatus = 2;
      } else if (
        event.container.id &&
        event.container.id.includes('cdk-drop-list-2')
      ) {
        newStatus = 3;
      }

      // Llamar al servicio para actualizar el estado de la tarea
      this.taskService
        .updateTask(movedTask.task_id, {
          title: movedTask.title,
          status_task_id: newStatus,
          user_id: 1,
        })
        .subscribe({
          next: () => this.resourcesTasks.reload(),
          error: (err) => console.log(err),
        });
    }
  }

  addTodoTask() {
    if (this.newTodoTask.trim()) {
      this.taskService
        .createTask({
          title: this.newTodoTask.trim(),
          status_task_id: 1,
          user_id: 1,
        })
        .subscribe({
          next: (res) => {
            console.log(res);
            this.resourcesTasks.reload();
          },
          error: (err) => {
            console.log(err);
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

  // Método para navegar a la pantalla de iniciar tareas
  iniciarTareas() {
    if (this.today.length > 0) {
      // Aquí puedes cambiar la ruta según tu estructura de navegación
      this.router.navigate(['/private/work']);
      // O si prefieres usar una ruta específica:
      // this.router.navigate(['/tareas/nueva']);
    }
  }
}
