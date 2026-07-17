import { SpotifyNowPlayingDto } from '@/core/models/spotify-playback.model';
import { NotificationService } from '@/core/services/notification.service';
import { SpotifyPlaybackService } from '@/core/services/spotify-playback.service';
import { Task as TaskService } from '@/core/services/task';
import { Store } from '@/core/store/store';
import { NotificationsComponent } from '@/shared/components/notifications/notifications';
import { UiButtonComponent } from '@/shared/components/ui';
import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  NgZone,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

type PomodoroPhase = 'idle' | 'work' | 'break';

@Component({
  selector: 'app-timer',
  imports: [UiButtonComponent, NotificationsComponent],
  templateUrl: './timer.html',
  styleUrl: './timer.css',
})
export default class Timer implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly store = inject(Store);
  private readonly notificationService = inject(NotificationService);
  private readonly spotifyPlayback = inject(SpotifyPlaybackService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  private audio: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;

  private passBreakUnsub: (() => void) | undefined;
  private passBreakDurationUnsub: (() => void) | undefined;
  private spotifyAuthUnsub: (() => void) | undefined;
  private spotifyPollId: ReturnType<typeof setInterval> | null = null;

  /** Spotify en escritorio: mostrar bloque solo si hay Client ID empaquetado. */
  readonly desktopSpotify = signal(false);
  readonly spotifyHasClientId = signal(false);
  readonly spotifyLinked = signal(false);
  readonly spotifyNow = signal<SpotifyNowPlayingDto | null>(null);

  /** Descanso tras “pasar tarea”, contado en esta ventana (tamaño flotante). */
  postPassManualBreak = signal(false);
  manualBreakSecondsLeft = signal(0);
  manualBreakTotalSeconds = signal(0);
  private manualBreakIntervalId: ReturnType<typeof setInterval> | null = null;

  task = computed(() => this.store.getOneTaskForWork() ?? undefined);

  private static readonly DEFAULT_WORK_MIN = 60;
  private static readonly DEFAULT_BREAK_MIN = 15;

  readonly pomodoroDefaults = {
    work: Timer.DEFAULT_WORK_MIN,
    break: Timer.DEFAULT_BREAK_MIN,
  } as const;

  private readonly ringCircumference = 2 * Math.PI * 30;

  // ─── Motor del contador ────────────────────────────────────────────────
  // Propio, sin dependencias externas. En vez de "restar 1" cada segundo con
  // setInterval (lo que acumula desvío y puede duplicarse si algo dispara un
  // segundo intervalo), guardamos el instante exacto en el que debe terminar
  // la fase actual (phaseEndAt) y en cada tick recalculamos cuánto falta
  // comparando contra Date.now(). El conteo nunca se desincroniza ni se
  // "traba", sin importar pausas del hilo principal o el propio setInterval.
  phase = signal<PomodoroPhase>('idle');
  private phaseEndAt = signal<number | null>(null);
  private pausedRemainingMs = signal<number | null>(null);
  completedWorkRounds = signal(0);
  /** Pulso decorativo breve al completar una fase (ver advancePhase()). */
  celebrate = signal(false);
  status = signal<boolean>(false);
  /** true en cuanto se pulsa "Iniciar", de forma síncrona (evita doble clic). */
  hasStarted = signal<boolean>(false);
  totalTime = signal<number>(0);
  /** Se incrementa en cada tick solo para forzar el recálculo de los computed de tiempo. */
  private readonly clockTick = signal(0);
  private tickIntervalId: ReturnType<typeof setInterval> | null = null;

  displayPhase = computed(() => {
    if (this.postPassManualBreak()) return 'break';
    return this.phase();
  });

  phaseLabel = computed(() => {
    if (this.postPassManualBreak()) return 'Descanso';
    const phase = this.phase();
    if (phase === 'work') return 'Enfoque';
    if (phase === 'break') return 'Descanso';
    return 'Listo';
  });

  private phaseDurationSeconds(phase: PomodoroPhase): number {
    if (phase === 'work') return this.pomodoroDefaults.work * 60;
    if (phase === 'break') return this.pomodoroDefaults.break * 60;
    return 0;
  }

  remainingSecondsDisplay = computed(() => {
    if (this.postPassManualBreak()) {
      return this.manualBreakSecondsLeft();
    }
    const phase = this.phase();
    if (phase === 'idle') {
      return this.pomodoroDefaults.work * 60;
    }
    const paused = this.pausedRemainingMs();
    if (paused !== null) {
      return Math.max(0, Math.ceil(paused / 1000));
    }
    const endAt = this.phaseEndAt();
    if (endAt === null) return 0;
    this.clockTick(); // dependencia: fuerza recalcular en cada tick del reloj
    return Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  });

  progressFraction = computed(() => {
    if (this.postPassManualBreak()) {
      const total = this.manualBreakTotalSeconds();
      const left = this.manualBreakSecondsLeft();
      if (total <= 0) return 0;
      return Math.max(0, Math.min(1, (total - left) / total));
    }
    const phase = this.phase();
    if (phase === 'idle') return 0;
    const total = this.phaseDurationSeconds(phase);
    if (total <= 0) return 0;
    const remaining = this.remainingSecondsDisplay();
    return Math.max(0, Math.min(1, (total - remaining) / total));
  });

  ringDash = computed(() => {
    const p = this.progressFraction();
    const c = this.ringCircumference;
    const filled = p * c;
    return `${filled} ${c}`;
  });

  /** Sube la intensidad del "wash" ambiental en el último 20% de la fase. */
  washIntensity = computed(() => {
    const phase = this.displayPhase();
    if (phase !== 'work' && phase !== 'break') return 0;
    const p = this.progressFraction();
    return Math.max(0, Math.min(1, (p - 0.8) / 0.2));
  });

  private static readonly PIPS_PER_CYCLE = 4;
  /** Índices fijos para pintar los puntos de rondas completadas. */
  pipIndices = computed(() =>
    Array.from({ length: Timer.PIPS_PER_CYCLE }, (_, i) => i)
  );
  /** Cuántos puntos del ciclo visual actual están llenos (rueda cada 4 rondas). */
  filledPipCount = computed(() => {
    const rounds = this.completedWorkRounds();
    const mod = rounds % Timer.PIPS_PER_CYCLE;
    return rounds > 0 && mod === 0 ? Timer.PIPS_PER_CYCLE : mod;
  });

  /** Segundos de enfoque acumulados: fases de trabajo completas + la que está en curso. */
  liveTotalSeconds = computed(() => {
    const base = this.totalTime();
    if (this.phase() !== 'work' || this.postPassManualBreak()) return base;
    const total = this.phaseDurationSeconds('work');
    const elapsed = total - this.remainingSecondsDisplay();
    return base + Math.max(0, elapsed);
  });

  ngOnInit() {
    this.setFloatingWindow();
    this.toggleTitlebarAndMenu(false);
    this.initializeAudio();
    this.checkPendingManualBreakFromWeb();

    this.passBreakUnsub = window.desktopAPI?.onPassBreakFlowDone?.((p) => {
      if (p.action === 'advance-queue') {
        this.store.advanceToNextWorkTask();
        void this.router.navigate(['/private/work']);
      }
      this.cdr.detectChanges();
    });

    this.passBreakDurationUnsub =
      window.desktopAPI?.onPassBreakDurationChosen?.((payload) => {
        this.ngZone.run(() => {
          void this.applyPostPassManualBreak(payload.minutes);
        });
      });

    this.desktopSpotify.set(this.spotifyPlayback.isDesktopSpotifyAvailable());
    this.spotifyAuthUnsub = this.spotifyPlayback.onAuthResult?.((r) => {
      if (r.ok) {
        this.ngZone.run(() => void this.refreshSpotifyPlayback());
      }
    });
    if (this.desktopSpotify()) {
      void this.refreshSpotifyPlayback();
      this.spotifyPollId = setInterval(() => {
        this.ngZone.run(() => void this.refreshSpotifyPlayback());
      }, 10_000);
    }
  }

  ngOnDestroy() {
    this.stopTicking();
    this.clearPostPassManualBreakInterval();
    this.passBreakUnsub?.();
    this.passBreakDurationUnsub?.();
    this.spotifyAuthUnsub?.();
    if (this.spotifyPollId !== null) {
      clearInterval(this.spotifyPollId);
      this.spotifyPollId = null;
    }
    this.resetFloatingWindow();
    this.toggleTitlebarAndMenu(true);
    this.cleanupAudio();
  }

  private async refreshSpotifyPlayback(): Promise<void> {
    if (!this.spotifyPlayback.isDesktopSpotifyAvailable()) return;
    const s = await this.spotifyPlayback.getStatus();
    this.spotifyHasClientId.set(s.hasClientId);
    this.spotifyLinked.set(s.connected);
    if (!s.connected) {
      this.spotifyNow.set(null);
      this.cdr.markForCheck();
      return;
    }
    const playing = await this.spotifyPlayback.fetchNowPlaying();
    this.spotifyNow.set(playing);
    this.cdr.markForCheck();
  }

  openSpotifyTrack(url: string): void {
    void window.desktopAPI?.openExternalUrl?.(url);
  }

  private checkPendingManualBreakFromWeb(): void {
    try {
      const raw = sessionStorage.getItem('focus-loop-pending-manual-break');
      if (!raw) return;
      sessionStorage.removeItem('focus-loop-pending-manual-break');
      const m = parseInt(raw, 10);
      if (m === 5 || m === 10 || m === 15) {
        queueMicrotask(() =>
          void this.applyPostPassManualBreak(m as 5 | 10 | 15)
        );
      }
    } catch {
      /* ignorar */
    }
  }

  private async applyPostPassManualBreak(minutes: 5 | 10 | 15): Promise<void> {
    this.clearPostPassManualBreakInterval();
    await this.setFloatingWindow();
    this.toggleTitlebarAndMenu(false);

    const totalSec = minutes * 60;
    this.manualBreakTotalSeconds.set(totalSec);
    this.manualBreakSecondsLeft.set(totalSec);
    this.postPassManualBreak.set(true);

    this.manualBreakIntervalId = setInterval(() => {
      this.manualBreakSecondsLeft.update((s) => {
        if (s <= 1) {
          this.clearPostPassManualBreakInterval();
          this.ngZone.run(() => this.finishPostPassAfterBreak(true));
          return 0;
        }
        return s - 1;
      });
      this.cdr.detectChanges();
    }, 1000);
    this.pushTimerNotification(
      'Descanso entre tareas',
      `Tómate ${minutes} min. Luego pasamos a la siguiente tarea.`
    );
    this.cdr.detectChanges();
  }

  skipPostPassManualBreak(): void {
    this.clearPostPassManualBreakInterval();
    this.pushTimerNotification(
      'Descanso omitido',
      'Continuamos con la siguiente tarea en tu lista.'
    );
    this.finishPostPassAfterBreak(false);
  }

  private clearPostPassManualBreakInterval(): void {
    if (this.manualBreakIntervalId !== null) {
      clearInterval(this.manualBreakIntervalId);
      this.manualBreakIntervalId = null;
    }
  }

  private finishPostPassAfterBreak(notifyCompletion: boolean): void {
    this.postPassManualBreak.set(false);
    this.manualBreakSecondsLeft.set(0);
    this.manualBreakTotalSeconds.set(0);
    if (notifyCompletion) {
      this.pushTimerNotification(
        'Descanso terminado',
        'Listo para la siguiente tarea en tu lista de trabajo.'
      );
    }
    this.store.advanceToNextWorkTask();
    void this.router.navigate(['/private/work']);
    this.cdr.detectChanges();
  }

  private async setFloatingWindow() {
    if (!window.desktopAPI) return;
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 150));

      const { userAgent } = navigator;
      if (userAgent.includes('Windows') || userAgent.includes('Linux')) {
        await window.desktopAPI.makeWindowFloating(448, 196, 0, 50);
      } else if (userAgent.includes('Macintosh')) {
        await window.desktopAPI.makeWindowFloating(368, 196, 0, 50);
      }
    } catch (error) {
      console.error('Error making window floating:', error);
    }
  }

  private async resetFloatingWindow() {
    if (!window.desktopAPI) return;
    try {
      await window.desktopAPI.resetWindowFloating();
    } catch (error) {
      console.error('Error restoring window state:', error);
    }
  }

  private toggleTitlebarAndMenu(show: boolean) {
    if (window.desktopAPI) {
      if (show) {
        window.desktopAPI.showTitlebar?.();
        window.desktopAPI.showMenu?.();
      } else {
        window.desktopAPI.hideTitlebar?.();
        window.desktopAPI.hideMenu?.();
      }
    }
  }

  private initializeAudio() {
    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('AudioContext not available, using HTML5 Audio:', error);
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

  // ─── Motor del contador: arranque / pausa / reanudación ────────────────

  private beginTicking(): void {
    // Siempre limpiar cualquier intervalo previo antes de crear uno nuevo:
    // esto es justo lo que causaba el bug de "doble velocidad" antes.
    this.stopTicking();
    this.tickIntervalId = setInterval(() => {
      this.ngZone.run(() => this.onClockTick());
    }, 250);
  }

  private stopTicking(): void {
    if (this.tickIntervalId !== null) {
      clearInterval(this.tickIntervalId);
      this.tickIntervalId = null;
    }
  }

  private onClockTick(): void {
    const endAt = this.phaseEndAt();
    if (endAt !== null && Date.now() >= endAt) {
      this.advancePhase();
    }
    this.clockTick.update((n) => n + 1);
    this.cdr.detectChanges();
  }

  private advancePhase(): void {
    const finishedPhase = this.phase();
    if (finishedPhase === 'work') {
      this.totalTime.update((t) => t + this.phaseDurationSeconds('work'));
      this.completedWorkRounds.update((r) => r + 1);
    }
    const nextPhase: PomodoroPhase = finishedPhase === 'work' ? 'break' : 'work';
    this.phase.set(nextPhase);
    this.phaseEndAt.set(
      Date.now() + this.phaseDurationSeconds(nextPhase) * 1000
    );
    this.notifyPhaseTransition(finishedPhase, nextPhase);
    void this.playAudioForStatus(nextPhase);
    this.celebrate.set(true);
    setTimeout(() => this.celebrate.set(false), 900);
  }

  start() {
    if (this.phase() !== 'idle') return;
    try {
      this.hasStarted.set(true);
      this.status.set(true);
      this.phase.set('work');
      this.phaseEndAt.set(
        Date.now() + this.phaseDurationSeconds('work') * 1000
      );
      this.beginTicking();
      this.notifyPhaseTransition('idle', 'work');
      void this.playAudioForStatus('work');
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  }

  pause() {
    if (!this.status()) return;
    try {
      const endAt = this.phaseEndAt();
      if (endAt !== null) {
        this.pausedRemainingMs.set(Math.max(0, endAt - Date.now()));
      }
      this.stopTicking();
      this.status.set(false);
      const phase = this.phase();
      if (phase === 'break') {
        this.pushTimerNotification(
          'Descanso en pausa',
          'El temporizador de descanso está pausado. Reanúdalo cuando quieras.'
        );
      } else if (phase === 'work') {
        this.pushTimerNotification(
          'Enfoque en pausa',
          'El temporizador está pausado. Reanúdalo cuando quieras.'
        );
      }
    } catch (error) {
      console.error('Error pausing timer:', error);
    }
  }

  play() {
    if (this.status()) return;
    try {
      const remaining = this.pausedRemainingMs();
      if (remaining !== null) {
        this.phaseEndAt.set(Date.now() + remaining);
        this.pausedRemainingMs.set(null);
      }
      this.status.set(true);
      this.beginTicking();
      const phase = this.phase();
      if (phase === 'break') {
        this.pushTimerNotification(
          'Descanso reanudado',
          'Sigue descansando. Aprovecha estos minutos.'
        );
      } else if (phase === 'work') {
        this.pushTimerNotification(
          'Enfoque reanudado',
          'Retomas la sesión de trabajo. ¡Buen ritmo!'
        );
      }
    } catch (error) {
      console.error('Error resuming timer:', error);
    }
  }

  /** Notificación en app (toast) y en escritorio (Electron), si está disponible. */
  private pushTimerNotification(title: string, body: string): void {
    this.notificationService.info(title, body, 4800);
    void window.desktopAPI?.showNotification?.(title, body);
  }

  private notifyPhaseTransition(
    previous: PomodoroPhase,
    next: PomodoroPhase
  ): void {
    const taskTitle = this.task()?.title?.trim();
    const taskBit = taskTitle ? ` · ${taskTitle}` : '';

    if (previous === 'idle' && next === 'work') {
      this.pushTimerNotification(
        'Enfoque iniciado',
        `Sesión de trabajo${taskBit}. Objetivo: ${this.pomodoroDefaults.work} min.`
      );
      return;
    }
    if (previous === 'break' && next === 'work') {
      this.pushTimerNotification(
        'Volviste al trabajo',
        `El descanso terminó. Retoma el enfoque${taskBit}.`
      );
      return;
    }
    if (previous === 'work' && next === 'break') {
      this.pushTimerNotification(
        'Hora de descansar',
        `Buen bloque de trabajo. Descansa ${this.pomodoroDefaults.break} min y recarga energía.`
      );
      return;
    }
  }

  private async playAudioForStatus(status: PomodoroPhase) {
    let audioFile = '';
    if (status === 'work') audioFile = 'assets/start.mp3';
    if (status === 'break') audioFile = 'assets/break.mp3';

    if (!audioFile) return;

    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (this.audioContext) {
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
        this.audio = new Audio(audioFile);
        this.audio.volume = 0.5;
        await this.audio.play();
      }
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  formatTotalTime(): string {
    const totalMinutes = Math.floor(this.liveTotalSeconds() / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;
    if (totalHours > 0) {
      return `${totalHours}h ${remainingMinutes}m`;
    }
    return `${totalMinutes}m`;
  }

  goToNextTask() {
    try {
      this.stopTicking();
      const completedTitle = this.task()?.title?.trim();
      this.taskService
        .updateTask(this.task()?.task_id || 0, {
          status_task_id: 3,
        })
        .subscribe({
          next: () => {
            const title = completedTitle;
            this.pushTimerNotification(
              'Tarea completada',
              title
                ? `«${title}» marcada como hecha.`
                : 'La tarea quedó marcada como hecha.'
            );
            this.router.navigate(['/private/work']);
          },
          error: (error) => {
            console.error('Error updating task:', error);
          },
        });
    } catch (error) {
      console.error('Error going to next task:', error);
    }
  }

  openPassTaskFlow(): void {
    const t = this.task();
    if (!t) return;
    try {
      this.stopTicking();
      this.status.set(false);
    } catch (error) {
      console.error('Error stopping timer for pass flow:', error);
    }

    if (window.desktopAPI?.openPassBreakWindow) {
      void window.desktopAPI.openPassBreakWindow({ taskTitle: t.title });
      return;
    }

    try {
      sessionStorage.setItem('focus-loop-pass-break-title', t.title);
    } catch {
      /* ignorar */
    }
    void this.router.navigate(['/private/timer-pass-break']);
  }

  backToWork() {
    try {
      this.stopTicking();
      this.router.navigate(['/private/work']);
    } catch (error) {
      console.error('Error returning to work:', error);
    }
  }
}
