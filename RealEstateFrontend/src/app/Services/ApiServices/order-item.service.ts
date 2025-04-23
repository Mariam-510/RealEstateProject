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
  productImage?: string;
}

export interface CreateOrderItemRequest {
  ProductId: number;
  Quantity: number;
  Color: string;
}

export interface CreateOrderItemResponse {
  message: string;
  orderItemDto: OrderItemDto;
}

@Injectable({
  providedIn: 'root'
})
export class OrderItemService {
  private apiUrl = `${API_CONFIG.apiUrl}api/OrderItems`;

  constructor(private http: HttpClient) { }

  createOrderItem(request: CreateOrderItemRequest): Observable<CreateOrderItemResponse> {
    return this.http.post<CreateOrderItemResponse>(
      `${this.apiUrl}`,
      request
    );
  }

}
