// payment.component.ts
import {
  Component,
  AfterViewInit,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import {
  AddressDto,
  AddressService,
} from '../../../Services/ApiServices/address.service';
import { PaypalService } from '../../../Services/PaymentServices/paypal.service';
import { ToastrService } from '../../../Services/toastr.service';
import {
  CartDto,
  CartService,
} from '../../../Services/ApiServices/cart.service';
import { API_CONFIG } from '../../../app.config';
import {
  ShippingDto,
  ShippingService,
} from '../../../Services/ApiServices/shipping.service';
import { firstValueFrom } from 'rxjs';
import {
  CreateOrderDto,
  OrderService,
} from '../../../Services/ApiServices/order.service';
import {
  PaymentDto,
  PaymentService,
} from '../../../Services/ApiServices/payment.service';
import { loadStripe } from '@stripe/stripe-js';
import { Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit {
  apiConfig = API_CONFIG;

  stripe: Stripe | null = null;
  stripeElements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

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
  isProcessing = false;
  paypalButtonRendered = false;

  address: AddressDto | null = null;
  localCart: CartDto | null = null; // Local copy of cart data
  shippingDto: ShippingDto | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private auth: AuthService,
    private toastr: ToastrService,
    private payPalService: PaypalService,
    private cartService: CartService,
    private addressService: AddressService,
    private shippingService: ShippingService,
    private orderService: OrderService,
    private paymentService: PaymentService
  ) { }

  clientId: string = '';
  selectedAddressId: number = 0;

  loading = true;

  async ngOnInit() {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      // Initialize Stripe
      this.stripe = await loadStripe(
        'pk_test_51RBWG7Fl7t0xHh1EjC1dSHHO827Jv7v7ledh4KiO1GljKiLgSdRWp9dduV9O7sb3vzpZXI1dB5ZztMWkR6Og80id003IGXcZ2g'
      );

      // Get query parameters
      const params = await firstValueFrom(this.route.queryParams);

      // Check for Stripe session ID first (if returning from Stripe payment)
      const sessionId = params['session_id'];
      if (sessionId) {
        await this.verifyStripePayment(sessionId);
        return; // Exit after handling Stripe return
      }

      // Normal flow - get address ID
      const addressId = params['id'];
      if (!addressId || isNaN(+addressId)) {
        this.router.navigate(['/checkout/address']);
        return;
      }

      this.selectedAddressId = +addressId;


      // Load address and cart data
      await this.loadAddressDetails(addressId);
      await this.loadInitialCart();

      if (this.address?.city) {
        await this.loadShipping(this.address.city);
      }
      this.loading = false;
    } catch (error) {
      console.error('Initialization error:', error);
      this.toastr.error('Failed to initialize payment page. Please try again.');
    }
  }

  async loadInitialCart() {
    if (this.hasRole('Buyer')) {
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
      const address = await firstValueFrom(
        this.addressService.getById(addressId)
      );
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
          paypal
            .Buttons({
              createOrder: (data: any, actions: any) => {
                if (!this.localCart?.totalPrice) {
                  this.toastr.error('Missing cart total');
                  throw new Error('Missing cart total');
                }
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: (
                          this.localCart.totalPrice +
                          (this.shippingDto?.deliveryFees ?? 0)
                        ).toFixed(2),
                      },
                    },
                  ],
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
              },
            })
            .render('#paypal-button-container');
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
    const amount =
      (this.localCart?.totalPrice ?? 0) + (this.shippingDto?.deliveryFees ?? 0);

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
      },
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
      addressId: this.address?.id ?? 0,
    };

    try {
      const response = await firstValueFrom(
        this.orderService.placeOrder(orderData)
      );
      console.log('Order placed successfully:', response);

      this.cartService.notifyCartUpdated();
      // this.router.navigate(['/checkout/confirmation']);
      // Navigate with order ID in state
      this.router.navigate(['/checkout/confirmation'], {
        queryParams: { orderId: response.id },
      });
    } catch (error) {
      console.error('Error placing order:', error);
      // Handle error (show error message)
    }
  }

  //--------------------------------------------------------------------------------------------------------

  async processStripePayment(): Promise<void> {
    if (!this.stripe || !this.localCart || !this.address) {
      this.toastr.error('Payment initialization failed');
      return;
    }

    this.isProcessing = true;

    try {
      const amount =
        (this.localCart.totalPrice ?? 0) +
        (this.shippingDto?.deliveryFees ?? 0);

      // Create a payment intent on your server
      const sessionResponse = await firstValueFrom(
        this.paymentService.createStripeSession(amount, this.selectedAddressId)
      );

      // Redirect to Stripe Checkout
      const stripeResult = await this.stripe.redirectToCheckout({
        sessionId: sessionResponse.sessionId,
      });

      if (stripeResult.error) {
        this.toastr.error(stripeResult.error.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Stripe payment error:', error);
      this.toastr.error('Payment failed. Please try again.');
    } finally {
      this.isProcessing = false;
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
    } catch (error) {
      console.error('Payment error:', error);
      this.isProcessing = false;
    }
  }

  private async verifyStripePayment(sessionId: string): Promise<void> {
    this.isProcessing = true;
    try {
      // First verify the Stripe session was successful
      const paymentResponse = await firstValueFrom(
        this.paymentService.verifyStripeSession(sessionId)
      );

      // Then create the payment record
      const amount = (this.localCart?.totalPrice ?? 0) + (this.shippingDto?.deliveryFees ?? 0);
      const createdPayment = await firstValueFrom(
        this.paymentService.createStripePayment(amount)
      );

      // Then place the order with the payment ID
      await this.handlePlaceOrder(createdPayment.id);

      // Clear any query params to prevent duplicate processing
      this.router.navigate(['/checkout/confirmation'], {
        queryParams: { orderId: createdPayment.id },
        replaceUrl: true
      });
    } catch (error) {
      console.error('Payment verification failed:', error);
      this.toastr.error('Payment verification failed. Please contact support.');
      this.router.navigate(['/checkout/payment']);
    } finally {
      this.isProcessing = false;
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
