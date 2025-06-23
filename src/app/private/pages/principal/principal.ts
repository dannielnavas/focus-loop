import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-principal',
  imports: [CdkDropList, CdkDrag, FormsModule],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export default class Principal {
  todo: string[] = [];

  today: string[] = [];

  done: string[] = [];

  // Variables para manejar la entrada de nuevas tareas (solo para Pendiente)
  newTodoTask = '';
  showTodoInput = false;

  constructor(private router: Router) {}

  drop(event: CdkDragDrop<string[]>) {
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
    }
  }

  // Método para agregar tarea a Pendiente
  addTodoTask() {
    if (this.newTodoTask.trim()) {
      this.todo.unshift(this.newTodoTask.trim());
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
    // Aquí puedes cambiar la ruta según tu estructura de navegación
    this.router.navigate(['/iniciar-tareas']);
    // O si prefieres usar una ruta específica:
    // this.router.navigate(['/tareas/nueva']);
  }
}
