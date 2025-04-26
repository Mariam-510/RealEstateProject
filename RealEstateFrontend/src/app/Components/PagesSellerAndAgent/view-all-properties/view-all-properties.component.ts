import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../Map/leaflet-map/leaflet-map.component';
import { ToastrService } from '../../../Services/toastr.service';
import { ViewMode } from '../../Properties/All/properties-page/properties-page.component';
// import { PropertyDto } from '../../../Service/shared.service';
import { PropertyDTO, PropertyService } from '../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../app.config';
import { lastValueFrom } from 'rxjs'; // Add this import
import { AuthService } from '../../../Services/ApiServices/auth.service';


@Component({
  selector: 'app-view-all-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './view-all-properties.component.html',
  styleUrl: './view-all-properties.component.css'
})
export class ViewAllPropertiesComponent implements OnInit {
  apiConfig = API_CONFIG;

  properties: PropertyDTO[] = [];

  constructor(private propertyService: PropertyService,
     private auth: AuthService, 
     private router: Router ) { }// Pagination

  currentPage = 1;
  pageSize = 6;
  totalPages = 1;
  paginatedProperties: PropertyDTO[] = [];
  // constructor(private sharedService: SharedService) { }

  async ngOnInit() {
    if (this.hasRole('Seller')) {
      this.loadAllSellerProperties();

      // Redirect to login if not Buyer
    } else if (this.hasRole('Agent')) {
      this.loadAllAgentProperties();
    }
    else {
      this.router.navigate(['/login']);

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

  async loadAllSellerProperties() {
    try {
      if (this.hasRole("Seller")) {
        this.properties = await lastValueFrom(
        this.propertyService.getPropertiesBySellerId()
        );
        this.updatePagination();
      }
    } catch (err) {
      console.error('API Error:', err);
      this.properties = await lastValueFrom(
        this.propertyService.getPropertiesBySellerId()
      );
      this.updatePagination();
    }
  }
  async loadAllAgentProperties() {
    try {
      if (this.hasRole("Agent")) {
        this.properties = await lastValueFrom(
        this.propertyService.getPropertiesByAgentId()
        );
        this.updatePagination();
      }
    } catch (err) {
      console.error('API Error:', err);
      this.properties = await lastValueFrom(
        this.propertyService.getPropertiesByAgentId()
      );
      this.updatePagination();
    }
  }





  toggleFavorite(event: any) {
    event.isFavorite = !event.isFavorite;
  }

  shareItem(item: any): void {
    const shareText = `Check out this event: ${item.title} - ${item.description} at ${item.location} on ${item.date}. Price: $${item.price}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        url: window.location.href
      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      console.error(`Copy and share this: ${shareText}`);
    }
  }

  toggleMap(property: PropertyDTO) {
    property.activeMap = !property.activeMap;
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
}
