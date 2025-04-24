// payment.component.ts
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { AddressDto, AddressService } from '../../../Services/ApiServices/address.service';
import { PaypalService } from '../../../Services/PaymentServices/paypal.service';
import { ToastrService } from '../../../Services/toastr.service';
import { CartDto, CartService } from '../../../Services/ApiServices/cart.service';
import { API_CONFIG } from '../../../app.config';
import { ShippingDto, ShippingService } from '../../../Services/ApiServices/shipping.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit, AfterViewInit {
  apiConfig = API_CONFIG;

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
  isProcessing = false;
  paypalButtonRendered = false;

  addresses: AddressDto | null = null;
  localCart: CartDto | null = null; // Local copy of cart data
  shippingDto: ShippingDto | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private auth: AuthService,
    private toastr: ToastrService, private payPalService: PaypalService, private cartService: CartService,
    private addressService: AddressService, private shippingService: ShippingService

  ) { }

  clientId: string = '';

  // async ngOnInit() {

  //   if (!this.hasRole('Buyer')) {
  //     this.router.navigate(['/login']);
  //   }

  //   this.route.queryParams.subscribe(params => {
  //     const addressId = params['id'];

  //     if (!addressId || isNaN(+addressId)) {
  //       this.router.navigate(['/checkout/address']);
  //       return;
  //     }
  //     await this.loadAddressDetails(addressId);
  //     console.log('Valid address ID:', addressId);
  //   });

  //   await this.loadInitialCart();
  //   await this.loadShipping(this.addresses?.city);

  // }


  // async loadInitialCart() {
  //   if (this.hasRole("Buyer")) {
  //     await this.cartService.getCart().subscribe(cart => {
  //       this.localCart = cart; // Store initial copy locally
  //     });
  //   }
  // }

  // get cart(): CartDto | null {
  //   return this.localCart ? { ...this.localCart } : null; // Return read-only copy
  // }

  // // In your component
  // async loadAddressDetails(addressId: number) {
  //   await this.addressService.getById(addressId).subscribe({
  //     next: (address) => {
  //       console.log('Address details:', address);
  //       this.addresses = address;
  //     },
  //     error: (err) => {
  //       console.error('Error loading address:', err);
  //       alert(err.error?.message || 'Could not load address details');
  //     }
  //   });
  // }

  // async loadShipping(city: string) {
  //   // Example component usage
  //   await this.shippingService.getByCity(city).subscribe({
  //     next: (shippingInfo) => {
  //       console.log('Shipping details:', shippingInfo);
  //       this.shippingDto = shippingInfo;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching shipping info:', err);
  //     }
  //   });

  // }



  // ... other imports

  async ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      // Convert Observable to Promise with firstValueFrom
      const params = await firstValueFrom(this.route.queryParams);
      const addressId = params['id'];

      if (!addressId || isNaN(+addressId)) {
        this.router.navigate(['/checkout/address']);
        return;
      }

      await this.loadAddressDetails(addressId);
      console.log('Valid address ID:', addressId);

      await this.loadInitialCart();

      if (this.addresses?.city) {
        await this.loadShipping(this.addresses.city);
      }
    } catch (error) {
      console.error('Initialization error:', error);
      // Handle error appropriately
    }
  }

  async loadInitialCart() {
    if (this.hasRole("Buyer")) {
      try {
        const cart = await firstValueFrom(this.cartService.getCart());
        this.localCart = cart;
      } catch (err) {
        console.error('Error loading cart:', err);
        // Handle error
      }
    }
  }

  async loadAddressDetails(addressId: number) {
    try {
      const address = await firstValueFrom(this.addressService.getById(addressId));
      console.log('Address details:', address);
      this.addresses = address;
    } catch (err) {
      console.error('Error loading address:', err);
      this.router.navigate(['/checkout/address']);
    }
  }

  async loadShipping(city: string) {
    try {
      const shippingInfo = await firstValueFrom(
        this.shippingService.getByCity(city)
      );
      console.log('Shipping details:', shippingInfo);
      this.shippingDto = shippingInfo;
    } catch (err) {
      console.error('Error fetching shipping info:', err);
      // Handle error (e.g., show error message)
    }
  }



  get cart(): CartDto | null {
    return this.localCart ? { ...this.localCart } : null; // Return read-only copy
  }

  async ngAfterViewInit(): Promise<void> {
    this.loadStripe();
  }

  get selectedPaymentMethod(): string {
    return this.selectedMethod;
  }

  set selectedPaymentMethod(value: string) {
    this.selectedMethod = value;

    if (value === 'paypal') {
      setTimeout(() => this.renderPayPalButton(), 0);
    }
  }


  async handlePayment(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      if (this.selectedMethod === 'stripe') {
        await this.processStripePayment();
      } else if (this.selectedMethod === 'cash') {
        this.completeOrder();
      }
      // PayPal is handled by their button directly
    } catch (error) {
      console.error('Payment error:', error);
      this.isProcessing = false;
    }
  }

  private async renderPayPalButton() {
    if (this.paypalButtonRendered) return;

    this.paypalButtonRendered = true;

    try {
      this.clientId = this.payPalService.clientId;

      const paypal = await this.payPalService.loadPayPal(this.clientId);

      if (!paypal || !paypal.Buttons) {
        console.error('PayPal SDK failed to load');
        return;
      }

      paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{ amount: { value: 700 } }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log('Payment captured:', order);
          // // window.location.href = `/success?orderId=${data.orderID}`;
          // window.location.href = `/profile/bookingHistory`;
          this.toastr.success('Payment successful!');
          setTimeout(() => {
            window.location.href = `/gopl`;
          }, 2500);
        },
        onError: (err: any) => {
          // console.error('PayPal Error:', err);
          this.toastr.error('Payment failed. Please try again.');
        }
      }).render('#paypal-button-container');

    } catch (error) {
      console.error('Error initializing PayPal:', error);
    }
  }


  completeOrder(): void {
    console.log('Order completed with payment method:', this.selectedMethod);
    // this.cartService.clearCart();
    // In a real app, you would navigate to confirmation page
    // this.router.navigate(['/checkout/confirmation']);
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
