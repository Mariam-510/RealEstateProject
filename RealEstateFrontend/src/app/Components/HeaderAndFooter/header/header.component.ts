import { CommonModule } from '@angular/common';
import { Component, effect, ElementRef, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SharedService } from '../../../Services/shared.service';
import { MatDialog } from '@angular/material/dialog';
import { SignUpRoleComponentComponent } from '../../Authentication/sign-up-role-component/sign-up-role-component.component';
import { AuthService, User } from '../../../Services/ApiServices/auth.service';
import { AccountService } from '../../../Services/ApiServices/account.service';

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

  constructor(private elRef: ElementRef, private auth: AuthService,
    private router: Router, private dialog: MatDialog, private accountService: AccountService) { }

  showMobileNav = false;
  showUserMenu = false;
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

  loggedInUser!: User | undefined;

  ngOnInit() {
    document.addEventListener('click', this.onClickOutside.bind(this));
    this.updateCartTotal();
    this.updateCartCount(); // Initialize cart count


    this.auth.currentUser$.subscribe(user => {
      if (user) {
        // console.log('User roles:', user.roles);
        // console.log('Token expires at:', user.tokenExpiration);

        this.loggedInUser = user;
        console.log(this.loggedInUser)
      }
    });

    // this.testAuth();

  }

  handleLogout() {
    this.closeMenus();
    this.auth.logout();
    this.loggedInUser = undefined;
    console.log(this.loggedInUser);
    console.log(this.auth.isAuthenticated());
  }


  // In your component
  // txt = '';

  // testAuth() {
  //   this.accountService.testAuth().subscribe({
  //     next: (response) => {
  //       // Handle successful text response
  //       this.txt = (response as { message: string }).message; // Type assertion
  //       console.log('Authentication successful:', response);
  //     },
  //     error: (error) => {
  //       // Handle error
  //       this.txt = `Error: ${error.message || 'Unknown error'}`;
  //       console.error('Authentication failed:', error);
  //     }
  //   });
  // }


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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.closeMenus();
    }
  }


}
