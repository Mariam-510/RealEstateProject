import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
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
      endTime: [
        '',
        [
          Validators.required,
          this.futureDateValidator,
          (control: AbstractControl) => this.endTimeValidator(control),
        ],
      ],
      startPrice: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    // Trigger validation when either field changes
    this.auctionForm.get('startTime')?.valueChanges.subscribe(() => {
      this.auctionForm.get('endTime')?.updateValueAndValidity();
      this.updateFormValidity();
    });

    this.auctionForm.get('endTime')?.valueChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  private updateFormValidity(): void {
    // Manually update the form's validity status
    if (
      this.auctionForm.get('endTime')?.value &&
      this.auctionForm.get('startTime')?.value
    ) {
      this.auctionForm.get('endTime')?.markAsTouched();
      this.auctionForm.updateValueAndValidity();
    }
  }

  // Custom validator for future dates
  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const now = new Date();
    return selectedDate > now ? null : { pastDate: true };
  }

  // End time must be after start time by 10 mins
  endTimeValidator(control: AbstractControl): ValidationErrors | null {
    const startTime = this.auctionForm?.get('startTime')?.value;
    if (!startTime || !control.value) return null;

    const startDate = new Date(startTime);
    const endDate = new Date(control.value);

    // Calculate difference in milliseconds
    const diffMs = endDate.getTime() - startDate.getTime();
    const minDifferenceRequired = 10 * 60 * 1000; // 10 minutes in milliseconds

    if (endDate <= startDate) {
      return { endBeforeStart: true };
    }

    if (diffMs < minDifferenceRequired) {
      return { minDuration: true };
    }

    return null;
  }

  onSubmit(): void {
    // Mark all fields as touched to show errors if any
    this.auctionForm.markAllAsTouched();

    if (this.auctionForm.valid) {
      const formValue = {
        ...this.auctionForm.value,
        startTime: new Date(this.auctionForm.value.startTime).toISOString(),
        endTime: new Date(this.auctionForm.value.endTime).toISOString(),
      };

      console.log('Auction data:', formValue);
      this.router.navigate(['/auctions']);
    }
  }
}
