import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
import { SubscriptionPlanDto } from './subscription-plan.service';
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
@Injectable({
  providedIn: 'root'
})
 export class SubscriptionService {
    private apiUrl = `${API_CONFIG.apiUrl}api/Subscriptions`;

    constructor(private http: HttpClient) { }

    getCurrentUserSubscription(): Observable<SubscriptionDto> {
      return this.http.get<SubscriptionDto>(`${this.apiUrl}/user`);
    }
}
