import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/evironment';
import { Student } from '../models/student';
import { StudentPostDto } from '../models/studentPostDto';
import { ReviewDto } from '../models/ReviewDto';
import { Review } from '../models/review';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/student`;
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

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/all`)
      .pipe(
        catchError(error => {
          console.error('Error fetching students:', error);
          return throwError(() => error);
        })
      );
  }

  getStudentById(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching student with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  createStudent(student: StudentPostDto): Observable<StudentPostDto> {
    const params = new HttpParams().set('teacherEmail', this.teacherEmail);

    return this.http.post<Student>(`${this.apiUrl}/create`, student, { params })
      .pipe(
        catchError(error => {
          console.error('Error creating student:', error);
          return throwError(() => error);
        })
      );
  }

  updateStudent(id: number, student: Partial<Student>): Observable<Student> {
    const params = new HttpParams().set('teacherEmail', this.teacherEmail);

    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, { params })
      .pipe(
        catchError(error => {
          console.error(`Error updating student with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  deleteStudent(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error(`Error deleting student with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  getCourses(): Observable<String[]> {
    return this.http.get<String[]>(`${this.apiUrl}/courses`)
      .pipe(
        catchError(error => {
          console.error('Error fetching courses:', error);
          return throwError(() => error);
        })
      );
  }


  addReview(review: ReviewDto, id: number): Observable<Review> {
    const params = new HttpParams().set('studentId', id).set('teacherEmail', this.teacherEmail);

    return this.http.post<Review>(`${this.apiUrl}/addReview`, review, { params })
      .pipe(
        catchError(error => {
          console.error('Error creating review:', error);
          return throwError(() => error);
        })
      );
  }
}