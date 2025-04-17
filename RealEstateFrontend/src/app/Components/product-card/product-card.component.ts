import { Component, Input, OnInit } from '@angular/core';
import { ProductDto } from '../../Services/product.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Services/product.service';
import { CartService } from '../../Services/cart.service';
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProductCardComponent implements OnInit {
  @Input() product!: ProductDto;
  isHovered = false;
  inWishlist: boolean = false;
  inCart: boolean = false;

  constructor(
    public productService: ProductService,
    private cartService: CartService
  ) {}
  ngOnInit() {
    this.cartService.cartItems$.subscribe((items) => {
      this.inCart = items.some((item) => item.product.id === this.product.id);
    });
  }

  toggleWishlist(): void {
    this.inWishlist = !this.inWishlist;
  }

  toggleCart(): void {
    if (this.inCart) {
      this.cartService.removeItem(this.product.id);
    } else {
      this.cartService.addToCart(this.product);
    }
  }

  setFallbackImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/fallback.jpg';
  }

  get fullStars(): number[] {
    return Array(Math.floor(this.product.averageRating)).fill(0);
  }

  get hasHalfStar(): boolean {
    return this.product.averageRating % 1 >= 0.5;
  }

  get emptyStars(): number[] {
    const totalDisplayed =
      Math.floor(this.product.averageRating) + (this.hasHalfStar ? 1 : 0);
    return Array(5 - totalDisplayed).fill(0);
  }

  isNewArrival(): boolean {
    const today = new Date();
    const dateAdded = new Date(this.product.dateAdded);
    const diffInTime = today.getTime() - dateAdded.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);
    return diffInDays <= 30;
  }

  isLowStock(): boolean {
    return this.product.quantity <= 5;
  }

  isSingleLeft(): boolean {
    return this.product.quantity === 1;
  }
}
