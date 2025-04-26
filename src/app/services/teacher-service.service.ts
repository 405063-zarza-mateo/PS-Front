import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/evironment';
import { Teacher } from '../models/teacher';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
 private apiUrl = `${environment.apiUrl}/teacher`;
 private apiUrl2 = `${environment.apiUrl}/admin`;

  currentUser: any;
  teacherEmail: string = '';

  constructor(private http: HttpClient) {

    this.currentUser = localStorage.getItem('currentUser');

    if (this.currentUser) {
      const parsedUser = JSON.parse(this.currentUser);
      this.teacherEmail = parsedUser.email || '';
    }
  }

  getTeachers(): Observable<Teacher[]> {
    const params = new HttpParams().set('approved', true);

    return this.http.get<Teacher[]>(`${this.apiUrl2}/pending-teachers`, {params})
      .pipe(
        catchError(error => {
          console.error('Error fetching teachers:', error);
          return throwError(() => error);
        })
      );
  }

  getPendingTeachers(): Observable<Teacher[]> {
    const params = new HttpParams().set('approved', false);

    return this.http.get<Teacher[]>(`${this.apiUrl}/pending-teachers`, {params})
      .pipe(
        catchError(error => {
          console.error('Error fetching teachers:', error);
          return throwError(() => error);
        })
      );
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

}