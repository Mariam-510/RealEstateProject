import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from '../../Services/toastr.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-subscription-payment-method',
  imports: [CommonModule,RouterModule],
  templateUrl: './subscription-payment-method.component.html',
  styleUrl: './subscription-payment-method.component.css'
})
export class SubscriptionPaymentMethodComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { selectedPlan: any },private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<SubscriptionPaymentMethodComponent>
  ) {}
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

  selectedMethod: string = 'cash';
  selectPaymentMethod(value: string) {
    this.selectedMethod = value;
    this.cd.detectChanges(); 

    if (value === 'paypal') {
      this.paypalButtonRendered = false;
     }
  }
  
  closeModal() {
    this.dialogRef.close(); // Closes the modal without returning data
  }


}
