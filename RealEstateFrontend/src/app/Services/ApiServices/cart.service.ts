import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
import { OrderItemDto } from './order-item.service';


export interface CartDto {
  id: number;
  totalPrice: number;
  isDeleted: boolean;
  buyerId?: number;
  selectedAddressId?: number;
  orderItemDtos?: OrderItemDto[];
}

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Carts`;

  constructor(private http: HttpClient) { }

  // Get buyer's cart
  getCart(): Observable<CartDto> {
    return this.http.get<CartDto>(`${this.apiUrl}/Buyer`);
  }

}
