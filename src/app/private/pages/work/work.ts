import { TaskResponse } from '@/core/models/task.model';
import { Task as TaskService } from '@/core/services/task';
import { Header } from '@/shared/components/header/header';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-work',
  imports: [CdkDropList, CdkDrag, RouterLink, Header],
  templateUrl: './work.html',
  styleUrl: './work.css',
})
export default class Work implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
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
        console.error('Error al configurar la ventana de trabajo:', error);
      }
    }
  }

  private async resetWindowLayout() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.resetWindowSize();
      } catch (error) {
        console.error('Error al restaurar el tamaño de la ventana:', error);
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
      this.today().splice(index, 1);
    }
  }

  marcarComoCompletada(taskId: number) {
    this.taskService
      .updateTask(taskId, {
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
