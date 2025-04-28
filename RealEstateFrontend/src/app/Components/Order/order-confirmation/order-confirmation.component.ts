// order-confirmation.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderResponseDto, OrderService } from '../../../Services/ApiServices/order.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent {

  orderId: number = 0;

  order: OrderResponseDto | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService,
    private orderService: OrderService) { }

  ngOnInit() {

    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    this.orderId = Number(this.route.snapshot.queryParams['orderId']);

    if (!this.orderId) {
      console.error('No order ID found in query parameters');
      this.router.navigate(['/']);
    }

    this.loadOrder(this.orderId);

  }

  private loadOrder(id: number) {
    this.orderService.getById(id).subscribe({
      next: (order) => {
        this.order = order;
        console.log('Order loaded:', order);
      },
      error: (err) => {
        console.error('Failed to load order:', err);
        // Handle error (show message, redirect, etc.)
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
