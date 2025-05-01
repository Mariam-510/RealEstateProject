import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO Interfaces
export interface agentDto{
  id: number;
  name: string;
  commercialRegister: string;
  email?: string;
  phone?: string;
  createdAt: string;
  approvalStatus: string;
  processedDate?: string;
  imageUrl?: string;
}


// export enum approvalStatus {
//   Pending = 'Pending',
//   Approved = 'Approved',
//   Rejected = 'Rejected'
// }

@Injectable({
  providedIn: 'root'
})
export class AgentService {
  private apiUrl = `${API_CONFIG.apiUrl}api/agents`;

  constructor(private http: HttpClient) {}

  getAgents(approvalStatus?: string): Observable<agentDto[]> {
    let params = new HttpParams();
    
    if (approvalStatus) {
      params = params.set('approvalStatus', approvalStatus);
    }

    return this.http.get<agentDto[]>(`${this.apiUrl}/admin/approveAgent`, { params });
  }

  updateApprovalStatus(id: number, isApproved: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('IsApproved', isApproved.toString());
    return this.http.put(`${this.apiUrl}/Approve/${id}`, formData);
  }
  
}
