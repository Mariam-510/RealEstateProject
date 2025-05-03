import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartDto, CartService } from '../../../Services/ApiServices/cart.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { API_CONFIG } from '../../../app.config';
import { EditOrderItemDto, OrderItemDto, OrderItemService } from '../../../Services/ApiServices/order-item.service';
import { ToastrService } from '../../../Services/toastr.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  apiConfig = API_CONFIG;
  localCart: CartDto | null = null; // Local copy of cart data

  constructor(
    private cartService: CartService,
    private auth: AuthService,
    private orderItemService: OrderItemService,
    private router: Router,
    private toaster: ToastrService // Inject Router
  ) { }

  isLoading = true;

  ngOnInit() {
    if (!this.hasRole('Buyer')) {
      // Redirect to login if not Buyer
      this.router.navigate(['/login']);
    } else {
      this.loadInitialCart();
    }
  }

  private loadInitialCart() {
    if (this.hasRole("Buyer")) {
      this.cartService.getCart().subscribe(cart => {
        this.localCart = cart; // Store initial copy locally
      });
      this.isLoading = false;
    }
  }

  get cart(): CartDto | null {
    return this.localCart ? { ...this.localCart } : null; // Return read-only copy
  }

  clearCart() {
    if (!this.localCart) return;

    const originalCart = { ...this.localCart }; // Backup for rollback
    this.localCart = { ...this.localCart, orderItemDtos: [], totalPrice: 0 };

    this.cartService.clearCart().subscribe({
      next: (response) => {
        console.log('Updated:', response.message);
        // Update local cart data
        this.cartService.notifyCartUpdated();
      },
      error: (err) => {
        this.localCart = originalCart; // Rollback on error
        console.error('Error clearing cart:', err);
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

  deleteItem(orderItemId: number) {
    if (!this.localCart) return;

    const originalCart = { ...this.localCart };
    const updatedItems = this.localCart.orderItemDtos?.filter(item => item.id !== orderItemId) || [];

    this.localCart = {
      ...this.localCart,
      orderItemDtos: updatedItems,
      totalPrice: updatedItems.reduce((sum, item) => sum + item.price, 0)
    };

    this.orderItemService.deleteOrderItem(orderItemId).subscribe({
      next: (response) => {
        console.log('Updated:', response.message);
        // Update local cart data
        this.cartService.notifyCartUpdated();
      },
      error: (err) => {
        this.localCart = originalCart;
        console.error('Error adding to cart:', err);
        this.toaster.error(err.error?.message || 'Failed to add to cart');
      }
    });
  }

  private updateQuantity(itemId: number, newQuantity: number, color: string): void {
    if (!this.localCart) return;

    const originalCart = { ...this.localCart };
    const updatedItems = this.localCart.orderItemDtos?.map(item => {
      if (item.id === itemId) {
        const unitPrice = item.price / item.quantity;
        return { ...item, quantity: newQuantity, price: unitPrice * newQuantity };
      }
      return item;
    }) || [];

    this.localCart = {
      ...this.localCart,
      orderItemDtos: updatedItems,
      totalPrice: updatedItems.reduce((sum, item) => sum + item.price, 0)
    };

    const updateDto: EditOrderItemDto = { Color: color, Quantity: newQuantity };
    this.orderItemService.updateOrderItem(itemId, updateDto).subscribe({
      next: (response) => {
        console.log('Updated:', response.message);
        // Update local cart data
        this.cartService.notifyCartUpdated();
      },
      error: (err) => {
        this.localCart = originalCart;
        console.error('Error adding to cart:', err);
        this.toaster.error(err.error?.message || 'Failed to add to cart');
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
