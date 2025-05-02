import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';


export interface CreateOrderDto {
  paymentId: number | null;
  deliveryFees: number;
  addressId: number;
}
export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  OutForDelivery = 2,
  Delivered = 3,
  Cancelled = 4
}
export interface OrderResponseDto {
  id: number;
  orderDate: string;         // ISO 8601 format (e.g., "2023-10-05T12:34:56Z")
  status: string;            // Update to union type if status values are known
  statusNum: number;            // Update to union type if status values are known
  subTotal: number;
  deliveryFees: number;
  isDeleted: boolean;
  buyerId: number | null;
  addressId: number | null;
  paymentId: number | null;
  paymentMethod: string | null;
}
export interface UpdateOrderDto {
  id: number;
  status: OrderStatus;  
}
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Orders`;

  constructor(private http: HttpClient) { }

  placeOrder(orderData: CreateOrderDto): Observable<OrderResponseDto> {
    return this.http.post<OrderResponseDto>(
      `${this.apiUrl}/placeOrder`,
      orderData
    );
  }

  getById(id: number): Observable<OrderResponseDto> {
    return this.http.get<OrderResponseDto>(
      `${this.apiUrl}/getById/${id}`
    );
  }

  getAllByBuyer(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/buyer`);
  }
  getAll(): Observable<OrderResponseDto[]> {
    return this.http.get<OrderResponseDto[]>(`${this.apiUrl}/all`);
  }
  updateOrder(updateData: UpdateOrderDto): Observable<OrderResponseDto> {
    return this.http.put<OrderResponseDto>(`${this.apiUrl}`, updateData);
  }
}
