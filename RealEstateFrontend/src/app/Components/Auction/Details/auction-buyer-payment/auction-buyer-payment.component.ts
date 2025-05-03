import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { PaymentDto, PaymentService } from '../../../../Services/ApiServices/payment.service';
import { ToastrService } from '../../../../Services/toastr.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PaypalService } from '../../../../Services/PaymentServices/paypal.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuctionDTOShow } from '../../../../Services/ApiServices/auction.service';
import { CommonModule } from '@angular/common';
import { CreateSubscriptionDto } from '../../../../Services/ApiServices/subscription.service';
import { AuctionBuyerService, CreateAuctionBuyerDto } from '../../../../Services/ApiServices/auction-buyer.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-auction-buyer-payment',
  imports: [CommonModule, RouterModule],
  templateUrl: './auction-buyer-payment.component.html',
  styleUrl: './auction-buyer-payment.component.css'
})
export class AuctionBuyerPaymentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { auctionData: AuctionDTOShow },
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AuctionBuyerPaymentComponent>,
    private router: Router,
    private payPalService: PaypalService,
    private paymentService: PaymentService,
    private auth: AuthService,
    private auctionBuyerService: AuctionBuyerService
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


  isLoading: boolean = false; // Add loading state
  auctionFees: number = 0;
  async ngOnInit(): Promise<void> {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
      return;
    }

    this.auctionFees = Number(((this.data.auctionData?.startPrice ?? 0) * 0.01).toFixed(2));

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
                          this.auctionFees
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
    const amount = this.auctionFees;

    this.paymentService.createPayPalOrder(amount).subscribe({
      next: (paymentResponse: PaymentDto) => {
        console.log('Payment successful:', paymentResponse);
        this.createAuctionBuyer(this.data.auctionData.id, paymentResponse.id);
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


  // Create auction buyer with async/await
  async createAuctionBuyer(auctionId: number, paymentId: number) {
    const newAuctionBuyer: CreateAuctionBuyerDto = {
      auctionId: auctionId,
      paymentId: paymentId
    };

    try {
      const response = await lastValueFrom(
        this.auctionBuyerService.createAuctionBuyer(newAuctionBuyer)
      );
      console.log('Creation success:', response.message);
      console.log('Created record:', response.auctionBuyerDto);
      this.toastr.success('Payment done!');
      this.dialogRef.close();
      // this.auctionBuyerDto = response.auctionBuyerDto;
      return response;
    } catch (err) {
      console.error('Creation error:', err);
      throw err; // Re-throw if needed
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

  closeModal() {
    this.dialogRef.close(); // Closes the modal without returning data
  }


}
