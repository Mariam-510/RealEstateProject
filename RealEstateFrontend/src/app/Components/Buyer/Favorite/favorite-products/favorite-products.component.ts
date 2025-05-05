import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeafletMapComponent } from '../../../Map/leaflet-map/leaflet-map.component';
import { ToastrService } from '../../../../Services/toastr.service';
// import { ProductDTO, SharedService } from '../../../../Service/shared.service';
import { ProductDTO, ProductService } from '../../../../Services/ApiServices/product.service';
import { API_CONFIG } from '../../../../app.config';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-favorite-products',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './favorite-products.component.html',
  styleUrl: './favorite-products.component.css'
})
export class FavoriteProductsComponent implements OnInit {
  constructor(private toastr: ToastrService, private auth: AuthService, private wishListService: WishListService,
    private cdr: ChangeDetectorRef) { }
  apiConfig = API_CONFIG;

  Products: ProductDTO[] = [];
  paginatedProducts: ProductDTO[] = [];
  currentImageIndices: { [key: number]: number } = {};
  openedProductId: number | null = null;
  Math = Math;
  // In FavoriteProductsComponent
  ngOnInit(): void {
    this.loadWishlistProducts();
  }

  isLoading = false;

  async loadWishlistProducts() {
    this.isLoading = true;
    this.cdr.detectChanges();

    this.wishListService.getAllProductsByBuyerId().subscribe({
      next: (products) => {
        console.log('Received products:', products); // Check contracts here
        this.Products = products;

        // Initialize image indices
        this.Products.forEach(product => {
          this.currentImageIndices[product.id] = 0;
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
  toggleWishList(product: ProductDTO) {
    const index = this.Products.findIndex(p => p.id === product.id);
    if (index === -1) return;

    // Store removed product for potential rollback
    const removedProduct = this.Products.splice(index, 1)[0];
    this.updatePagination(); // Add this after modifying Products

    this.wishListService.toggleProductWishlist(product.id).subscribe({
      next: () => {
        this.toastr.success('Removed from Favorites Successfully');
      },
      error: (err) => {
        // Re-insert at original position if error
        this.Products.splice(index, 0, removedProduct);
        this.updatePagination(); // Revert pagination on error

        this.toastr.error('Failed to remove product from favorites');
        console.error(err);
      }
    });
  }

  toggleColorList(productId: number): void {
    this.openedProductId = this.openedProductId === productId ? null : productId;
  }

  nextImage(productId: number) {
    const product = this.Products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] + 1) % product.productimage.length;
    }
  }

  prevImage(productId: number) {
    const product = this.Products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] - 1 + product.productimage.length) % product.productimage.length;
    }
  }

  shareItem(item: any): void {
    const shareText = `Check out this product: ${item.name} - ${item.description}.
        Category: ${item.category?.name || 'General'}
        Price: EGP ${item.price}
        Condition: ${item.isUsed ? 'Used' : 'New'}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        // url: window.location.href
        url: `${window.location.origin}/products/${item.id}`
      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      console.error(`Copy and share this: ${shareText}`);
    }
  }

  currentPage = 1;
  pageSize = 4;
  totalPages = 1;
  updatePagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(this.Products.length / this.pageSize);

    // Ensure current page stays within valid bounds
    this.currentPage = Math.max(1, Math.min(this.currentPage, this.totalPages));

    // Calculate slice indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    // Update paginated properties
    this.paginatedProducts = this.Products.slice(startIndex, endIndex);
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
}

