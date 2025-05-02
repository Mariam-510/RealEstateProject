import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface BuyerDto {
  id: number;
  firstName: string;
  lastName?: string;
  isDeleted: boolean;
  accountId?: string;
  email?: string;
  createdAt: string;
  imageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Buyers`;

  constructor(private http: HttpClient) { }

  getBuyer(): Observable<BuyerDto> {
    return this.http.get<BuyerDto>(`${this.apiUrl}/Id`);
  }

  updateBuyer(formData: FormData): Observable<{ message: string, tokenDto: any, buyerDto: BuyerDto }> {
    return this.http.put<{ message: string, tokenDto: any, buyerDto: BuyerDto }>(this.apiUrl, formData);
  }
  getBuyerById(buyerId: number): Observable<BuyerDto> {
    return this.http.get<BuyerDto>(`${this.apiUrl}/${buyerId}`);
  }


}
