import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { SignUpRoleComponentComponent } from '../../Authentication/sign-up-role-component/sign-up-role-component.component';
import { AuthService, User } from '../../../Services/ApiServices/auth.service';
import { API_CONFIG } from '../../../app.config';
import { CartDto, CartService } from '../../../Services/ApiServices/cart.service';
import { catchError, Observable, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {

  // constructor(private elRef: ElementRef, private auth: AuthService,
  //   private router: Router, private dialog: MatDialog, private cartService: CartService) { }

  cart$: Observable<CartDto | null>;

  constructor(private elRef: ElementRef, private auth: AuthService,
    private router: Router, private dialog: MatDialog, private cartService: CartService) {
    // Initialize cart$ after dependencies are injected
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

    // console.log(this.cart$);
    // this.cart$.subscribe(cart => {
    //   if (cart) {
    //     console.log(cart.orderItemDtos); // Access property on emitted value
    //   }
    // });
  }

  cartCall() {
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

  apiConfig = API_CONFIG;
  cart: CartDto | null = null;
  showMobileNav = false;
  showUserMenu = false;
  wishlistCount = 0;
  showCart = false;
  showCartBackdrop = false;

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

  loggedInUser!: User | undefined;

  ngOnInit() {
    document.addEventListener('click', this.onClickOutside.bind(this));

    this.auth.currentUser$.subscribe(user => {
      this.loggedInUser = user;
      // Trigger initial load
      this.cartService.notifyCartUpdated();
    });
  }


  handleLogout() {
    this.closeMenus();
    this.auth.logout();
    this.loggedInUser = undefined;
    this.cartService.notifyCartUpdated(); // <-- Add this line
    this.cartCall();
    console.log(this.loggedInUser);
    console.log(this.auth.isAuthenticated());
  }

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  openSigUPDialog(): void {
    this.dialog.open(SignUpRoleComponentComponent);
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeMenus();
    }
  }


}
