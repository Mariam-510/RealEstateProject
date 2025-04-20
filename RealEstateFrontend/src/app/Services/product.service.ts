import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProductDto {
  id: number;
  name: string;
  description: string | undefined;
  price: number;
  quantity: number;
  isUsed: boolean;
  isDeleted: boolean;
  categoryID: number;
  categoryName: string;
  productimage: string[];
  averageRating: number;
  numberOfReviews: number;
  dateAdded: Date;
}

export interface ApiResponse {
  message: string;
  productDtoList: ProductDto[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'https://localhost:7184/api/Products';
  fallbackImageUrl = '/Images/ErrorImage.jpg';

  constructor(private http: HttpClient) {}


  getProducts(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.apiUrl}/GetAll`
    );
  }

  // Additional useful methods
  getAllProducts(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}`);
  }

  getProductById(id: number): Observable<ProductDto> {
    return this.http.get<ProductDto>(`${this.apiUrl}/${id}`);
  }

  setFallbackImageForCard(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.fallbackImageUrl; // Use the stored fallback image
  }
}
