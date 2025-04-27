import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
import { ProductDTO } from './product.service';
import { PropertyDTO } from './property.service';

// Add DTO interface
export interface WishListProductDTO {
  ProductId: number;
}

export interface WishListPropertyDTO {
  PropertyID: number;
}


@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = `${API_CONFIG.apiUrl}api/WishList`;

  constructor(private http: HttpClient) { }

  toggleProductWishlist(productId: number): Observable<string> {
    const dto: WishListProductDTO = { ProductId: productId };
    return this.http.post(
      `${this.apiUrl}/ToggleProductWishlist`,
      dto,
      { responseType: 'text' }  // <--- Add this
    );
  }

  // Updated method name and parameters for properties
  togglePropertyWishlist(propertyId: number): Observable<string> {
    const dto: WishListPropertyDTO = { PropertyID: propertyId };
    return this.http.post(
      `${this.apiUrl}/TogglePropertyWishlist`, // Match endpoint route
      dto,
      { responseType: 'text' }
    );
  }
// In WishListService
getAllProductsByBuyerId(): Observable<ProductDTO[]> {
  return this.http.get<ProductDTO[]>(`${this.apiUrl}/GetAllProductByBuyerID`);
}

getAllPropertiesByBuyerId(): Observable<PropertyDTO[]> {
  return this.http.get<PropertyDTO[]>(`${this.apiUrl}/GetAllPropertyByBuyerID`);
}
}
