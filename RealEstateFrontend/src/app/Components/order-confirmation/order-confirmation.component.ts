// order-confirmation.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
}