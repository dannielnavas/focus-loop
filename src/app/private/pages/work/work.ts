import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Declarar la interfaz para el API de Electron
declare global {
  interface Window {
    electronAPI?: {
      resizeWindow: (width: number, height: number) => Promise<boolean>;
      resetWindowSize: () => Promise<boolean>;
      makeWindowFloating: (width: number, height: number) => Promise<boolean>;
      resetWindowFloating: () => Promise<boolean>;
    };
  }
}

@Component({
  selector: 'app-work',
  imports: [CdkDropList, CdkDrag],
  templateUrl: './work.html',
  styleUrl: './work.css',
})
export default class Work implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  today: string[] = ['Tarea 1', 'Tarea 2', 'Tarea 3'];

  ngOnInit() {
    // Redimensionar la ventana cuando se carga el componente work
    this.resizeWindowForWork();
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

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousIndex !== event.currentIndex) {
      moveItemInArray(this.today, event.previousIndex, event.currentIndex);
    }
  }

  eliminarTarea(index: number) {
    if (index >= 0 && index < this.today.length) {
      const tareaEliminada = this.today.splice(index, 1)[0];
    }
  }

  marcarComoCompletada(index: number) {
    if (index >= 0 && index < this.today.length) {
      const tareaCompletada = this.today[index];
      this.eliminarTarea(index);
    }
  }

  iniciarTareas() {
    this.router.navigate(['/private/timer']);
  }
}
