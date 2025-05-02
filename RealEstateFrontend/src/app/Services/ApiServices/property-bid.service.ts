import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { Observable } from 'rxjs';

export interface PropertyBidDto {
  id: number;
  bidAmount: number;
  auctionId: number;
  buyerId: number;
  timestamp: Date;
  timeAgo: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerImage: string;
}

export interface CreatePropertyBidDto {
  bidAmount: number;
  auctionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyBidService {

  private apiUrl = `${API_CONFIG.apiUrl}api/PropertyBid`;

  constructor(private http: HttpClient) { }

  // Get last bid for an auction
  getLastBidByAuctionId(auctionId: number): Observable<PropertyBidDto> {
    return this.http.get<PropertyBidDto>(`${this.apiUrl}/LastBid/${auctionId}`);
  }

  // Get all bids for an auction
  getBidsByAuctionId(auctionId: number): Observable<PropertyBidDto[]> {
    return this.http.get<PropertyBidDto[]>(`${this.apiUrl}/auction/${auctionId}`);
  }

  createBid(createDto: CreatePropertyBidDto): Observable<PropertyBidDto> {
    return this.http.post<PropertyBidDto>(
      `${this.apiUrl}`,
      createDto
    );
  }

}
