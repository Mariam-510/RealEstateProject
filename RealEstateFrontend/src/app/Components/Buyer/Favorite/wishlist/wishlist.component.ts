import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { ToastrService } from '../../../../Services/toastr.service';
import { ListPropertiesComponent } from '../../../Properties/All/list-properties/list-properties.component';
import { FavoriteProductsComponent } from '../favorite-products/favorite-products.component';
import { FavoritePropertiesComponent } from '../favorite-properties/favorite-properties.component';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { API_CONFIG } from '../../../../app.config';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterModule, LeafletMapComponent, ListPropertiesComponent, FavoriteProductsComponent, FavoritePropertiesComponent],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent implements OnInit {
  // selectedCategory: 'Properties' | 'Products' = 'Properties';
  selectedCategory: string = 'Properties'; // Default
  constructor(private toastr: ToastrService, private auth: AuthService, private router: Router // Inject Router
  ) { }

  apiConfig = API_CONFIG;
  toggleCategory(category: string) {
    this.selectedCategory = category;
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
  ngOnInit(): void {
    if (!this.hasRole('Buyer')) {
      this.router.navigate(['/login']);
    }
  }
}
