import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

export interface SellerDto {
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
export class SellerService {

  private apiUrl = `${API_CONFIG.apiUrl}api/Sellers`;

  constructor(private http: HttpClient) { }

  getSeller(): Observable<SellerDto> {
    return this.http.get<SellerDto>(`${this.apiUrl}/Id`);
  }

  updateSeller(formData: FormData): Observable<{ message: string, tokenDto: any, sellerDto: SellerDto }> {
    return this.http.put<{ message: string, tokenDto: any, sellerDto: SellerDto }>(this.apiUrl, formData);
  }

}
