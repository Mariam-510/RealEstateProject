import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../Services/ApiServices/property.service';
import { ToastrService } from '../../../Services/toastr.service';
import { FormsModule } from '@angular/forms';
import { PropertyDTO } from '../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../app.config';
import { SafeUrlPipe } from '../../../Pipes/safe-url.pipe';

declare var bootstrap: any;

@Component({
  selector: 'app-approve-property',
  standalone: true,
  imports: [CommonModule, FormsModule, SafeUrlPipe],
  templateUrl: './approve-property.component.html',
  styleUrls: ['./approve-property.component.css'],
})
export class ApprovePropertyComponent {
  @ViewChild('pdfModal') pdfModal!: ElementRef;
  private modalInstance?: any;

  properties: PropertyDTO[] = [];
  filteredProperties: PropertyDTO[] = [];
  paginatedProperties: PropertyDTO[] = [];
  isLoading = true;
  apiConfig = API_CONFIG;

  // Pagination variables
  Math = Math;
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Filter variables
  statusFilter = '';
  typeFilter = '';
  searchTerm = '';

  // Modal variables
  selectedProperty: any;

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAllProperties();
  }

  ngAfterViewInit(): void {
    if (this.pdfModal?.nativeElement) {
      this.modalInstance = new bootstrap.Modal(this.pdfModal.nativeElement);
    }
  }

  loadAllProperties(): void {
    this.isLoading = true;
    this.propertyService.getAllPropertiesUnfiltered().subscribe({
      next: (response: any) => {
        // Filter to only keep properties with agentId === null
        this.properties = response.filter(
          (property: PropertyDTO) => property.agentId === null
        );
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
      if (property.agentId !== null) {
        return false;
      }

      // Status filter
      if (this.statusFilter && this.statusFilter !== 'Filter by Status') {
        if (
          this.statusFilter === 'Pending Approval' &&
          property.approvalStatus !== 'Pending'
        ) {
          return false;
        }
        if (
          this.statusFilter === 'Approved' &&
          property.approvalStatus !== 'Approved'
        ) {
          return false;
        }
        if (
          this.statusFilter === 'Rejected' &&
          property.approvalStatus !== 'Rejected'
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

    this.totalItems = this.filteredProperties.length;
    this.updatePaginatedProperties();
  }

  updatePaginatedProperties(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProperties = this.filteredProperties.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePaginatedProperties();
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  approveProperty(property: PropertyDTO): void {
    this.propertyService.updateApprovalStatus(property.id, 1).subscribe({
      next: (response) => {
        this.toastr.success('Property approved successfully', 'Success');
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

  rejectProperty(property: PropertyDTO): void {
    this.propertyService.updateApprovalStatus(property.id, 2).subscribe({
      next: (response) => {
        this.toastr.success('Property rejected successfully', 'Success');
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

  showModal(property: any) {
    this.selectedProperty = property;

    const modalElement = document.getElementById('pdfPreviewModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onTypeFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.typeFilter = '';
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  async downloadFile(property: PropertyDTO) {
    if (!property?.contractImgUrl) return;

    const fileUrl = this.apiConfig.apiUrl + property.contractImgUrl;

    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'contract.pdf'; // Set a filename
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }
}
