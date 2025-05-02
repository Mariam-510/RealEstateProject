// admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface AdminDto {
  id: number;
  name: string;
  isDeleted: boolean;
  accountId?: string;
  email?: string;
  createdAt: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Admins`;

  constructor(private http: HttpClient) { }

  createAdmin(adminData: FormData): Observable<any> {
    return this.http.post(this.apiUrl, adminData);
  }


  getAdmin(): Observable<AdminDto> {
    return this.http.get<AdminDto>(`${this.apiUrl}/Id`);
  }

  updateAdmin(formData: FormData): Observable<{ message: string, tokenDto: any, adminDto: AdminDto }> {
    return this.http.put<{ message: string, tokenDto: any, adminDto: AdminDto }>(this.apiUrl, formData);
  }
}
