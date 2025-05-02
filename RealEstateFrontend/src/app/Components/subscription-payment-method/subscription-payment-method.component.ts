import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from '../../Services/toastr.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaypalService } from '../../Services/PaymentServices/paypal.service';
import { PaymentDto, PaymentService } from '../../Services/ApiServices/payment.service';
import { AuthService } from '../../Services/ApiServices/auth.service';
import { CreateSubscriptionDto, SubscriptionDto, SubscriptionService } from '../../Services/ApiServices/subscription.service';
import { catchError, Observable, of, startWith, switchMap } from 'rxjs';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-subscription-payment-method',
  imports: [CommonModule, RouterModule],
  templateUrl: './subscription-payment-method.component.html',
  styleUrl: './subscription-payment-method.component.css'
})
export class SubscriptionPaymentMethodComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedPlan: any }, private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<SubscriptionPaymentMethodComponent>,
    private router: Router,
    private route: ActivatedRoute,
    private payPalService: PaypalService,
    private paymentService: PaymentService,
    private auth: AuthService,
    private subscriptionService: SubscriptionService
  ) { }
  paypalButtonRendered = false;

  paymentMethods = [
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

  subscription$!: Observable<SubscriptionDto | null>;

  isLoading: boolean = false; // Add loading state

  async ngOnInit(): Promise<void> {
    if (!this.hasRole('Seller') && !this.hasRole('Agent')) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    try {
      await Promise.all([
        this.subscriptionCall()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  subscriptionCall() {
    this.subscription$ = this.subscriptionService.subscriptionUpdated$.pipe(
      startWith(null),
      switchMap(() => {
        return this.subscriptionService.getCurrentUserSubscription().pipe(
          catchError((error) => {
            console.error('Error loading subscription:', error);
            return of(null);
          })
        );
      })
    );
  }

  selectedMethod: string = '';
  selectPaymentMethod(value: string) {
    this.selectedMethod = value;
    this.cd.detectChanges(); // Force DOM update

    // console.log("ppppppppppppppppp")

    if (value === 'paypal') {
      this.paypalButtonRendered = false;
      setTimeout(() => this.renderPayPalButton(), 50);
    }
  }

  clientId: string = '';

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
                return actions.order.create({
                  purchase_units: [
                    {
                      amount: {
                        value: (
                          (this.data?.selectedPlan?.price ?? 0)
                        ).toFixed(2),
                      },
                    },
                  ],
                });
              },
              onApprove: async (data: any, actions: any) => {
                const order = await actions.order.capture();
                // this.toastr.success('Payment successful!');
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
    const amount = this.data?.selectedPlan?.price ?? 0;

    this.paymentService.createPayPalOrder(amount).subscribe({
      next: (paymentResponse: PaymentDto) => {
        console.log('Payment successful:', paymentResponse);
        this.updateSubscriptionPlan(this.data.selectedPlan.id, paymentResponse.id);
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

  // In your component
  async updateSubscriptionPlan(planId: number, paymentId?: number) {
    const dto: CreateSubscriptionDto = {
      SubscriptionPlanId: planId,
      PaymentId: paymentId
    };

    try {
      await lastValueFrom(this.subscriptionService.updateSubscription(dto));
      this.toastr.success('Subscription updated!');
      this.dialogRef.close();
      console.log('Subscription updated successfully');
    } catch (err) {
      this.toastr.error('Failed to update subscription');
      console.error('Failed to update subscription:', err);
      // Handle error (show message to user)
    }
  }



  // async handlePlaceOrder(paymentId: number | null) {
  //   const orderData: CreateOrderDto = {
  //     paymentId: paymentId,
  //     deliveryFees: this.shippingDto?.deliveryFees ?? 0,
  //     addressId: this.address?.id ?? 0,
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.orderService.placeOrder(orderData)
  //     );
  //     console.log('Order placed successfully:', response);

  //     this.cartService.notifyCartUpdated();
  //     // this.router.navigate(['/checkout/confirmation']);
  //     // Navigate with order ID in state
  //     this.router.navigate(['/checkout/confirmation'], {
  //       queryParams: { orderId: response.id },
  //     });
  //   } catch (error) {
  //     console.error('Error placing order:', error);
  //     // Handle error (show error message)
  //   }
  // }

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

  closeModal() {
    this.dialogRef.close(); // Closes the modal without returning data
  }


}
