import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../environments/evironment';
import { News } from '../models/news';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl2}/news`;

  constructor(private http: HttpClient) { }

  getAllNews(): Observable<News[]> {
    return this.http.get<News[]>(this.apiUrl);
  }

  getNewsById(id: number): Observable<News> {
    return this.http.get<News>(`${this.apiUrl}/${id}`);
  }

  createNews(formData: FormData): Observable<News> {
    return this.http.post<News>(this.apiUrl, formData);
  }

  deleteNews(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Helper para preparar el FormData que necesita el backend
  prepareFormData(news: { title: string, body: string, image?: File }): FormData {
    const formData = new FormData();
    formData.append('title', news.title);
    formData.append('body', news.body);

    if (news.image) {
      formData.append('image', news.image);
    }

    return formData;
  }
}