import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../Services/shared.service';

interface User {
  name: string;
  email: string;
  avatar: string;
}

interface CartItem {
  name: string;
  price: number;
  quantity: number;
  image: string;
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(private elRef: ElementRef, private _shared: SharedService, private router: Router) { }

  showMobileNav = false;
  showUserMenu = false;
  isLoggedIn = true; // Set this based on auth state
  wishlistCount = 0;
  cartCount = 0;
  showCart = false;
  showCartBackdrop = false;
  cartTotal = 0;

  isRouteActive(routePath: string): boolean {
    return this.router.url === routePath;
  }

  navItems = [
    { label: 'Home', link: '/', icon: 'bi bi-house-fill' },
    { label: 'Properties', link: '/properties', icon: 'bi bi-building-fill' },
    { label: 'Furniture', link: '/products', icon: 'bi bi-lamp-fill' },
    { label: 'Auctions', link: '/auctions', icon: 'bi bi-hammer' },
    { label: 'About', link: '/about', icon: 'bi bi-info-circle-fill' }
  ];

  cartItems: CartItem[] = [
    {
      name: 'Modern Sofadddddddddd ddddddddd xdddddddddddddddddaaaaaaaaaaaaa',
      price: 200,
      quantity: 1,
      image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
    },
    {
      name: 'Modern Sofadddddddddd ddddddddd xdddddddddddddddddaaaaaaaaaaaaa',
      price: 200,
      quantity: 1,
      image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
    },
    {
      name: 'Modern Sofadddddddddd ddddddddd xdddddddddddddddddaaaaaaaaaaaaa',
      price: 200,
      quantity: 1,
      image: 'https://m.media-amazon.com/images/I/81SKUYxdMlL._AC_UF894,1000_QL80_.jpg'
    },
    {
      name: 'Coffee Table',
      price: 200,
      quantity: 2,
      image: 'https://denovofurniture.pk/wp-content/uploads/2024/06/Opulence-New-5.jpg'
    }
  ];

  currentUser: User = {
    name: "HAAAAAAAAAAAA",
    email: "haaa@gmail.com",
    avatar: "https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg"
  }

  // currentUser: User | null = null;

  ngOnInit() {
    document.addEventListener('click', this.onClickOutside.bind(this));
    this.updateCartTotal();
    this.updateCartCount(); // Initialize cart count
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.onClickOutside.bind(this));
  }

  toggleMobileNav() {
    this.showMobileNav = !this.showMobileNav;
    if (this.showMobileNav) this.showUserMenu = false;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) this.showMobileNav = false;
  }

  toggleWishlist() {
    // Implement wishlist logic
    console.log('Toggle wishlist');
  }

  toggleCart() {
    this.showCart = !this.showCart;
    this.showCartBackdrop = this.showCart;
    if (this.showCart) {
      this.showMobileNav = false;
      this.showUserMenu = false;
    }
  }

  closeMenus() {
    this.showMobileNav = false;
    this.showUserMenu = false;
    this.showCart = false;
    this.showCartBackdrop = false;
  }

  private updateCartCount() {
    // this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    this.cartCount = this.cartItems.length;
  }

  increaseQuantity(item: any) {
    item.quantity++;
    this.updateCartTotal();
    this.updateCartCount();
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateCartTotal();
      this.updateCartCount();
    }
  }

  private updateCartTotal() {
    this.cartTotal = this.cartItems.reduce((total, item) =>
      total + (item.price * item.quantity), 0);
  }

  handleAuth(type: 'login' | 'register') {
    // Implement auth logic
    console.log(`Auth type: ${type}`);
    this.closeMenus();
  }

  handleLogout() {
    // Implement logout logic
    this.isLoggedIn = false;
    this.closeMenus();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeMenus();
    }
  }
}
