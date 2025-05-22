import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/evironment';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userRoleSubject = new BehaviorSubject<string | null>(null);

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  readonly userRole$ = this.userRoleSubject.asObservable();

  private apiUrl = `${environment.apiUrl}/auth`;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    if (this.isBrowser) {
      const userJson = localStorage.getItem('currentUser');
      if (userJson) {
        try {
          const user: User = JSON.parse(userJson);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(user.role);
        } catch (error) {
          this.logout();
        }
      }
    }
  }

  login(email: string, password: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(user => {
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.userRoleSubject.next(user.role);
          this.router.navigate(['/students']);
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => error);
        })
      );
  }

  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/signup`, userData)
      .pipe(
        tap(user => {
          this.router.navigate(['/register/waiting']);
        }),
        catchError(error => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  resetPassword(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);


    return this.http.post<any>(`${this.apiUrl}/reset-password`, null, { params })
      .pipe(
        catchError(error => {
          console.error('Reset password error:', error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.userRoleSubject.next(null);
    this.router.navigate(['/home']);
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ROLE_ADMIN';
  }

  get isTeacher(): boolean {
    console.log("es teacher");

    return this.currentUser?.role === 'ROLE_TEACHER';
  }

  get token(): string | null {
    return this.currentUser?.token || null;
  }

  refreshToken(): Observable<User> {
    if (!this.currentUser) {
      return throwError(() => new Error('No authenticated user'));
    }

    return this.http.post<User>(`${this.apiUrl}/refresh-token`, {
      refreshToken: this.currentUser.token
    }).pipe(
      tap(user => {
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  isTokenExpired(): boolean {
    return !this.currentUser || !this.currentUser.token;
  }
}
