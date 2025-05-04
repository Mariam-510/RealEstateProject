import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ToastrService } from '../../../../Services/toastr.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { API_CONFIG } from '../../../../app.config';
import { PropertyDTO } from '../../../../Services/ApiServices/property.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-favorite-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './favorite-properties.component.html',
  styleUrl: './favorite-properties.component.css'
})
export class FavoritePropertiesComponent implements OnInit {
  constructor(private toastr: ToastrService, private wishListService: WishListService,
    private auth: AuthService, private cdr: ChangeDetectorRef) { }

  apiConfig = API_CONFIG;

  Properties: PropertyDTO[] = [];
  paginatedProperties: PropertyDTO[] = [];
  currentImageIndices: { [key: number]: number } = {};
  openedProductId: number | null = null;
  Math = Math;
  ngOnInit(): void {
    this.loadWishlistProperies();
  }


  isLoading = false;

  async loadWishlistProperies() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.wishListService.getAllPropertiesByBuyerId().subscribe({
      next: (Properties) => {
        console.log('Received Properties:', Properties); // Check contracts here
        this.Properties = Properties;

        // Initialize image indices
        this.Properties.forEach(Property => {
          this.currentImageIndices[Property.id] = 0;
        });
        this.updatePagination();
      },
      error: (err) => {
        this.toastr.error('Failed to load wishlist');
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }

    }
    );
  }

  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
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

  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.Properties.length / this.pageSize);

    // Ensure current page stays within valid bounds
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

    // Calculate slice indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Update paginated properties
    this.paginatedProperties = this.Properties.slice(startIndex, endIndex);
  }
  toggleWishList(property: PropertyDTO) {
    const index = this.Properties.findIndex(p => p.id === property.id);
    if (index === -1) return;

    // Store removed product for potential rollback
    const removedProperty = this.Properties.splice(index, 1)[0];
    this.updatePagination(); // Add this after modifying Products

    this.wishListService.togglePropertyWishlist(property.id).subscribe({
      next: () => {
        this.toastr.success('Removed from Favorites Successfully');
      },
      error: (err) => {
        // Re-insert at original position if error
        this.Properties.splice(index, 0, removedProperty);
        this.updatePagination(); // Revert pagination on error

        this.toastr.error('Failed to remove Property from favorites');
        console.error(err);
      }
    });
  }


  shareItem(item: any): void {
    const shareText = `Check out this event: ${item.title} - ${item.description} at ${item.location} on ${item.date}. Price: $${item.price}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        // url: window.location.href
        url: `${window.location.origin}/properties/${item.id}`

      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      this.toastr.error(`Copy and share this: ${shareText}`);
    }
  }

  toggleMap(property: PropertyDTO) {
    property.activeMap = !property.activeMap;
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


