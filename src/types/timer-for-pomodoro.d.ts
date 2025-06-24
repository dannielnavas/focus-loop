declare module 'timer-for-pomodoro' {
  interface TimerState {
    minutes: number;
    seconds: number;
    rounds: number;
    status: string;
    timeRaw: number;
    settings: TimerSettings;
  }

  interface TimerSettings {
    workTime: number;
    breakTime: number;
    rounds: number;
  }

  class Timer {
    constructor(workTime?: number, breakTime?: number, rounds?: number);

    start(): void;
    stop(): void;
    pause(): void;
    next(): void;

    subscribe(listener: (currentTime: TimerState) => void): TimerState;
  }

  export = Timer;
  export { TimerSettings, TimerState };
}
