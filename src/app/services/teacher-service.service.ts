import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/evironment';
import { Teacher } from '../models/teacher';
import { isPlatformBrowser } from '@angular/common';
import { Review } from '../models/review';
import { TeacherReviewDto } from '../models/teacherReviewDto';
import { AssistanceDto } from '../models/assistanceDto';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/teacher`;

  currentUser: any;
  teacherEmail: string = '';
  isBrowser: boolean;

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



  getTeacherById(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching teacher with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }


  updateTeacher(id: number, teacher: Partial<Teacher>): Observable<Teacher> {
    const params = new HttpParams().set('teacherEmail', this.teacherEmail);

    return this.http.put<Teacher>(`${this.apiUrl}/${id}`, teacher, { params })
      .pipe(
        catchError(error => {
          console.error(`Error updating teacher with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  deleteTeacher(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error(`Error deleting teacher with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getTeacherReviews(id: number): Observable<TeacherReviewDto[]> {
    return this.http.get<TeacherReviewDto[]>(`${this.apiUrl}/reviews/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching teacher with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

   getStudentAssistances(): Observable<AssistanceDto[]> {
  return this.http.get<AssistanceDto[]>(`${this.apiUrl}/assistances`);
}
}