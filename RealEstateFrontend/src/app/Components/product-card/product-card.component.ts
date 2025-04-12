import { Component, Input } from '@angular/core';
import { ProductDto } from '../../Services/product.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../Services/product.service';
@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProductCardComponent {
  @Input() product!: ProductDto;
  isHovered = false;
  
  constructor(public productService: ProductService) {}

  inWishlist: boolean = false;
  inCart: boolean = false;

  toggleWishlist(): void {
    this.inWishlist = !this.inWishlist;
  }

  toggleCart(): void {
    this.inCart = !this.inCart;
  }

  setFallbackImage(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/fallback.jpg';
  }
  
}
