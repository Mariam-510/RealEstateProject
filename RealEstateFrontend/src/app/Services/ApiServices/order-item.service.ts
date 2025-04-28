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
  categoryName?: string;
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

export interface EditOrderItemDto {
  Color: string;
  Quantity: number;
}

export interface EditOrderItemResponse {
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

  // Add to your OrderItemService
  deleteOrderItem(id: number): Observable<any> {
    return this.http.delete<any>(
      `${this.apiUrl}/${id}`
    );
  }

  // Add to your OrderItemService
  updateOrderItem(id: number, dto: EditOrderItemDto): Observable<EditOrderItemResponse> {
    return this.http.put<EditOrderItemResponse>(
      `${this.apiUrl}/${id}`,
      dto
    );
  }

  getAllByOrder(orderId: number): Observable<OrderItemDto[]> {
    return this.http.get<OrderItemDto[]>(
      `${this.apiUrl}/Order/${orderId}`
    );
  }

}
