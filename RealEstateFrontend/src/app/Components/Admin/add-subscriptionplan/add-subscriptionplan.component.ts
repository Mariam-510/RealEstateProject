// add-subscriptionplan.component.ts
import { Component, OnInit } from '@angular/core';
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
import { ToastrService } from '../../../Services/toastr.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-add-subscriptionplan',
  imports: [ReactiveFormsModule, CommonModule, RouterModule, FormsModule],
  templateUrl: './add-subscriptionplan.component.html',
  styleUrl: './add-subscriptionplan.component.css',
})
export class AddSubscriptionplanComponent implements OnInit {
  DescriptionText: string = '';
  isMaxLengthExceeded: boolean = false;
  maxCharacters: number = 150;
  isLoading: boolean = false;

  constructor(
    private auth: AuthService,
    private subscriptionPlanService: SubscriptionPlanService,
    private router: Router,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    if (!this.hasRole('Admin')) {
      this.router.navigate(['/login']);
      return;
    }
  }

  subscriptionForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(10)
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

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

  validateReview() {
    this.isMaxLengthExceeded =
      this.DescriptionText.length >= this.maxCharacters;
  }

  AddPlan() {
    this.validateReview();

    if (this.isMaxLengthExceeded || this.subscriptionForm.invalid) {
      this.toastr.error(
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
        this.toastr.success('Subscription plan added successfully!', 'Success');
        this.subscriptionForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error adding subscription plan:', error);
        this.toastr.error(
          'Failed to add subscription plan. Please try again.',
          'error'
        );
      },
    });
  }
}
