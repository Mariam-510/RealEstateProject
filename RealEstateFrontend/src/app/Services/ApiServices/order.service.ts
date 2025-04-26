import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';


export interface CreateOrderDto {
  paymentId: number | null;
  deliveryFees: number;
  addressId: number;
}


export interface OrderResponseDto {
  id: number;
  orderDate: string;         // ISO 8601 format (e.g., "2023-10-05T12:34:56Z")
  status: string;            // Update to union type if status values are known
  subTotal: number;
  deliveryFees: number;
  isDeleted: boolean;
  buyerId: number | null;
  addressId: number | null;
  paymentId: number | null;
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

}
