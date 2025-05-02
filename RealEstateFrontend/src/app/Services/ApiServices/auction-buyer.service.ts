import { Injectable } from '@angular/core';
import { API_CONFIG } from '../../app.config';
import { HttpClient } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class AuctionBuyerService {
  private apiUrl = `${API_CONFIG.apiUrl}api/AuctionBuyers`;

  constructor(private http: HttpClient) { }

}
