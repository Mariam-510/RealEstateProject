// payment.component.ts
import { Component, AfterViewInit, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { CreateOrderDto, OrderService } from '../../../Services/ApiServices/order.service';
import { PaymentDto, PaymentService } from '../../../Services/ApiServices/payment.service';


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

  address: AddressDto | null = null;
  localCart: CartDto | null = null; // Local copy of cart data
  shippingDto: ShippingDto | null = null;

  constructor(private router: Router, private route: ActivatedRoute, private cd: ChangeDetectorRef, private auth: AuthService,
    private toastr: ToastrService, private payPalService: PaypalService, private cartService: CartService,
    private addressService: AddressService, private shippingService: ShippingService, private orderService: OrderService,
    private paymentService: PaymentService
  ) { }

  clientId: string = '';

  async ngOnInit() {
    await this.checkStripeReturn();

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

      if (this.address?.city) {
        await this.loadShipping(this.address.city);
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
      this.address = address;
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

  get selectedPaymentMethod(): string {
    return this.selectedMethod;
  }

  // set selectedPaymentMethod(value: string) {
  //   this.selectedMethod = value;

  //   // if (value === 'paypal') {
  //   //   setTimeout(() => this.renderPayPalButton(), 0);
  //   // }
  // }

  selectPaymentMethod(value: string) {
    this.selectedMethod = value;
    this.cd.detectChanges(); // Force DOM update

    // console.log("ppppppppppppppppp")

    if (value === 'paypal') {
      this.paypalButtonRendered = false;
      setTimeout(() => this.renderPayPalButton(), 50);
    }
  }


  private async renderPayPalButton() {
    // console.log("-------------------------------------------ppppppppppppppppp")

    if (this.paypalButtonRendered) return;

    try {
      this.clientId = this.payPalService.clientId;
      const paypal = await this.payPalService.loadPayPal(this.clientId);

      if (!paypal?.Buttons) {
        console.error('PayPal SDK failed to load');
        return;
      }

      const renderButton = () => {
        const container = document.getElementById('paypal-button-container');
        if (container && !container.children.length && paypal.Buttons) {
          // console.log("ppppppppppppppppp-------------------------------------------")
          paypal.Buttons({
            createOrder: (data: any, actions: any) => {
              if (!this.localCart?.totalPrice) {
                this.toastr.error('Missing cart total');
                throw new Error('Missing cart total');
              }
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    value: (this.localCart.totalPrice + (this.shippingDto?.deliveryFees ?? 0)).toFixed(2)
                  }
                }]
              });
            },
            onApprove: async (data: any, actions: any) => {
              const order = await actions.order.capture();
              this.toastr.success('Payment successful!');
              this.paymentWithPayPal();
              // setTimeout(() => {
              //   window.location.href = `/gopl`;
              // }, 2500);
            },
            onError: (err: any) => {
              this.toastr.error('Payment failed. Please try again.');
            }
          }).render('#paypal-button-container');
          this.paypalButtonRendered = true; // Set flag AFTER successful render
        } else {
          setTimeout(renderButton, 50);
        }
      };

      renderButton();
    } catch (error) {
      console.error('PayPal initialization error:', error);
      this.paypalButtonRendered = false;
    }
  }


  paymentWithPayPal() {
    const amount = (this.localCart?.totalPrice ?? 0) + (this.shippingDto?.deliveryFees ?? 0);

    this.paymentService.createPayPalOrder(amount).subscribe({
      next: (paymentResponse: PaymentDto) => {
        console.log('Payment successful:', paymentResponse);
        // Handle successful payment (e.g., show confirmation, redirect)
        this.handlePlaceOrder(paymentResponse.id);
      },
      error: (err) => {
        console.error('Payment failed:', err);
        // Handle error (e.g., show error message)
      },
      complete: () => {
        // Optional: Handle completion
      }
    });
  }

  //--------------------------------------------------------------------------------------------------------
  async completeOrder() {
    await this.handlePlaceOrder(null);
  }

  async handlePlaceOrder(paymentId: number | null) {
    const orderData: CreateOrderDto = {
      paymentId: paymentId,
      deliveryFees: this.shippingDto?.deliveryFees ?? 0,
      addressId: this.address?.id ?? 0
    };

    try {
      const response = await firstValueFrom(this.orderService.placeOrder(orderData));
      console.log('Order placed successfully:', response);

      this.cartService.notifyCartUpdated();
      // this.router.navigate(['/checkout/confirmation']);
      // Navigate with order ID in state
      this.router.navigate(['/checkout/confirmation'], {
        queryParams: { orderId: response.id }
      });

    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (show error message)
    }
  }

  //--------------------------------------------------------------------------------------------------------
  async ngAfterViewInit(): Promise<void> {
    this.loadStripe();
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


  async initiateStripeCheckout() {
    if (this.isProcessing) return;
    this.isProcessing = true;
  
    try {
      const amount = (this.localCart?.totalPrice ?? 0) + (this.shippingDto?.deliveryFees ?? 0);
      const response = await this.paymentService.createStripeCheckoutSession(amount).toPromise();
      
      if (response?.url) {
        // Store session ID and order details for verification after return
        localStorage.setItem('stripe_session_id', response.sessionId);
        localStorage.setItem('pending_order', JSON.stringify({
          addressId: this.address?.id,
          deliveryFees: this.shippingDto?.deliveryFees
        }));
        
        // Redirect to Stripe checkout
        window.location.href = response.url;
      } else {
        throw new Error('No URL returned from Stripe');
      }
    } catch (error) {
      console.error('Stripe checkout error:', error);
      this.toastr.error('Failed to initiate Stripe payment');
      this.isProcessing = false;
    }
  }

  async checkStripeReturn() {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('sessionId');
    
    if (sessionId) {
      this.isProcessing = true;
      try {
        // Verify the payment with your backend
        const verification = await this.paymentService.verifyStripePayment(sessionId).toPromise();
        
        if (verification?.success) {
          // Retrieve pending order details
          const pendingOrderStr = localStorage.getItem('pending_order') || '{}';
          const pendingOrder = JSON.parse(pendingOrderStr);
          
          // Complete the order
          const orderData: CreateOrderDto = {
            paymentId: verification.paymentId,
            deliveryFees: pendingOrder.deliveryFees || this.shippingDto?.deliveryFees || 0,
            addressId: pendingOrder.addressId || this.address?.id || 0
          };
  
          const response = await firstValueFrom(this.orderService.placeOrder(orderData));
          this.cartService.notifyCartUpdated();
          
          // Clean up
          localStorage.removeItem('stripe_session_id');
          localStorage.removeItem('pending_order');
          
          // Redirect to home or confirmation page
          this.router.navigate(['/home']);
          this.toastr.success('Payment and order completed successfully!');
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        this.toastr.error('Payment verification failed');
        this.router.navigate(['/checkout/payment']);
      } finally {
        this.isProcessing = false;
      }
    }
  }
  
}
