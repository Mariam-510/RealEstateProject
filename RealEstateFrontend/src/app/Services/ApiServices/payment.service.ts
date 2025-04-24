import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface PaymentDto {
  id: number;
  paidAt: string;
  amount: number;
  paymentMethod: string;
  buyerId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Payments`;

  constructor(private http: HttpClient) { }

  createPayPalOrder(amount: number): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.apiUrl}/PayPal`, amount);
  }
}
