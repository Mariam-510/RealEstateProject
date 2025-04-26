// subscription-plan.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private apiUrl = `${API_CONFIG.apiUrl}api/SubscriptionPlans`;

  constructor(private http: HttpClient) { }

  createSubscriptionPlan(planData: any): Observable<any> {
    return this.http.post(this.apiUrl, planData);
  }
}