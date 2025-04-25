import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface CategoryDTOShow {
  id: number;
  name: string;
  categoryimage: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Category`;

  constructor(private http: HttpClient) { }

  // New method to get all categories
  getAllCategories(): Observable<{ message: string, categoryDto: CategoryDTOShow[] }> {
    return this.http.get<{ message: string, categoryDto: CategoryDTOShow[] }>(
      `${this.apiUrl}/GetAllCategory`
    );
  }


}
