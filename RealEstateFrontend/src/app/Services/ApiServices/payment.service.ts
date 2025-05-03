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

  createStripeSession(
    amount: number,
    selectedAddressId: number
  ): Observable<{ sessionId: string }> {
    const body = {
      amount: amount,
      selectedAddressId: selectedAddressId,
    };
    return this.http.post<{ sessionId: string }>(
      `${this.apiUrl}/Stripe/CreateSession`,
      body
    );
  }

  createStripePayment(amount: number): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.apiUrl}/Stripe`, amount);
  }

  verifyStripeSession(sessionId: string): Observable<PaymentDto> {
    return this.http.post<PaymentDto>(`${this.apiUrl}/Stripe/VerifySession`, {
      sessionId,
    });
  }

  createStripeAuctionSession(amount: number, auctionId: number): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(
      `${this.apiUrl}/Stripe/CreateAuctionSession`, 
      { amount, auctionId }
    );
  }
}
