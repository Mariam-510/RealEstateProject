import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../Services/ApiServices/property.service';
import { ToastrService } from '../../../Services/toastr.service';
import { FormsModule } from '@angular/forms';
import { PropertyDto } from '../../../Service/shared.service';

declare var bootstrap: any;

@Component({
  selector: 'app-approve-property',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './approve-property.component.html',
  styleUrls: ['./approve-property.component.css'],
})
export class ApprovePropertyComponent {
  @ViewChild('pdfModal') pdfModal!: ElementRef;
  private modalInstance?: any;

  properties: PropertyDto[] = [];
  filteredProperties: any[] = [];
  isLoading = true;

  // Filter variables
  statusFilter = '';
  typeFilter = '';
  searchTerm = '';

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadPendingProperties();
  }

  ngAfterViewInit(): void {
    if (this.pdfModal?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.pdfModal.nativeElement);
    }
  }

  loadPendingProperties(): void {
    this.isLoading = true;
    this.propertyService.getPendingProperties().subscribe({
      next: (response: any) => {
        this.properties = response;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.toastr.error(
          'Failed to load properties. Please try again.',
          'Error'
        );
        this.isLoading = false;
      },
    });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter((property) => {
      // Status filter
      if (this.statusFilter && this.statusFilter !== 'Filter by Status') {
        if (
          this.statusFilter === 'Pending Approval'
          // && property.approvalStatus !== 'Pending'
        ) {
          return false;
        }
        if (
          this.statusFilter === 'Approved'
          // && property.approvalStatus !== 'Approved'
        ) {
          return false;
        }
        if (
          this.statusFilter === 'Rejected'
          // && property.approvalStatus !== 'Rejected'
        ) {
          return false;
        }
      }

      // Type filter
      if (this.typeFilter && this.typeFilter !== 'Filter by Property Type') {
        if (this.typeFilter === 'For Sale' && property.type !== 'Sell') {
          return false;
        }
        if (this.typeFilter === 'For Rent' && property.type !== 'Rent') {
          return false;
        }
      }

      // Search term
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        if (
          !property.location.toLowerCase().includes(searchLower) &&
          !property.id.toString().includes(searchLower)
        ) {
          return false;
        }
      }

      return true;
    });

    // Sort by approval status (Pending first)
    this.filteredProperties.sort((a, b) => {
      if (a.approvalStatus === 'Pending' && b.approvalStatus !== 'Pending')
        return -1;
      if (a.approvalStatus !== 'Pending' && b.approvalStatus === 'Pending')
        return 1;
      return 0;
    });
  }

  approveProperty(property: any): void {
    this.propertyService
      .updateApprovalStatus(property.id, 'Approved')
      .subscribe({
        next: (response) => {
          this.toastr.success('Property approved successfully', 'Success');
          // Update local property status
          property.approvalStatus = 'Approved';
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error approving property:', error);
          this.toastr.error(
            'Failed to approve property. Please try again.',
            'Error'
          );
        },
      });
  }

  rejectProperty(property: any): void {
    this.propertyService
      .updateApprovalStatus(property.id, 'Rejected')
      .subscribe({
        next: (response) => {
          this.toastr.success('Property rejected successfully', 'Success');
          // Update local property status
          property.approvalStatus = 'Rejected';
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error rejecting property:', error);
          this.toastr.error(
            'Failed to reject property. Please try again.',
            'Error'
          );
        },
      });
  }

  showModal(): void {
    this.modalInstance?.show();
  }

  onStatusFilterChange(): void {
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.applyFilters();
  }

  onSearch(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.typeFilter = '';
    this.searchTerm = '';
    this.applyFilters();
  }
}
