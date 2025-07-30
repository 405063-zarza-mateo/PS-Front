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
  private apiUrlUsers = environment.apiUrlUsers;

  constructor(private http: HttpClient) {}

  getUserProfile(): Observable<ProfileDto> {
    return this.http.get<ProfileDto>(`${this.apiUrlUsers}/teacher/profile`);
  }

  updateProfile(course: string): Observable<ProfileDto> {
    return this.http.put<ProfileDto>(`${this.apiUrlUsers}/teacher/profile`, { curso: course });
  }

   changePassword(data: PasswordChangeData): Observable<any> {
    return this.http.post(`${this.apiUrlUsers}/auth/change-password`, data);
  }}
