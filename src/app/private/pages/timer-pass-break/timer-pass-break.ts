import { Store } from '@/core/store/store';
import { UiButtonComponent } from '@/shared/components/ui';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';

type PassStep = 'break-question' | 'break-pick';

@Component({
  selector: 'app-timer-pass-break',
  imports: [UiButtonComponent],
  templateUrl: './timer-pass-break.html',
  styleUrl: './timer-pass-break.css',
})
export default class TimerPassBreak implements OnInit {
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  readonly taskTitle = signal<string>('');
  readonly step = signal<PassStep>('break-question');
  readonly breakOptions = [5, 10, 15] as const;

  async ngOnInit(): Promise<void> {
    await this.loadContext();
  }

  private async loadContext(): Promise<void> {
    try {
      if (window.desktopAPI?.getPassBreakContext) {
        const ctx = await window.desktopAPI.getPassBreakContext();
        if (ctx?.taskTitle) {
          this.taskTitle.set(ctx.taskTitle);
          return;
        }
      }
    } catch {
      /* ignorar */
    }
    const stored = sessionStorage.getItem('focus-loop-pass-break-title');
    if (stored) {
      this.taskTitle.set(stored);
      sessionStorage.removeItem('focus-loop-pass-break-title');
    }
  }

  onBreakQuestionAnswer(wantsBreak: boolean): void {
    if (!wantsBreak) {
      void this.finishAdvance();
      return;
    }
    this.step.set('break-pick');
  }

  goBackToQuestion(): void {
    this.step.set('break-question');
  }

  /**
   * Escritorio: cierra la ventana modal y el descanso continúa en el timer (ventana flotante).
   * Web: vuelve al timer con el tiempo pendiente en sessionStorage.
   */
  chooseBreakDuration(minutes: 5 | 10 | 15): void {
    if (window.desktopAPI?.passBreakDurationChosen) {
      void window.desktopAPI.passBreakDurationChosen(minutes);
      return;
    }
    try {
      sessionStorage.setItem('focus-loop-pending-manual-break', String(minutes));
    } catch {
      /* ignorar */
    }
    void this.router.navigate(['/private/timer']);
  }

  async cancel(): Promise<void> {
    if (window.desktopAPI?.passBreakFlowCancel) {
      await window.desktopAPI.passBreakFlowCancel();
      return;
    }
    void this.router.navigate(['/private/timer']);
  }

  private async finishAdvance(): Promise<void> {
    if (window.desktopAPI?.passBreakFlowComplete) {
      await window.desktopAPI.passBreakFlowComplete({ action: 'advance-queue' });
      return;
    }

    this.store.advanceToNextWorkTask();
    void this.router.navigate(['/private/work']);
  }
}
