import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Agent {
  id: number;
  name: string;
  commercialRegister: string;
  accountId?: string;
  email?: string;
  createdAt: string;
  imageUrl?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
}

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${API_CONFIG.apiUrl}api/admin`;

  constructor(private http: HttpClient) {}

  getAgents(approvalStatus?: string): Observable<Agent[]> {
    const params: any = {};
    if (approvalStatus) params.approvalStatus = approvalStatus;
    else params.approvalStatus = 'Pending';
    return this.http.get<Agent[]>(`${this.apiUrl}/approveAgent`, { params });
  }

  updateStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

}
