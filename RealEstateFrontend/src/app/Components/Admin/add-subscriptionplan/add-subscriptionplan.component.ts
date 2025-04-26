// add-subscriptionplan.component.ts
import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { SubscriptionPlanService } from '../../../Services/ApiServices/subscription-plan.service';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-add-subscriptionplan',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './add-subscriptionplan.component.html',
  styleUrl: './add-subscriptionplan.component.css',
})
export class AddSubscriptionplanComponent {
  DescriptionText: string = '';
  isMaxLengthExceeded: boolean = false;
  maxCharacters: number = 150;
  isLoading: boolean = false;

  constructor(
    private subscriptionPlanService: SubscriptionPlanService,
    private router: Router
  ) {}

  subscriptionForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(10),
      Validators.pattern(/^[A-Za-z]+$/),
    ]),
    price: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d+)?$/),
    ]),
    MaxAllowd: new FormControl('', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d+)?$/),
    ]),
    description: new FormControl('', [Validators.maxLength(200)]),
  });

  validateReview() {
    this.isMaxLengthExceeded =
      this.DescriptionText.length >= this.maxCharacters;
  }

  AddPlan() {
    this.validateReview();

    if (this.isMaxLengthExceeded || this.subscriptionForm.invalid) {
      alert(
        'Please ensure all form fields are valid and review is within character limit.'
      );
      return;
    }

    this.isLoading = true;

    const planData = {
      name: this.subscriptionForm.value.name,
      price: parseFloat(this.subscriptionForm.value.price || '0'),
      maxAllowedProperties: parseInt(
        this.subscriptionForm.value.MaxAllowd || '0'
      ),
      description: this.subscriptionForm.value.description,
    };

    this.subscriptionPlanService.createSubscriptionPlan(planData).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Subscription plan added successfully!');
        this.router.navigate(['/subscription-plans']); // Redirect to plans list
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding subscription plan:', error);
        alert('Failed to add subscription plan. Please try again.');
      },
    });
  }
}
