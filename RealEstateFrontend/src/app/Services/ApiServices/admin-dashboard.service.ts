import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';
export interface DashboardTotals {
  totalSellers: number;
  totalAgents: number;
  totalBuyers: number;
  totalUsers: number;
  activeAuctions: number;
  availableProperties: number;
  soldProperties: number;
  saleProperties: number;
  rentProperties: number;
  usedProducts: number;
  newProducts: number;
  totalOrders: number;
  soldProducts: number;
  totalProducts: number;
  highestSellBid: number;
  highestRentBid: number;
  upcomingAuctions: number;
  endingAuctions: number;
  activeAuctionsPrecentage: number;
  categoryPercentages: { [key: string]: number };
  subscriptionPlans: string[];         // Array of plan names
  subscriptionCounts: { [key: string]: number }; // Counts by plan name
  topProducts: { productName: string, totalSold: number }[];


}
@Injectable({
  providedIn: 'root'
})

export class AdminDashboardService  {
  private apiUrl = `${API_CONFIG.apiUrl}api/AdminDashboard`;

  // private apiUrl = 'api/AdminDashboard'; // Adjust the base URL as needed

  constructor(private http: HttpClient) { }

  getTotals(): Observable<DashboardTotals> {
    return this.http.get<DashboardTotals>(`${this.apiUrl}/totals`);
  }
  
}
