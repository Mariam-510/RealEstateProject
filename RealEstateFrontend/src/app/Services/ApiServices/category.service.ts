import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface CategoryDTOShow {
  id: number;
  name: string;
  categoryimage: string;
}
=======
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
>>>>>>> IbrahimFront7

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Category`;
<<<<<<< HEAD

  constructor(private http: HttpClient) { }

  // New method to get all categories
  getAllCategories(): Observable<{ message: string, categoryDto: CategoryDTOShow[] }> {
    return this.http.get<{ message: string, categoryDto: CategoryDTOShow[] }>(
      `${this.apiUrl}/GetAllCategory`
    );
  }


=======

  constructor(private http: HttpClient) {}

  createCategory(categoryData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/CreateCategory`, categoryData);
  }
>>>>>>> IbrahimFront7
}
