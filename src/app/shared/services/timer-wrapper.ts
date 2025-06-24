// Wrapper ESM para timer-for-pomodoro
import * as TimerModule from 'timer-for-pomodoro';

// Extraer la clase Timer del módulo CommonJS
const Timer = (TimerModule as any).default || TimerModule;

export type { TimerState } from 'timer-for-pomodoro';
export { Timer };
