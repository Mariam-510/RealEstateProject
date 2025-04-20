// cart-icon.component.ts
import { Component } from '@angular/core';
import { CartService } from '../../Services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <a routerLink="/cart" class="position-relative">
      <i class="bi bi-cart fs-4"></i>
      <span
        *ngIf="itemCount > 0"
        class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
      >
        {{ itemCount }}
      </span>
    </a>
  `,
  styles: [
    `
      a {
        color: inherit;
        text-decoration: none;
      }
      .badge {
        font-size: 0.6rem;
      }
    `,
  ],
})
export class CartIconComponent {
  itemCount = 0;

  constructor(private cartService: CartService) {
    this.cartService.cartItems$.subscribe((items) => {
      this.itemCount = items.reduce((total, item) => total + item.quantity, 0);
    });
  }
}
