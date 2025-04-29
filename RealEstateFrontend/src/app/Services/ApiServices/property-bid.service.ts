import { Injectable } from '@angular/core';

export interface PropertyBidDto {
  id: number;
  bidAmount: number;
  auctionId: number;
  buyerId: number;
  timestamp: Date;
  timeAgo: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyBidService {

  constructor() { }
}
