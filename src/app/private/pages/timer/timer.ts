import { Task as TaskService } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { Header } from '@/shared/components/header/header';
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import TimerPomodoro, { TimerState } from 'timer-for-pomodoro';

@Component({
  selector: 'app-timer',
  imports: [Header],
  templateUrl: './timer.html',
  styleUrl: './timer.css',
})
export default class Timer implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(Store);
  private readonly cdr = inject(ChangeDetectorRef);

  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  statusTimer = signal<string>('init');

  task = computed(() => {
    const task = this.store.getOneTaskForWork();
    if (!task) return undefined;
    return task;
  });

  // Optimización: Crear timer solo una vez
  timer = new TimerPomodoro(60, 15, 999);
  timerState = signal<TimerState | undefined>(undefined);
  totalTime = signal<number>(0);
  status = signal<boolean>(false);

  ngOnInit() {
    this.setFloatingWindow();
    this.toggleTitlebarAndMenu(false);
    this.initializeAudio();
  }

  ngOnDestroy() {
    this.resetFloatingWindow();
    this.toggleTitlebarAndMenu(true);
    this.cleanupAudio();
  }

  private async setFloatingWindow() {
    if (!window.electronAPI) return;
    try {
      const { userAgent } = navigator;
      if (userAgent.includes('Windows') || userAgent.includes('Linux')) {
        await window.electronAPI.makeWindowFloating(380, 120);
      } else if (userAgent.includes('Macintosh')) {
        await window.electronAPI.makeWindowFloating(306, 80);
      }
      await window.electronAPI.moveWindow(0, 50);
    } catch (error) {
      console.error('Error al hacer la ventana flotante:', error);
    }
  }

  private async resetFloatingWindow() {
    if (!window.electronAPI) return;
    try {
      await window.electronAPI.resetWindowFloating();
    } catch (error) {
      console.error('Error al restaurar el estado de la ventana:', error);
    }
  }

  private toggleTitlebarAndMenu(show: boolean) {
    if (window.electronAPI) {
      if (show) {
        window.electronAPI.showTitlebar?.();
        window.electronAPI.showMenu?.();
      } else {
        window.electronAPI.hideTitlebar?.();
        window.electronAPI.hideMenu?.();
      }
    } else if ((window as any).electron?.ipcRenderer) {
      (window as any).electron.ipcRenderer.invoke(
        show ? 'show-menu' : 'hide-menu'
      );
    }
  }

  private initializeAudio() {
    try {
      // Crear AudioContext para mejor rendimiento
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext no disponible, usando Audio HTML5:', error);
    }
  }

  private cleanupAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  start() {
    try {
      this.timer.start();
      this.status.set(true);
      this.listenTimer();
    } catch (error) {
      console.error('Error al iniciar el timer:', error);
    }
  }

  pause() {
    try {
      this.timer.pause();
      this.status.set(false);
    } catch (error) {
      console.error('Error al pausar el timer:', error);
    }
  }

  play() {
    try {
      this.timer.start();
      this.status.set(true);
    } catch (error) {
      console.error('Error al reanudar el timer:', error);
    }
  }

  listenTimer() {
    try {
      this.timer.subscribe((timerState) => {
        this.timerState.set(timerState);
        if (this.statusTimer() !== timerState.status) {
          this.statusTimer.set(timerState.status || 'init');
          this.playAudioForStatus(timerState.status);
        }
        if (timerState.status === 'work') {
          this.totalTime.update((current) => current + 1);
        }
        // Optimización: Detectar cambios solo cuando sea necesario
        this.cdr.detectChanges();
      });
    } catch (error) {
      console.error('Error al escuchar el timer:', error);
    }
  }

  private async playAudioForStatus(status: string | undefined) {
    if (!status) return;

    let audioFile = '';
    if (status === 'work') audioFile = 'assets/start.mp3';
    if (status === 'break') audioFile = 'assets/break.mp3';

    if (!audioFile) return;

    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.audioContext) {
        // Usar AudioContext para mejor rendimiento
        const response = await fetch(audioFile);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(
          arrayBuffer
        );

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.audioContext.destination);
        source.start(0);
      } else {
        // Fallback a Audio HTML5
        this.audio = new Audio(audioFile);
        this.audio.volume = 0.5;
        await this.audio.play();
      }
    } catch (error) {
      console.error('Error al reproducir audio:', error);
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  getProgressAngle(): number {
    const state = this.timerState();
    if (!state) return 0;
    const totalSeconds = state.minutes * 60 + state.seconds;
    const workTimeSeconds = state.settings.workTime * 60;
    const progress = (workTimeSeconds - totalSeconds) / workTimeSeconds;
    return Math.max(0, Math.min(360, progress * 360));
  }

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
    try {
      this.timer.stop();
      this.taskService
        .updateTask(this.task()?.task_id || 0, {
          status_task_id: 3,
        })
        .subscribe({
          next: () => {
            this.router.navigate(['/private/work']);
          },
          error: (error) => {
            console.error('Error al actualizar tarea:', error);
          },
        });
    } catch (error) {
      console.error('Error al ir a la siguiente tarea:', error);
    }
  }

  backToWork() {
    try {
      this.timer.stop();
      this.router.navigate(['/private/work']);
    } catch (error) {
      console.error('Error al volver al trabajo:', error);
    }
  }
}
