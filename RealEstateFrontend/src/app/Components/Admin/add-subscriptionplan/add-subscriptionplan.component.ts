import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-subscriptionplan',
  imports: [ReactiveFormsModule, CommonModule, RouterModule,FormsModule],
  templateUrl: './add-subscriptionplan.component.html',
  styleUrl: './add-subscriptionplan.component.css'
})
export class AddSubscriptionplanComponent {
  DescriptionText: string = '';
  isMaxLengthExceeded: boolean = false;
  maxCharacters: number = 150;

  subscriptionForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
        Validators.pattern(/^[A-Za-z]+$/)
      ]),
      price: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/)

      ]),
      MaxAllowd: new FormControl('', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d+)?$/)
      ]),
      description: new FormControl('', [Validators.maxLength(200)]),
    },

  )
  validateReview() {
    this.isMaxLengthExceeded = this.DescriptionText.length >= this.maxCharacters;
  }
  AddPlan() {
    this.validateReview();
    if (this.isMaxLengthExceeded || this.subscriptionForm.invalid) {
      alert("Please ensure all form fields are valid and review is within character limit.");
      return;
    }
    const name = this.subscriptionForm.value.name;
    const price = this.subscriptionForm.value.price;
    const maxAllowed = this.subscriptionForm.value.MaxAllowd;
    const DescriptionText = this.DescriptionText;

    console.log("Subscription Plan Data:");
    console.log({ name, price, maxAllowed, DescriptionText });

    this.subscriptionForm.reset();
    this.DescriptionText = '';
    this.isMaxLengthExceeded = false;
  }
}
