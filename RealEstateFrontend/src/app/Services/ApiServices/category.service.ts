import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Category`;

  constructor(private http: HttpClient) {}

  createCategory(categoryData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/CreateCategory`, categoryData);
  }
}
