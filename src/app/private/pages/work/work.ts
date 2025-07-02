import { TaskResponse } from '@/core/models/task.model';
import { Task as TaskService } from '@/core/services/task';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

// Declarar la interfaz para el API de Electron
declare global {
  interface Window {
    electronAPI?: {
      resizeWindow: (width: number, height: number) => Promise<boolean>;
      resetWindowSize: () => Promise<boolean>;
      makeWindowFloating: (width: number, height: number) => Promise<boolean>;
      resetWindowFloating: () => Promise<boolean>;
      moveWindow: (x: number, y: number) => Promise<boolean>;
      hideTitlebar: () => Promise<boolean>;
      showTitlebar: () => Promise<boolean>;
      showNotification: (title: string, body: string) => Promise<boolean>;
      hideNotification: () => Promise<boolean>;
    };
  }
}

@Component({
  selector: 'app-work',
  imports: [CdkDropList, CdkDrag, RouterLink],
  templateUrl: './work.html',
  styleUrl: './work.css',
})
export default class Work implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  // today: string[] = ['Tarea 1', 'Tarea 2', 'Tarea 3'];
  user_id = computed(() => localStorage.getItem('user_id'));

  resourcesTasks = rxResource<TaskResponse[], { user_id: number }>({
    stream: ({ params }) => this.taskService.getTasks(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  today = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return [];
    return tasks.filter((task) => task.statusTask.status_task_id === 2);
  });

  constructor() {
    effect(() => {
      const data = this.today();

      // if (filter.length === 0) {
      //   this.router.navigate(['/private']);
      // }
    });
  }

  ngOnInit() {
    // Redimensionar la ventana cuando se carga el componente work
    this.resizeWindowForWork();
    // Mover la ventana a la esquina superior izquierda
    this.moveWindowToLeft();
  }

  ngOnDestroy() {
    // Restaurar el tamaño original de la ventana cuando se sale del componente
    this.resetWindowSize();
  }

  private async resizeWindowForWork() {
    if (window.electronAPI) {
      try {
        // Obtener la altura de la pantalla
        const screenHeight = window.screen.height;
        // Redimensionar a 440px de ancho y altura completa
        await window.electronAPI.resizeWindow(440, screenHeight);
      } catch (error) {
        console.error('Error al redimensionar la ventana:', error);
      }
    }
  }

  private async resetWindowSize() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.resetWindowSize();
      } catch (error) {
        console.error('Error al restaurar el tamaño de la ventana:', error);
      }
    }
  }

  private async moveWindowToLeft() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.moveWindow(0, 0);
      } catch (error) {
        console.error('Error al mover la ventana:', error);
      }
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.today(), event.previousIndex, event.currentIndex);
    }
  }

  eliminarTarea(index: number) {
    if (index >= 0 && index < this.today().length) {
      const tareaEliminada = this.today().splice(index, 1)[0];
    }
  }

  marcarComoCompletada(index: number) {
    this.taskService
      .updateTask(index, {
        status_task_id: 3,
      })
      .subscribe({
        next: () => {
          this.resourcesTasks.reload();
        },
        error: (error) => {
          console.error('Error al marcar como completada:', error);
        },
      });
  }

  iniciarTareas() {
    this.router.navigate(['/private/timer']);
  }
}
