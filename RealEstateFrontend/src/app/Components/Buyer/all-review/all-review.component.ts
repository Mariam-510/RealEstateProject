import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ReviewResponseDto, ReviewService } from '../../../Services/ApiServices/review.service';
import { API_CONFIG } from '../../../app.config';
@Component({
  selector: 'app-all-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-review.component.html',
  styleUrl: './all-review.component.css'
})
export class AllReviewComponent implements OnInit {
  apiConfig = API_CONFIG;

  constructor(private router: Router, private auth: AuthService, private reviewService: ReviewService) { }

  reviews: ReviewResponseDto[] = []

  ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }
    // Call the service after role check
    this.loadReviews();
  }

  private loadReviews(): void {
    this.reviewService.getCurrentBuyerReviews().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        // Handle error (show message, etc.)
      }
    });
  }

  sortOrder: 'asc' | 'desc' = 'desc';

  get sortedReviews(): ReviewResponseDto[] {
    return [...this.reviews].sort((a, b) => {
      // Convert date strings to timestamps
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      // Handle potential invalid dates (optional)
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0; // or handle differently if needed
      }

      // Sort based on current order
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  deleteReview(reviewId: number): void {
    if (confirm('Are you sure you want to delete this review?')) {
      this.reviewService.deleteReview(reviewId).subscribe({
        next: () => {
          // Remove the deleted review from the local array
          this.reviews = this.reviews.filter(r => r.id !== reviewId);
          // Or refresh the list entirely
          // this.loadReviews();

          // Show success message
          alert('Review deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete review:', err);
          alert('Failed to delete review. Please try again.');
        }
      });
    }
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
  }

  // Helper function to generate star icons based on rating
  getStars(rating: number): { full: number, half: boolean, empty: number } {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return { full, half, empty };
  }

  // Format date for display
  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }
}
