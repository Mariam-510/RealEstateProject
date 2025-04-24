import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// shipping.dto.ts
export interface ShippingDto {
  id: number;
  city: string;
  deliveryFees: number;
  isDeleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ShippingService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Shippings`;

  constructor(private http: HttpClient) { }


  // Add this method to get shipping info by city
  getByCity(city: string): Observable<ShippingDto> {
    return this.http.get<ShippingDto>(`${this.apiUrl}/City/${city}`);
  }
}
