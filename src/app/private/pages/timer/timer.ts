import { TaskResponse } from '@/core/models/task.model';
import { Task as TaskService } from '@/core/services/task';
import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import TimerPomodoro, { TimerState } from 'timer-for-pomodoro';

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
      hideMenu: () => Promise<boolean>;
      showMenu: () => Promise<boolean>;
    };
  }
}

@Component({
  selector: 'app-timer',
  imports: [],
  templateUrl: './timer.html',
  styleUrl: './timer.css',
})
export default class Timer implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private audio: HTMLAudioElement | null = null;
  statusTimer = signal<string>('init');
  user_id = computed(() => localStorage.getItem('user_id'));

  resourcesTasks = rxResource<TaskResponse[], { user_id: number }>({
    stream: ({ params }) => this.taskService.getTasks(params.user_id),
    params: () => ({
      user_id: Number(this.user_id()) || 0,
    }),
    defaultValue: [],
  });

  task = computed(() => {
    const tasks = this.resourcesTasks.value();
    if (!tasks) return undefined;
    return tasks.filter((task) => task.statusTask.status_task_id === 2)[0];
  });
  timer = new TimerPomodoro(60, 15, 999);
  timerState = signal<TimerState | undefined>(undefined);
  // task = signal<string>('Tarea 1');
  totalTime = signal<number>(0);
  status = signal<boolean>(false);

  ngOnInit() {
    // Hacer la ventana flotante cuando se carga el componente timer
    this.makeWindowFloating();
    // Ocultar barra de botones (solo macOS)
    if (window.electronAPI?.hideTitlebar) {
      window.electronAPI.hideTitlebar();
    }
    // Ocultar menú de Electron
    if (window.electronAPI?.hideMenu) {
      window.electronAPI.hideMenu();
    } else if ((window as any).electron?.ipcRenderer) {
      (window as any).electron.ipcRenderer.invoke('hide-menu');
    }
  }

  ngOnDestroy() {
    // Restaurar el estado normal de la ventana cuando se sale del componente
    this.resetWindowFloating();
    // Restaurar barra de botones (solo macOS)
    if (window.electronAPI?.showTitlebar) {
      window.electronAPI.showTitlebar();
    }
    // Restaurar menú de Electron
    if (window.electronAPI?.showMenu) {
      window.electronAPI.showMenu();
    } else if ((window as any).electron?.ipcRenderer) {
      (window as any).electron.ipcRenderer.invoke('show-menu');
    }
  }

  private async makeWindowFloating() {
    if (window.electronAPI) {
      try {
        // Hacer la ventana flotante con dimensiones 373x90
        await window.electronAPI.makeWindowFloating(280, 120);
      } catch (error) {
        console.error('Error al hacer la ventana flotante:', error);
      }
    }
  }

  private async resetWindowFloating() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.resetWindowFloating();
      } catch (error) {
        console.error('Error al restaurar el estado de la ventana:', error);
      }
    }
  }

  start() {
    this.timer.start();
    this.status.set(true);
    this.listenTimer();
  }

  pause() {
    this.timer.pause();
    this.status.set(false);
  }
  play() {
    this.timer.start();
    this.status.set(true);
  }

  listenTimer() {
    this.timer.subscribe((timerState) => {
      this.timerState.set(timerState);
      console.log(this.timerState()?.status);
      if (this.statusTimer() !== this.timerState()?.status) {
        this.statusTimer.set(this.timerState()?.status || 'init');
        this.audio = new Audio('assets/notification.mp3');
        this.audio.volume = 0.5;
        this.audio.play();
      }

      // Actualizar tiempo total
      if (timerState.status === 'work') {
        this.totalTime.update((current) => current + 1);
      }
    });
  }

  // Formatear tiempo en formato MM:SS
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  // Calcular ángulo de progreso para el círculo
  getProgressAngle(): number {
    const state = this.timerState();
    if (!state) {
      return 0;
    }
    // Usar timeRaw para calcular el progreso
    const totalSeconds = state.minutes * 60 + state.seconds;
    const workTimeSeconds = state.settings.workTime * 60;
    const progress = (workTimeSeconds - totalSeconds) / workTimeSeconds;
    return Math.max(0, Math.min(360, progress * 360));
  }

  // Formatear tiempo total trabajado
  formatTotalTime(): string {
    const totalMinutes = Math.floor(this.totalTime() / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (totalHours > 0) {
      return `${totalHours}h ${remainingMinutes}m`;
    }
    return `${totalMinutes}m`;
  }

  goToNextTask() {
    this.timer.stop();
    this.taskService
      .updateTask(this.task()?.task_id || 0, {
        status_task_id: 3,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/private/work']);
        },
      });
  }

  backToWork() {
    this.timer.stop();
    this.router.navigate(['/private/work']);
  }
}
