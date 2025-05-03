import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CreateReviewRequest, ReviewService } from '../../../Services/ApiServices/review.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-add-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css'
})
export class AddReviewComponent {

  constructor(
    public dialogRef: MatDialogRef<AddReviewComponent>, private router: Router,
    private auth: AuthService, private reviewService: ReviewService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }
  }

  selectedRating: number | null = null;
  hoveredRating: number | null = null;
  reviewText: string = '';
  isMaxLengthExceeded: boolean = false;
  maxCharacters: number = 150;

  hoverRating(rating: number) {
    this.hoveredRating = rating;
  }

  clearHover() {
    this.hoveredRating = null;
  }

  selectRating(rating: number) {
    this.selectedRating = rating;
  }
  validateReview() {
    this.isMaxLengthExceeded = this.reviewText.length >= this.maxCharacters;
  }

  async submitReview() {
    // Validate required fields
    if (!this.selectedRating) {
      this.toastr.error('Please select a star rating before submitting');
      return;
    }
    if (this.isMaxLengthExceeded) {
      return;
    }

    try {
      // Create the review request DTO
      const reviewRequest: CreateReviewRequest = {
        productId: this.data.productId,  // Make sure productId is passed in dialog data
        rating: this.selectedRating,
        comment: this.reviewText
      };

      // Call the service
      const response = await lastValueFrom(
        this.reviewService.createReview(reviewRequest)
      );

      // Handle success
      console.log('API response:', response);
      this.toastr.success('Review submitted successfully!');

      // Close dialog with result
      this.dialogRef.close({
        rating: this.selectedRating,
        review: this.reviewText,
        serverResponse: response  // Optional: pass API response
      });

    } catch (error) {
      console.error('Error submitting review:', error);
      this.toastr.error('Failed to submit review. Please try again.');
      // Optional: Keep dialog open on error
      // this.dialogRef.close();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
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
