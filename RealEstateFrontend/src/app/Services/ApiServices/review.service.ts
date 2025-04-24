import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../../app.config';

// Add DTO interface matching the C# ReviewResponseDto
export interface ReviewResponseDto {
  id: number;
  rating: number;
  comment?: string;
  date: string;  // Will be ISO string from C# DateTime
  buyerId?: number;
  buyerFName?: string;
  buyerLName?: string;
  buyerImageUrl?: string;
  productId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${API_CONFIG.apiUrl}api/Reviews`;

  constructor(private http: HttpClient) { }

  // Get reviews by product ID
  getReviewsByProduct(productId: number): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.apiUrl}/ByProduct/${productId}`);
  }

}
