import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from '../../../Services/toastr.service';
import { PropertyDTO, PropertyService } from '../../../Services/ApiServices/property.service';
import { AuthService } from '../../../Services/ApiServices/auth.service';
import { PropertyApprovalStatus } from '../../../Services/ApiServices/property.service';
import { Router, RouterLink } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { API_CONFIG } from '../../../app.config';
import { SafeUrlPipe } from '../../../Pipes/safe-url.pipe';
declare var bootstrap: any; // Required for Bootstrap modal handling

@Component({
  selector: 'app-view-pending-properties',
  imports: [CommonModule, RouterLink, SafeUrlPipe],
  templateUrl: './view-pending-properties.component.html',
  styleUrl: './view-pending-properties.component.css'
})
export class ViewPendingPropertiesComponent {
  isPDFModalOpen = false;
  @ViewChild('pdfModal') pdfModal!: ElementRef;
  selectedProperty: PropertyDTO | null = null;

  private modalInstance?: any;
  currentPage = 1;
  pageSize = 3;
  totalPages = 1;
  properties: PropertyDTO[] = []
  paginatedProperties: PropertyDTO[] = [];
  apiConfig = API_CONFIG;

  constructor(private toastr: ToastrService, private propertyService: PropertyService, private auth: AuthService,
    private router: Router, private cdr: ChangeDetectorRef) { }

  preventClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
  async ngOnInit() {
    if (this.hasRole('Seller')) {
      this.loadAllSellerProperties();
    }
    else {
      this.router.navigate(['/login']);
    }
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

  ngAfterViewInit(): void {
    if (this.pdfModal?.nativeElement) {
      // Initialize using the global bootstrap object
      this.modalInstance = new bootstrap.Modal(this.pdfModal.nativeElement);
    }
  }
  showModal(property: PropertyDTO): void {
    this.selectedProperty = property;
  
    // Bootstrap Modal requires initializing via JS
    const modal = new bootstrap.Modal(this.pdfModal.nativeElement);
    modal.show();
  }
  // Pagination methods
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.properties.length / this.pageSize);

    // Ensure current page stays within valid bounds
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

    // Calculate slice indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Update paginated properties
    this.paginatedProperties = this.properties.slice(startIndex, endIndex);
  }
  getPages(): number[] {
    const pagesToShow = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
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

  isLoading = false;

  async loadAllSellerProperties() {
    try {
      this.isLoading = true;
      this.cdr.detectChanges();

      if (this.hasRole("Seller")) {
        this.properties = await lastValueFrom(
          this.propertyService.getPropertiesBySellerId(PropertyApprovalStatus.Pending)
        );
        this.updatePagination();
      }
      this.isLoading = false;
      this.cdr.detectChanges();
    } catch (err) {
      console.error('API Error:', err);
      this.updatePagination();
    }
  }
}

