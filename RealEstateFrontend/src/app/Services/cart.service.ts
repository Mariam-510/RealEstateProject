// cart.service.ts
import { Injectable } from '@angular/core';
import { ProductDto } from './product.service';
import { BehaviorSubject } from 'rxjs';

export interface CartItem {
  product: ProductDto;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  cartItems$ = this.cartItemsSubject.asObservable();

  constructor() {
    this.loadCart();
  }

  private loadCart(): void {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItemsSubject.next(JSON.parse(savedCart));
    }
  }

  private saveCart(items: CartItem[]): void {
    localStorage.setItem('cart', JSON.stringify(items));
    this.cartItemsSubject.next(items);
  }

  addToCart(product: ProductDto, quantity: number = 1): void {
    const currentItems = this.cartItemsSubject.value;
    const existingItem = currentItems.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentItems.push({ product, quantity });
    }

    this.saveCart(currentItems);
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentItems = this.cartItemsSubject.value;
    const item = currentItems.find(i => i.product.id === productId);

    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart(currentItems);
      }
    }
  }

  removeItem(productId: number): void {
    const currentItems = this.cartItemsSubject.value.filter(
      item => item.product.id !== productId
    );
    this.saveCart(currentItems);
  }

  clearCart(): void {
    this.saveCart([]);
  }

  getTotalItems(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + item.quantity, 0
    );
  }

  getSubtotal(): number {
    return this.cartItemsSubject.value.reduce(
      (total, item) => total + (item.product.price * item.quantity), 0
    );
  }
}