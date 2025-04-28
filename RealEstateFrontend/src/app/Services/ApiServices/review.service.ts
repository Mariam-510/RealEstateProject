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
  productName?: string;
  productImage?: string;
  categoryName?: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment?: string;
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

  createReview(reviewData: CreateReviewRequest): Observable<ReviewResponseDto> {
    return this.http.post<ReviewResponseDto>(
      `${this.apiUrl}/Create`,
      reviewData
    );
  }

  // Get all reviews for the current buyer
  getCurrentBuyerReviews(): Observable<ReviewResponseDto[]> {
    return this.http.get<ReviewResponseDto[]>(`${this.apiUrl}/GetAll`);
  }

  deleteReview(reviewId: number): Observable<string> {
    return this.http.delete(
      `${this.apiUrl}/Delete/${reviewId}`,
      {
        responseType: 'text' as const
      }
    );
  }


}
