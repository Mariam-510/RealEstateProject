import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrService } from '../../../../Services/toastr.service';
import { LeafletListMapPropertiesComponent } from '../leaflet-list-map-properties/leaflet-list-map-properties.component';
import { API_CONFIG } from '../../../../app.config';
import { PropertyDTO, PropertyService } from '../../../../Services/ApiServices/property.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';

@Component({
  selector: 'app-list-map-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, LeafletListMapPropertiesComponent],
  templateUrl: './list-map-properties.component.html',
  styleUrl: './list-map-properties.component.css'
})
export class ListMapPropertiesComponent implements OnInit {

  constructor(private toastr: ToastrService, private cdr: ChangeDetectorRef,
    private wishListService: WishListService, private auth: AuthService) { }

  @ViewChild(LeafletListMapPropertiesComponent) mapComponent!: LeafletListMapPropertiesComponent;

  apiConfig = API_CONFIG;
  @Input() properties: PropertyDTO[] = [];

  @Input() allProperties: PropertyDTO[] = [];

  ngOnInit() {

  }
  onPropertyHover(property: PropertyDTO): void {
    if (this.mapComponent) {
      this.mapComponent.highlightProperty(property);
    }
  }

  onPropertyLeave(): void {
    if (this.mapComponent) {
      this.mapComponent.clearHighlight();
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
      this.toastr.error(`Copy and share this: ${shareText}`);
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
