// admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Admins`;

  constructor(private http: HttpClient) {}

  createAdmin(adminData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, adminData);
  }
}
