import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
import { map } from 'rxjs/operators';

// Define interfaces matching your DTOs
export interface ProductStockDto {
  id: number;
  color: string;
  quantity: number;
  isDeleted: boolean;
  productId?: number;
}

export interface ProductDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  isUsed: boolean;
  averageRating: number;
  numberOfReviews: number;
  isDeleted: boolean;
  dateAdded: Date;
  categoryID: number;
  categoryName: string;
  productimage: string[];
  productStockDtos?: ProductStockDto[];
  isFavorite: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Products`;

  constructor(private http: HttpClient) { }

  // Get buyer's cart
  getProductById(id: number): Observable<ProductDTO> {
    return this.http.get<ProductDTO>(`${this.apiUrl}/GetbyId/${id}`);
  }



}
