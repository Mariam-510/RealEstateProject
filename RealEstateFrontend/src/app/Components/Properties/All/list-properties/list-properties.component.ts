import { Component, Input } from '@angular/core';
import { ToastrService } from '../../../../Services/toastr.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { API_CONFIG } from '../../../../app.config';
import { PropertyDTO } from '../../../../Services/ApiServices/property.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-list-properties',
  imports: [CommonModule, RouterModule, LeafletMapComponent],
  templateUrl: './list-properties.component.html',
  styleUrl: './list-properties.component.css'
})
export class ListPropertiesComponent {

  constructor(private toastr: ToastrService, private wishListService: WishListService,
    private auth: AuthService) { }

  apiConfig = API_CONFIG;
  @Input() properties: PropertyDTO[] = [];

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
