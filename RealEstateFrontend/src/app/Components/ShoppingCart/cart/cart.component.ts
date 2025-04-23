import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartDto, CartService } from '../../../Services/ApiServices/cart.service';
import { catchError, Observable, of, startWith, switchMap } from 'rxjs';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { API_CONFIG } from '../../../app.config';
import { EditOrderItemDto, OrderItemDto, OrderItemService } from '../../../Services/ApiServices/order-item.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {

  apiConfig = API_CONFIG;

  cart$: Observable<CartDto | null>;

  constructor(private cartService: CartService, private auth: AuthService,
    private orderItemService: OrderItemService
  ) {
    this.cart$ = this.cartService.cartUpdated$.pipe(
      startWith(null),
      switchMap(() => {
        if (this.hasRole("Buyer")) {
          return this.cartService.getCart().pipe(
            catchError(() => of(null))
          );
        }
        return of(null);
      })
    );
  }

  ngOnInit() { }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('Cart cleared:', response.message);
        console.log('Updated cart:', response.cartDto);
        this.cartService.notifyCartUpdated(); // Update UI components
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
      }
    });
  }

  deleteItem(orderItemId: number) {
    this.orderItemService.deleteOrderItem(orderItemId).subscribe({
      next: (response) => {
        this.cartService.notifyCartUpdated(); // Update UI components
        console.log('Deleted:', response.message);
        // Update your UI or cart data here
      },
      error: (err) => {
        console.error('Delete failed:', err);
      }
    });
  }


  handleDecrement(item: OrderItemDto): void {
    if (item.quantity === 1) {
      this.deleteItem(item.id);
    } else {
      this.updateQuantity(item.id, item.quantity - 1, item.color);
    }
  }

  handleIncrement(item: OrderItemDto): void {
    this.updateQuantity(item.id, item.quantity + 1, item.color);
  }

  private updateQuantity(itemId: number, newQuantity: number, color: string): void {
    const updateDto: EditOrderItemDto = {
      Color: color,
      Quantity: newQuantity
    };

    this.orderItemService.updateOrderItem(itemId, updateDto).subscribe({
      next: (response) => {
        console.log('Updated:', response.message);
        // Update local cart data
        this.cartService.notifyCartUpdated(); // Update UI components
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert(err.error?.message || 'Failed to add to cart');
      }
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
