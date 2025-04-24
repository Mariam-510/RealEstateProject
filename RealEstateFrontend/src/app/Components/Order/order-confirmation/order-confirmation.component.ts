// order-confirmation.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService } from '../../../Services/ApiServices/order.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css']
})
export class OrderConfirmationComponent {
  order = {
    id: '12345',
    date: new Date(),
    total: 415.00,
    paymentMethod: 'Credit Card',
    estimatedDelivery: new Date(Date.now() + 3600 * 1000 * 2) // 2 hours from now
  };

  orderId: number = 0;

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
