import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// DTO Interfaces
export interface AgentDto {
  id: number;
  name: string;
  commercialRegister: string;
  isDeleted: boolean;
  accountId?: string;
  email?: string;
  createdAt: string;
  imageUrl?: string;
  approvalStatus: string;
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

  constructor(private http: HttpClient) { }

  getAgents(approvalStatus?: string): Observable<AgentDto[]> {
    let params = new HttpParams();

    if (approvalStatus) {
      params = params.set('approvalStatus', approvalStatus);
    }

    return this.http.get<AgentDto[]>(`${this.apiUrl}/admin/approveAgent`, { params });
  }

  updateApprovalStatus(id: number, isApproved: boolean): Observable<any> {
    const formData = new FormData();
    formData.append('IsApproved', isApproved.toString());
    return this.http.put(`${this.apiUrl}/Approve/${id}`, formData);
  }

  getAgent(): Observable<AgentDto> {
    return this.http.get<AgentDto>(`${this.apiUrl}/Id`);
  }

  updateAgent(formData: FormData): Observable<{ message: string, tokenDto: any, agentDto: AgentDto }> {
    return this.http.put<{ message: string, tokenDto: any, agentDto: AgentDto }>(this.apiUrl, formData);
  }

  deleteAgent(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.apiUrl);
  }

}
