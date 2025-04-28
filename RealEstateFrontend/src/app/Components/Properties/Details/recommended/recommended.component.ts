import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardmapComponent } from '../cardmap/cardmap.component';
import { PropertyDTO, PropertyService } from '../../../../Services/ApiServices/property.service';
import { API_CONFIG } from '../../../../app.config';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { ToastrService } from '../../../../Services/toastr.service';

@Component({
  selector: 'app-recommended',
  imports: [CommonModule, RouterModule, FormsModule, CardmapComponent],
  templateUrl: './recommended.component.html',
  styleUrl: './recommended.component.css'
})
export class RecommendedComponent implements OnInit {

  properties: PropertyDTO[] = [];
  apiConfig = API_CONFIG;

  @Input() property: PropertyDTO | null = null;

  constructor(private propertyService: PropertyService, private cdr: ChangeDetectorRef,
    private wishListService: WishListService, private auth: AuthService, private toastr: ToastrService
  ) { }

  async ngOnInit() {
    await this.loadProperties();

    this.cdr.detectChanges(); // If using ChangeDetectorRef
  }

  // In your component
  // async loadProperties(
  //   category?: string,
  //   status?: string,
  //   type?: string,
  //   searchByLocation?: string
  // ) {
  //   try {
  //     this.properties = await this.propertyService.getAll(
  //       category,
  //       status,
  //       type,
  //       searchByLocation
  //     ).toPromise() ?? [];

  //     console.log('Loaded properties:', this.properties);
  //     this.cdr.detectChanges(); // If using ChangeDetectorRef
  //   } catch (err) {
  //     console.error('Error loading properties:', err);
  //     // Handle error (show message, etc.)
  //   }
  // }

  async loadProperties(
    category?: string,
    status?: string,
    type?: string,
    searchByLocation?: string
  ) {
    try {
      const allProperties = await this.propertyService.getAll(
        category,
        status,
        type,
        searchByLocation
      ).toPromise() ?? [];

      console.log('Filtered propertyyy:', this.property);

      this.properties = allProperties
        .filter(property => {
          if (!this.property) return true;

          // Exclude current property and sold status
          if (property.id === this.property.id || property.status === 'Sold') return false;


          // Representative check
          const sameRepresentative =
            (this.property.sellerId && property.sellerId === this.property.sellerId) ||
            (this.property.agentId && property.agentId === this.property.agentId);

          // Space similarity check (±50)
          const spaceDifference = Math.abs(property.space - (this.property.space || 0));
          const similarSpace = spaceDifference <= 50;

          return sameRepresentative || similarSpace;
        })
        .sort((a, b) =>
          Math.abs(a.space - (this.property?.space || 0)) -
          Math.abs(b.space - (this.property?.space || 0))
        )
        .slice(0, 3);

      console.log('Filtered properties:', this.properties);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading properties:', err);
    }
  }


  toggleFavorite(property: PropertyDTO) {
    // Optimistic UI update
    const previousState = property.isFavorite;
    property.isFavorite = !previousState;

    this.wishListService.togglePropertyWishlist(property.id).subscribe({
      next: (response) => {
        this.toastr.success(response);
        // Optional: Update with actual API state if needed
      },
      error: (err) => {
        // Revert UI state on error
        property.isFavorite = previousState;
        this.toastr.error('Error updating wishlist');
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


