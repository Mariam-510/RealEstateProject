import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-add-review',
  imports: [CommonModule, FormsModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.css'
})
export class AddReviewComponent {

  constructor(
    public dialogRef: MatDialogRef<AddReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, 
   ) {}

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


submitReview() {
if (!this.selectedRating) {
 alert('Please select a star rating before submitting.');
  return;
}
if (this.isMaxLengthExceeded) {
  return;
}
alert('Review submitted successfully!');
this.dialogRef.close({
  rating: this.selectedRating,
  review: this.reviewText
});
}

closeDialog(): void {
 this.dialogRef.close();
} 
}