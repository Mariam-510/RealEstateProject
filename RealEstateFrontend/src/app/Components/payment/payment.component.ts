// payment.component.ts
import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements AfterViewInit {
  paymentMethods = [
    {
      id: 'cash',
      name: 'Cash on Delivery',
      icon: 'bi-cash',
      description: 'Pay when you receive your order',
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'bi-paypal',
      description: 'Pay securely with your PayPal account',
    },
    {
      id: 'stripe',
      name: 'Credit/Debit Card',
      icon: 'bi-credit-card',
      description: 'Pay with Visa, Mastercard, etc.',
    },
  ];

  selectedMethod: string = 'cash';
  stripe: any;
  cardElement: any;
  stripeElements: any;

  constructor(public cartService: CartService) {}

  ngAfterViewInit(): void {
    this.loadStripe();
  }

  async loadStripe(): Promise<void> {
    // In a real app, you would:
    // 1. Load Stripe.js from their CDN
    // 2. Initialize with your publishable key
    // 3. Create card element
    // Mock implementation for demonstration:
    // if (typeof Stripe !== 'undefined') {
    //   this.stripe = Stripe('pk_test_your_publishable_key');
    //   this.stripeElements = this.stripe.elements();
    //   this.cardElement = this.stripeElements.create('card');
    //   this.cardElement.mount('#card-element');
    // }
  }

  async handlePayment(): Promise<void> {
    if (this.selectedMethod === 'stripe') {
      await this.processStripePayment();
    } else {
      this.completeOrder();
    }
  }

  async processStripePayment(): Promise<void> {
    try {
      // In a real app, you would:
      // 1. Create a payment intent on your backend
      // 2. Confirm the payment with Stripe
      // 3. Handle the result

      // Mock implementation:
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(
        'client_secret_from_backend',
        {
          payment_method: {
            card: this.cardElement,
          },
        }
      );

      if (error) {
        console.error('Payment failed:', error);
        alert('Payment failed: ' + error.message);
      } else {
        console.log('Payment succeeded:', paymentIntent);
        this.completeOrder();
      }
    } catch (err) {
      console.error('Stripe error:', err);
      alert('An error occurred during payment processing');
    }
  }

  completeOrder(): void {
    console.log('Order completed with payment method:', this.selectedMethod);
    this.cartService.clearCart();
    // In a real app, you would navigate to confirmation page
    // this.router.navigate(['/checkout/confirmation']);
  }
}
