
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// En auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {

  const authService = inject(AuthService);

  const isApiRequest = req.url.includes('/api'); 

  if (!isApiRequest) {
    return next(req);
  }

  // Verificar si estamos en un entorno con localStorage disponible
  const isPlatformBrowser = typeof window !== 'undefined' && window.localStorage;

  let parsedUser: any = null;
  if (isPlatformBrowser) {
    try {
      const currentUser = localStorage.getItem('currentUser');
      parsedUser = currentUser ? JSON.parse(currentUser) : null;
    } catch (e) {
      console.error('Error al parsear currentUser', e);
    }
  }

  if (parsedUser?.token && parsedUser?.tokenType) {
    req = req.clone({
      setHeaders: {
        Authorization: `${parsedUser.tokenType} ${parsedUser.token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('Token inválido o expirado. Redirigiendo al login...');
        authService.logout(); 
      }
      return throwError(() => error);
    })
  );
};