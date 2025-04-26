// auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const adminGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  return authService.userRole$.pipe(
    take(1),
    map(role => {
      if (role === 'ROLE_ADMIN') {
        return true;
      } else {
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};