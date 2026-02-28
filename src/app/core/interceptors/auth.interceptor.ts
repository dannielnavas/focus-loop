import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '@/core/services/storage.service';

const AUTH_PATHS = ['/auth/login', '/users'];

function isAuthRequest(url: string): boolean {
  return AUTH_PATHS.some((path) => url.includes(path));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === HttpStatusCode.Unauthorized &&
        !isAuthRequest(req.url)
      ) {
        storage.clearUserData();
        router.navigate(['/']);
      }
      return throwError(() => error);
    })
  );
};
