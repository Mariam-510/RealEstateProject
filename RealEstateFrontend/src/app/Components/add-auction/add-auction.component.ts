import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-auction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-auction.component.html',
  styleUrls: ['./add-auction.component.css'],
})
export class AddAuctionComponent implements OnInit {
  auctionForm: FormGroup;
  minDate: string;
  properties = [
    { id: 1, name: 'Luxury Villa in New Cairo' },
    { id: 2, name: 'Modern Apartment in Zamalek' },
    { id: 3, name: 'Penthouse with Nile View' },
    { id: 4, name: 'Townhouse in Rehab City' },
    { id: 5, name: 'Duplex in Sheikh Zayed' },
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    // Set minimum date to current datetime
    const now = new Date();
    this.minDate = now.toISOString().slice(0, 16);

    this.auctionForm = this.fb.group({
      propertyId: ['', Validators.required],
      startTime: ['', [Validators.required, this.futureDateValidator]],
      endTime: ['', [Validators.required, this.futureDateValidator]],
      startPrice: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Add cross-validation for end time after start time
    this.auctionForm.get('startTime')?.valueChanges.subscribe(() => {
      this.auctionForm.get('endTime')?.updateValueAndValidity();
    });
  }

  // Custom validator for future dates
  futureDateValidator(control: any) {
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate > now ? null : { pastDate: true };
  }

  // End time must be after start time
  endTimeValidator(control: any) {
    const startTime = this.auctionForm?.get('startTime')?.value;
    if (!startTime) return null;

    const startDate = new Date(startTime);
    const endDate = new Date(control.value);
    return endDate > startDate ? null : { endBeforeStart: true };
  }

  onSubmit(): void {
    if (this.auctionForm.valid) {
      // Format dates properly before submission
      const formValue = {
        ...this.auctionForm.value,
        startTime: new Date(this.auctionForm.value.startTime).toISOString(),
        endTime: new Date(this.auctionForm.value.endTime).toISOString(),
      };

      console.log('Auction data:', formValue);
      // Here you would typically call your API to create the auction
      // this.auctionService.createAuction(formValue).subscribe(...);

      // For demonstration, just navigate after "submitting"
      this.router.navigate(['/auctions']);
    }
  }
}
