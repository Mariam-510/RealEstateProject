import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Correct import
import { API_CONFIG } from '../../app.config';
import { Observable } from 'rxjs';

// Add your DTO interfaces
export interface CreateAuctionBuyerDto {
  auctionId: number;
  paymentId: number;
}

export interface AuctionBuyerDto {
  id: number;
  date: Date;
  isDeleted: boolean;
  buyerId?: number;
  auctionId?: number;
  paymentId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionBuyerService {
  private apiUrl = `${API_CONFIG.apiUrl}api/AuctionBuyers`;

  constructor(private http: HttpClient) { }

  // Get Auction Buyer by Auction ID
  getByAuctionAndBuyerId(auctionId: number): Observable<AuctionBuyerDto> {
    return this.http.get<AuctionBuyerDto>(`${this.apiUrl}/AuctionBuyer/${auctionId}`);
  }

  // Create new Auction Buyer
  createAuctionBuyer(createDto: CreateAuctionBuyerDto): Observable<{ message: string, auctionBuyerDto: AuctionBuyerDto }> {
    return this.http.post<{ message: string, auctionBuyerDto: AuctionBuyerDto }>(this.apiUrl, createDto);
  }
}
