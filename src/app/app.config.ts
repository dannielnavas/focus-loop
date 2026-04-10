import {
  APP_INITIALIZER,
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { authInterceptor } from '@/core/interceptors/auth.interceptor';
import { routes } from './app.routes';
import { StorageService } from './core/services/storage.service';
import { ThemeService } from './core/services/theme.service';

function themeInitFactory(theme: ThemeService): () => void {
  return () => {
    theme.syncFromStorage();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    StorageService,
    ThemeService,
    {
      provide: APP_INITIALIZER,
      useFactory: themeInitFactory,
      deps: [ThemeService],
      multi: true,
    },
  ],
};
