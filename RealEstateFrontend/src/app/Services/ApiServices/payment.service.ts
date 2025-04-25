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
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Payments`;

  constructor(private http: HttpClient) {}

  createPayPalOrder(amount: number): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.apiUrl}/PayPal`, amount);
  }

  createStripeCheckoutSession(
    amount: number
  ): Observable<{ url: string; sessionId: string }> {
    return this.http.post<{ url: string; sessionId: string }>(
      `${this.apiUrl}/create-stripe-checkout-session?amount=${amount}`,
      {}
    );
  }

  verifyStripePayment(
    sessionId: string
  ): Observable<{ success: boolean; paymentId: number }> {
    return this.http.get<{ success: boolean; paymentId: number }>(
      `${this.apiUrl}/verify-stripe-payment?sessionId=${sessionId}`
    );
  }
}
