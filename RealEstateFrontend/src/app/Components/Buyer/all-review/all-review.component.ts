import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
interface Review {
  id: number;
  productName: string;
  rating: number;
  reviewText: string;
  store: string;
  date: Date;
  verified: boolean;
  imageUrl: string;
}
@Component({
  selector: 'app-all-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './all-review.component.html',
  styleUrl: './all-review.component.css'
})
export class AllReviewComponent {
  sortOrder: 'asc' | 'desc' = 'desc';
  reviews: Review[] = [
    {
      id: 1,
      productName: 'Mid-Century Lounge Chair',
      rating: 4.8,
      reviewText: 'This lounge chair is incredibly comfortable and looks even better in person. The walnut finish is beautiful!',
      store: 'ModernLiving',
      date: new Date('2023-05-15'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 2,
      productName: 'Industrial Coffee Table',
      rating: 3.5,
      reviewText: 'The metal frame is sturdy but the glass top scratches easily.',
      store: 'UrbanDecor',
      date: new Date('2023-04-02'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 3,
      productName: 'Scandinavian Bookshelf',
      rating: 5.0,
      reviewText: 'Absolutely perfect! Easy to assemble and holds all my books with room to spare.',
      store: 'NordicDesign',
      date: new Date('2023-03-18'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 4,
      productName: 'Convertible Sleeper Sofa',
      rating: 4.0,
      reviewText: 'Great space-saving solution for my studio apartment. The mattress could be thicker but it\'s comfortable enough for guests.',
      store: 'SpaceSavers',
      date: new Date('2023-02-05'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 5,
      productName: 'Glass Dining Table',
      rating: 2.5,
      reviewText: 'Looks elegant but arrived with a small chip in the glass. Customer service was slow to respond about a replacement.',
      store: 'ElegantLiving',
      date: new Date('2023-01-12'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 6,
      productName: 'Leather Recliner Chair',
      rating: 4.2,
      reviewText: 'The perfect chair for reading and relaxing. The leather is soft and the reclining mechanism works smoothly.',
      store: 'ComfortZone',
      date: new Date('2022-12-08'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    },
    {
      id: 7,
      productName: 'Rustic Farmhouse Table',
      rating: 4.7,
      reviewText: 'Beautiful solid wood construction. It\'s the centerpiece of our dining room and has held up well to family meals.',
      store: 'CountryLiving',
      date: new Date('2022-11-03'),
      verified: true,
      imageUrl: '/images/Home/Sofa.jpg'
    }
  ];

  get sortedReviews(): Review[] {
    return [...this.reviews].sort((a, b) => {
      if (this.sortOrder === 'desc') {
        return b.date.getTime() - a.date.getTime(); // Newest first
      } else {
        return a.date.getTime() - b.date.getTime(); // Oldest first
      }
    });
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
}