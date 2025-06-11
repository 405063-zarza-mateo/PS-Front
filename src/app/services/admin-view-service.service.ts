import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/evironment';
import { Review } from '../models/review';
import { ReviewDto } from '../models/ReviewDto';
import { Student } from '../models/student';
import { StudentPostDto } from '../models/studentPostDto';
import { Teacher } from '../models/teacher';
import { Log } from '../models/log';
import { TeacherResponse } from '../models/teacherRequest';

@Injectable({
  providedIn: 'root'
})
export class AdminViewService {

 private apiUrl = `${environment.apiUrl}/admin`;
  private apiUrl2 = `${environment.apiUrl}/teacher`;

  currentUser: any;
  teacherEmail: string = '';
  private isBrowser: boolean;


  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadUserFromStorage();
  }

  loadUserFromStorage() {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        this.currentUser = localStorage.getItem('currentUser');

        if (this.currentUser) {
          const parsedUser = JSON.parse(this.currentUser);
          this.teacherEmail = parsedUser.email || '';
        }

      } catch (e) {
        console.error('Error cargando usuario del localStorage', e);
      }
    }
  }

  getTeachers(): Observable<Teacher[]> {

    return this.http.get<Teacher[]>(`${this.apiUrl2}/all`)
      .pipe(
        catchError(error => {
          console.error('Error fetching teachers:', error);
          return throwError(() => error);
        })
      );
  }

  getPendingTeachers(): Observable<Teacher[]> {
    const params = new HttpParams().set('approved', false);

    return this.http.get<Teacher[]>(`${this.apiUrl}/pending-teachers`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching teachers:', error);
          return throwError(() => error);
        })
      );
  }

  approveTeacher(id : number): Observable<Teacher[]> {
    const params = new HttpParams().set('approved', true);

    return this.http.put<Teacher[]>(`${this.apiUrl}/approve-teacher/${id}`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching teachers:', error);
          return throwError(() => error);
        })
      );
  }

  denyTeacher(id : number): Observable<any> {
    const params = new HttpParams().set('approved', true);

    return this.http.delete(`${this.apiUrl}/reject-teacher/${id}`, { responseType:'text' })
      .pipe(
        catchError(error => {
          console.error(`Error rejecting teacher with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  respondRequests(list : TeacherResponse[]) : Observable<any>{
        return this.http.post<Student>(`${this.apiUrl}/respond-request`,  list )
      .pipe(
        catchError(error => {
          console.error('Error sending invites:', error);
          return throwError(() => error);
        })
      );

  }
  
    getLogs(): Observable<Log[]> {
      return this.http.get<Log[]>(`${this.apiUrl}/logs`);
    }
  }
