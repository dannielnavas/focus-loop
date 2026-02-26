# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Focus Loop is a desktop task management and Pomodoro timer application built with Angular 20 and Electron (electron-vite). The app uses Angular Signals for state management and implements optimistic UI patterns for immediate user feedback.

## Development Commands

### Web Development
```bash
npm start                    # Start dev server at http://localhost:4200
ng serve                     # Alternative to npm start
npm run build                # Production build (output: dist/focus-loop/)
npm run watch                # Build with watch mode
```

### Desktop Application (Electron)
```bash
npm run electron:dev         # Start Angular + Electron in development mode
npm run electron:build       # Build Angular then Electron (output: out/)
npm run electron:build:patch # Increment patch version and build
npm run electron:build:minor  # Increment minor version and build
npm run electron:build:major  # Increment major version and build
```

### Testing
```bash
npm run test                              # Run unit tests
npm run test -- --code-coverage           # Run tests with coverage
npm run test -- --include="**/board.spec.ts"  # Run specific tests
npm run test -- --watch                   # Run tests in watch mode
```

### Version Management
```bash
npm run version:patch    # Increment patch version
npm run version:minor    # Increment minor version
npm run version:major    # Increment major version
```

## Architecture

### Core Structure

**State Management**: Uses Angular Signals throughout. The `Store` service (`src/app/core/store/store.ts`) provides global state with signals, not observables.

**Optimistic UI**: All CRUD operations use optimistic UI patterns via `OptimisticUIService` (`src/app/core/services/optimistic-ui.ts`). Changes appear immediately in the UI while the server request processes in the background. On failure, automatic rollback restores the previous state.

**Path Aliases**: TypeScript is configured with `@/*` alias mapping to `./src/app/*`. Use this for imports: `import { Store } from '@/core/store/store'`

### Application Structure

```
src/app/
├── core/                    # Business logic layer
│   ├── models/             # TypeScript interfaces (Task, Sprint, User, Auth)
│   ├── services/           # HTTP services and utilities
│   │   ├── task.ts         # Task CRUD with optimistic methods
│   │   ├── sprints.ts      # Sprint CRUD with optimistic methods
│   │   ├── optimistic-ui.ts  # Optimistic UI service
│   │   ├── notification.service.ts  # Toast notifications
│   │   ├── login.ts        # Authentication service
│   │   └── settings.ts     # User settings service
│   ├── store/              # Global state management with Signals
│   │   └── store.ts        # Centralized store for tasks, sprints, optimistic state
│   └── desktop/            # Desktop init (Electron exposes API via preload)
│       └── init.ts         # Bootstrap; window.desktopAPI from Electron preload
├── private/                 # Authenticated routes
│   └── pages/
│       ├── board/          # Kanban board with drag-and-drop
│       ├── principal/      # Main dashboard
│       ├── timer/          # Pomodoro timer component
│       ├── work/           # Task work view
│       ├── sprints/        # Sprint management
│       ├── settings/       # Application settings
│       └── profile/        # User profile
├── public/                  # Public routes
│   └── pages/
│       └── login/          # Authentication page
└── shared/                  # Reusable components
    └── components/
        ├── header/         # App header
        ├── layout/         # Main layout wrapper
        ├── optimistic-status/  # Shows pending operations status
        └── notifications/  # Toast notification display
```

### Electron Desktop Integration

The desktop app uses Electron with electron-vite. The main process is in `electron/main.ts`, the preload in `electron/preload.ts`; config in `electron.vite.config.ts`. The preload exposes `window.desktopAPI` (notifications, window control, menu events). Angular builds to `dist/focus-loop/browser`; in dev the window loads `http://localhost:4200`, in prod it loads the built files.

### Key Models

**TaskResponse**: Main task object with `task_id`, `title`, `description`, `position`, `statusTask` (nested object with `status_task_id` and `name`), and `date_end`.

**SprintResponse**: Sprint object with `sprint_id`, `name`, `description`, date range, `status` ('active' | 'completed' | 'planned'), and task counts (`countTaskPending`, `countTaskInProgress`, `countTaskCompleted`).

## Coding Patterns

### Component Style
Use standalone components with the `inject()` function for dependency injection:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './example.html',
})
export class ExampleComponent {
  private readonly store = inject(Store);
  private readonly taskService = inject(TaskService);
}
```

### State Management with Signals
Access state through the Store service. The store returns signals or signal values:

```typescript
// Getting signal reference
const sprintsSignal = this.store.getSprints();

// Getting signal value
const tasks = this.store.getTasks();
const combinedTasks = this.store.getCombinedTasks(); // Merges real + optimistic
```

### Optimistic UI Pattern
For any create, update, or delete operation:

1. Update local state immediately using `store.addOptimisticTask()` or similar
2. Call the optimistic service method (e.g., `taskService.createTaskOptimistic()`)
3. On success: remove from optimistic state, add to real state
4. On error: automatic rollback removes optimistic data

```typescript
// Example: Creating a task optimistically
const tempId = Date.now();
const newTask: TaskResponse = {
  task_id: tempId,
  title: 'New Task',
  // ... other fields
};

this.store.addOptimisticTask(newTask);

this.taskService.createTaskOptimistic(taskData).subscribe({
  next: (result) => {
    this.store.removeOptimisticTask(tempId);
    this.store.setTasks([...this.store.getTasks(), result]);
  },
  error: () => {
    this.store.removeOptimisticTask(tempId);
  },
});
```

### TypeScript Strictness
The project uses strict TypeScript settings. Avoid `any`, use explicit types, and prefer `readonly` for immutable properties. All Angular compiler options are strict.

### Testing Framework
Uses Jasmine and Karma. Each component/service has a `.spec.ts` file. Tests use `TestBed.configureTestingModule()` with standalone component imports.

## Build Configuration

**CommonJS Dependencies**: `timer-for-pomodoro` is configured as an allowed CommonJS dependency in `angular.json`.

**Build Budgets**: Initial bundle max is 1MB, component styles max is 8kB. These are enforced in production builds.

**Electron Build**: `npm run electron:build` runs `ng build` then `electron-vite build`. Angular output is `dist/focus-loop/browser`; Electron output is `out/main` and `out/preload`. Package `main` is `out/main/index.js`. Installers: `npm run dist` (electron-builder); output in `release/`.

**Firma de instalables (gratuita donde aplica)**: Linux = GPG (secretos `GPG_PRIVATE_KEY`, `GPG_KEY_ID`); Windows = certificado auto-firmado (`npm run electron:create-cert` en Windows, secretos `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD`); macOS = requiere certificado Apple (secretos `CSC_LINK`, `CSC_KEY_PASSWORD`). Ver README sección "Firma de instalables".

## Important Notes

- When working with tasks or sprints, always use optimistic methods from services, not direct HTTP calls
- The notification service is automatically invoked by `OptimisticUIService`, don't call it manually for CRUD operations
- Audio features in the Pomodoro timer use `AudioContext` with fallback to HTML5 Audio
- All components use Angular 20's standalone component architecture
- The project uses Tailwind CSS v4 for styling
- Backend API is hosted on Vercel (environment variable: `API_URL`)
