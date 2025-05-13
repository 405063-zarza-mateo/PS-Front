import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/evironment';
import { ProfileDto } from '../models/profileDto';


interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUserProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.apiUrl}/teacher/profile`);
  }

  updateProfile(data: string): Observable<ProfileDto> {
    return this.http.put<ProfileDto>(`${this.apiUrl}/teacher/profile`, data);
  }

  changePassword(data: PasswordChangeData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/change-password`, data);
  }}
