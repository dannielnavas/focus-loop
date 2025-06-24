import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import TimerPomodoro, { TimerState } from 'timer-for-pomodoro';

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
  selector: 'app-timer',
  imports: [RouterLink],
  templateUrl: './timer.html',
  styleUrl: './timer.css',
})
export default class Timer implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  timer = new TimerPomodoro(1, 1, 999);
  timerState = signal<TimerState | undefined>(undefined);
  task = signal<string>('Tarea 1');
  totalTime = signal<number>(0);
  status = signal<boolean>(false);

  ngOnInit() {
    console.log('Timer iniciado', this.timer);
    // Hacer la ventana flotante cuando se carga el componente timer
    this.makeWindowFloating();
  }

  ngOnDestroy() {
    // Restaurar el estado normal de la ventana cuando se sale del componente
    this.resetWindowFloating();
  }

  private async makeWindowFloating() {
    if (window.electronAPI) {
      try {
        // Hacer la ventana flotante con dimensiones 373x90
        await window.electronAPI.makeWindowFloating(373, 120);
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
      if (this.timerState()?.status === 'finished') {
        this.timer.next();
        console.log('Estado:', this.timerState());
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
    this.router.navigate(['/private/work']);
  }

  backToWork() {
    this.router.navigate(['/private/work']);
  }
}
