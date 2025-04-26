import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/evironment';
import { News } from '../models/news';
import { NewsFilters } from '../models/newsFilters';




@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  getNews(filters?: NewsFilters): Observable<News[]> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.search) params = params.set('search', filters.search);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.startDate) params = params.set('startDate', filters.startDate.toISOString().split('T')[0]);
      if (filters.endDate) params = params.set('endDate', filters.endDate.toISOString().split('T')[0]);
      if (filters.published !== undefined) params = params.set('published', filters.published.toString());
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.size) params = params.set('size', filters.size.toString());
    }

    return this.http.get<News[]>(this.apiUrl, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching news:', error);
          return throwError(() => error);
        })
      );
  }

  getRecentNews(limit: number = 3): Observable<News[]> {
    return this.http.get<News[]>(`${this.apiUrl}/recent`, { 
      params: new HttpParams().set('limit', limit.toString())
    }).pipe(
      catchError(error => {
        console.error('Error fetching recent news:', error);
        return throwError(() => error);
      })
    );
  }

  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching news with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  createNews(news: Omit<News, 'id'>): Observable<News> {
    return this.http.post<News>(this.apiUrl, news)
      .pipe(
        catchError(error => {
          console.error('Error creating news:', error);
          return throwError(() => error);
        })
      );
  }

  updateNews(id: number, news: Partial<News>): Observable<News> {
    return this.http.put<News>(`${this.apiUrl}/${id}`, news)
      .pipe(
        catchError(error => {
          console.error(`Error updating news with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error deleting news with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  publishNews(id: number): Observable<News> {
    return this.http.patch<News>(`${this.apiUrl}/${id}/publish`, {})
      .pipe(
        catchError(error => {
          console.error(`Error publishing news with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  unpublishNews(id: number): Observable<News> {
    return this.http.patch<News>(`${this.apiUrl}/${id}/unpublish`, {})
      .pipe(
        catchError(error => {
          console.error(`Error unpublishing news with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }
}