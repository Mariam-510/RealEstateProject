import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubscriptionPaymentMethodComponent } from '../subscription-payment-method/subscription-payment-method.component';

interface Subscriptionplan {
  Id: number;
  Name: string;
  Price: number;
  MaxAllowedProperties: number;
  Description: string;
 
}

@Component({
  selector: 'app-subscription-plan',
  imports: [CommonModule],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.css'
})
export class SubscriptionPlanComponent {
  constructor(private dialog: MatDialog) { }
  userid=4;
  plans: Subscriptionplan[] = [
    {
      Id : 1,
      Name: "Free",
      Price: 0,
      MaxAllowedProperties : 3,
      Description : "Free plan with limited property slots."
 
    },
    {
      Id : 2,
      Name: "Basic",
      Price : 9.99,
      MaxAllowedProperties : 10,
      Description : "Basic plan suitable for individuals with moderate property listing"
    },
    {
      Id: 3,
      Name : "Pro",
      Price : 29.99,
      MaxAllowedProperties : 50,
      Description : "Pro plan ideal for professionals managing multiple properties."
    },
    {
     
      Id : 4,
      Name : "Enterprise",
      Price : 99.99,
      MaxAllowedProperties : 200,
      Description : "Enterprise plan for large-scale property management businesses."
    },
  ];
  openMethodDialog(plan: any): void {
    this.dialog.open(SubscriptionPaymentMethodComponent,{width: '480px',  minHeight: '440px',
      panelClass: ['centered-dialog','mt-5','pt-5'],
      data: { selectedPlan: plan }});
 }
}
