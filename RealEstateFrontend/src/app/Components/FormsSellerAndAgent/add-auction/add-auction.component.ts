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
import { AuctionDTO, AuctionService } from '../../../Services/ApiServices/auction.service';
import { PropertyDTO, PropertyService } from '../../../Services/ApiServices/property.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { ToastrService } from '../../../Services/toastr.service';

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
  properties: PropertyDTO[] = [];

  constructor(private fb: FormBuilder, private router: Router,
    private auctionService: AuctionService, private propertyService: PropertyService,
    private auth: AuthService, private toastr: ToastrService) {
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

    if (!this.auth.hasRole('Agent') && !this.auth.hasRole('Seller')) {

      this.toastr.error('Unauthorized access!');
      this.router.navigate(['/login']);
    }

    // Trigger validation when either field changes
    this.loadProperties();

    this.auctionForm.get('startTime')?.valueChanges.subscribe(() => {
      this.auctionForm.get('endTime')?.updateValueAndValidity();
      this.updateFormValidity();
    });

    this.auctionForm.get('endTime')?.valueChanges.subscribe(() => {
      this.updateFormValidity();
    });
  }

  private loadProperties(): void {

    if (this.auth.hasRole('Seller')) {
      // Call with parameter 1 (assuming you want Approved status)
      this.propertyService.getPropertiesBySellerId(1).subscribe({
        next: (properties) => {
          this.properties = properties.filter(p =>
            p.status === 'Available' // Filter available properties
          );
        },
        error: (err) => {
          console.error('Error loading properties:', err);
        }
      });
    }
    else {
      this.propertyService.getPropertiesByAgentId().subscribe({
        next: (properties) => {
          this.properties = properties.filter(p =>
            p.status === 'Available' // Filter available properties
          );
        },
        error: (err) => {
          console.error('Error loading properties:', err);
        }
      });
    }

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


  resetForm(): void {
    this.auctionForm.reset({
      propertyId: '',
      startTime: '',
      endTime: '',
      startPrice: ''
    });

    // Reset validation states
    this.auctionForm.markAsUntouched();
    this.auctionForm.markAsPristine();

    // If you need to reload available properties (optional)
    this.loadProperties();
  }


  onSubmit(): void {
    this.auctionForm.markAllAsTouched();

    if (this.auctionForm.valid) {
      // Create properly formatted DTO
      const auctionDto: AuctionDTO = {
        StartTime: new Date(this.auctionForm.value.startTime),
        EndTime: new Date(this.auctionForm.value.endTime),
        StartPrice: this.auctionForm.value.startPrice,
        PropertyId: this.auctionForm.value.propertyId
      };

      this.auctionService.createAuction(auctionDto).subscribe({
        next: (response) => {
          // console.log('Auction created:', response);
          this.toastr.success('Auction created successfully!');
          this.resetForm(); // Call reset here
          // this.router.navigate(['/auctions']);
        },
        error: (err) => {
          console.error('Error creating auction:', err);
          // Handle specific errors if needed
          if (err.error?.message) {
            this.toastr.error(`Error: ${err.error.message}`);
          } else {
            this.toastr.error('An unexpected error occurred');
          }
        }
      });
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
