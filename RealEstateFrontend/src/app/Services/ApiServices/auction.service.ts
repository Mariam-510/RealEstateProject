import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { Observable } from 'rxjs';

export interface AuctionDTO {
  StartTime: Date;
  EndTime: Date;
  StartPrice: number;
  PropertyId: number;
}

export enum Status {
  Scheduled = 'Scheduled',
  Active = 'Active',
  Finished = 'Finished'
}

export interface AuctionDTOShow {
  Id: number;
  StartTime: string;         // ISO 8601 date string
  EndTime: string;           // ISO 8601 date string
  StartPrice: number;
  Status: Status;
  PropertyId: number;
  AgentId: number | null;
  SellerId: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Auction`;

  constructor(private http: HttpClient) { }

  createAuction(auctionDto: AuctionDTO): Observable<{ message: string, ActionShow: AuctionDTOShow }> {
    
    const formData = new FormData();
    
    // Convert dates to ISO strings and append to form data
    formData.append('StartTime', auctionDto.StartTime.toISOString());
    formData.append('EndTime', auctionDto.EndTime.toISOString());
    formData.append('StartPrice', auctionDto.StartPrice.toString());
    formData.append('PropertyId', auctionDto.PropertyId.toString());

    return this.http.post<{ message: string, ActionShow: AuctionDTOShow }>(
      `${this.apiUrl}/Add`,
      formData
    );
  }
}
