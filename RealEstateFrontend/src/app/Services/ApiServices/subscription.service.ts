import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../../app.config';
import { SubscriptionPlanDto } from './subscription-plan.service';
import { Observable, Subject, tap } from 'rxjs';
export interface SubscriptionDto {
  id: number;
  availableProperties: number;
  subscriptionPlanId?: number;
  sellerId?: number;
  agentId?: number;
  paymentId?: number;
  subscriptionDate: Date;
  subscriptionPlan?: SubscriptionPlanDto;
}

// Add CreateSubscriptionDto interface
export interface CreateSubscriptionDto {
  SubscriptionPlanId: number;
  PaymentId?: number;
}
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Subscriptions`;

  private subscriptionUpdated = new Subject<void>();  // Subject to track updates
  subscriptionUpdated$ = this.subscriptionUpdated.asObservable();  // Observable for external subscribers

  constructor(private http: HttpClient) { }

  // Notify subscribers that the subscription has been updated
  notifySubscriptionUpdated() {
    this.subscriptionUpdated.next();
  }

  getCurrentUserSubscription(): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(`${this.apiUrl}/user`);
  }

  // New method to update subscription
  updateSubscription(dto: CreateSubscriptionDto): Observable<any> {
    return this.http.put(`${this.apiUrl}`, dto).pipe(
      tap(() => {
        // Notify subscribers after successful update
        this.notifySubscriptionUpdated();
      })
    );
  }
}
