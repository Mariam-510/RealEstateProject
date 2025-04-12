import { Component, Input } from '@angular/core';
import { ProductDto } from '../../Services/product.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Services/product.service';

@Component({
  selector: 'app-product-list-item',
  templateUrl: './product-list-item.component.html',
  styleUrls: ['./product-list-item.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProductListItemComponent {
  @Input() product!: ProductDto;

  constructor(public productService: ProductService) {}

  inWishlist: boolean = false;
  inCart: boolean = false;

  toggleWishlist(): void {
    this.inWishlist = !this.inWishlist;
  }

  toggleCart(): void {
    this.inCart = !this.inCart;
  }

  get fullStars(): number[] {
    return Array(Math.floor(this.product.averageRating)).fill(0);
  }

  get hasHalfStar(): boolean {
    return this.product.averageRating % 1 >= 0.5;
  }
}
