import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { Observable } from 'rxjs';
import { PropertyDTO } from './property.service';
import { PropertyBidDto } from './property-bid.service';
import { SignalRService } from '../SignalRServices/signal-r.service';

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
  id: number;
  startTime: Date;         // ISO 8601 date string
  endTime: Date;           // ISO 8601 date string
  startPrice: number;
  status: string;
  propertyId: number;
  agentId: number | null;
  sellerId: number | null;
  propertyDto: PropertyDTO | null;
  lastPropertyBidDto: PropertyBidDto | null;
  bids: PropertyBidDto[];
  numOfPropertyBids: number | null;
  timeProgress: number | null;
  mouseStartX?: number | null;
  currentImageIndex: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuctionService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Auction`;

  constructor(private http: HttpClient, private signalR: SignalRService) { }

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

  getHighestBidForEndedAuctions(): Observable<{ highestBid: number, property: PropertyDTO }> {
    return this.http.get<{ highestBid: number, property: PropertyDTO }>(`${this.apiUrl}/GetHighestBid`);
  }

  //-----------------------------------------------------------------------------------------------
  getAllAuctions(
    sortByPrice?: string,
    sortByTime?: string,
    ISLivestatus?: Status
  ): Observable<AuctionDTOShow[]> {
    let params = new HttpParams();

    // Append parameters if they are provided
    if (sortByPrice) {
      params = params.append('sortByPrice', sortByPrice);
    }
    if (sortByTime) {
      params = params.append('sortByTime', sortByTime);
    }
    if (ISLivestatus) {
      params = params.append('ISLivestatus', ISLivestatus);
    }

    return this.http.get<AuctionDTOShow[]>(`${this.apiUrl}/GetAll`, { params });
  }

  //-----------------------------------------------------------------------------------------------
  // Add to AuctionService
  getAuctionById(id: number): Observable<AuctionDTOShow> {
    return this.http.get<AuctionDTOShow>(`${this.apiUrl}/GetAuctionByID/${id}`);
  }

  //-----------------------------------------------------------------------------------------------
  // In AuctionService
  getAuctionByPropertyId(propertyId: number): Observable<AuctionDTOShow> {
    return this.http.get<AuctionDTOShow>(`${this.apiUrl}/Property/${propertyId}`);
  }
}
