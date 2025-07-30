import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../environments/evironment';
import { Item } from '../models/item';
import { ItemPostDto } from '../models/itemPostDto';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrlUsers = `${environment.apiUrlUsersInv}/inventory`;

  currentUser: any;
  itemEmail: string = '';
  isBrowser: boolean;

  constructor(private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  createItem(item: ItemPostDto): Observable<ItemPostDto> {

    return this.http.post<Item>(`${this.apiUrlUsers}/create`, item)
      .pipe(
        catchError(error => {
          console.error('Error creating item:', error);
          return throwError(() => error);
        })
      );
  }

  getItems(): Observable<Item[]> {

    return this.http.get<Item[]>(`${this.apiUrlUsers}/all`)
      .pipe(
        catchError(error => {
          console.error('Error fetching items:', error);
          return throwError(() => error);
        })
      );
  }

  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrlUsers}/${id}`)
      .pipe(
        catchError(error => {
          console.error(`Error fetching item with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }


  updateItem(id: number, item: Partial<Item>): Observable<Item> {

    return this.http.put<Item>(`${this.apiUrlUsers}/${id}`, item)
      .pipe(
        catchError(error => {
          console.error(`Error updating item with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  deleteItem(id: number): Observable<any> {

    return this.http.delete(`${this.apiUrlUsers}/delete/${id}`, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error(`Error deleting item with id ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

}