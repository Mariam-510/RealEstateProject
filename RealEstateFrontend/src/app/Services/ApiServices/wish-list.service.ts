import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// Add DTO interface
export interface WishListProductDTO {
  ProductId: number;
}


@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = `${API_CONFIG.apiUrl}api/WishList`;

  constructor(private http: HttpClient) { }

  // Add this method
  // toggleProductWishlist(productId: number): Observable<string> {
  //   const dto: WishListProductDTO = { ProductId: productId };
  //   return this.http.post<string>(
  //     `${this.apiUrl}/ToggleProductWishlist`,
  //     dto,
  //   );
  // }

  toggleProductWishlist(productId: number): Observable<string> {
    const dto: WishListProductDTO = { ProductId: productId };
    return this.http.post(
      `${this.apiUrl}/ToggleProductWishlist`,
      dto,
      { responseType: 'text' }  // <--- Add this
    );
  }

}
