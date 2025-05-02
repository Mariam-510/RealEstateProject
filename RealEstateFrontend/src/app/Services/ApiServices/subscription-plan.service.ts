// subscription-plan.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
export interface SubscriptionPlanDto {
  id: number;
  name: string;
  price: number;
  maxAllowedProperties: number;
  description: string;
}
@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private apiUrl = `${API_CONFIG.apiUrl}api/SubscriptionPlans`;

  constructor(private http: HttpClient) { }

  createSubscriptionPlan(planData: any): Observable<any> {
    return this.http.post(this.apiUrl, planData);
  }
  getAll(): Observable<SubscriptionPlanDto[]> {
    return this.http.get<SubscriptionPlanDto[]>(this.apiUrl);
  } 
}