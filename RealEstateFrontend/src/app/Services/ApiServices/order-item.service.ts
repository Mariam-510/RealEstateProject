import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// Add these interfaces to match your DTOs
export interface OrderItemDto {
  id: number;
  quantity: number;
  color: string;
  price: number;
  isDeleted: boolean;
  cartId?: number;
  orderId?: number;
  productId?: number;
  productName?: string;
  productDescription?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Carts`;

  constructor(private http: HttpClient) { }

}
