import { ChangeDetectorRef, Component, ElementRef, Input, input, OnInit, ViewChild } from '@angular/core';
import { ProductDTO, ProductFilters, ProductService } from '../../../../Services/ApiServices/product.service';
import { ToastrService } from '../../../../Services/toastr.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { API_CONFIG } from '../../../../app.config';

@Component({
  selector: 'app-similar-products',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './similar-products.component.html',
  styleUrl: './similar-products.component.css'
})
export class SimilarProductsComponent implements OnInit {

  constructor(private cdr: ChangeDetectorRef, private router: Router,
    private productService: ProductService, private toastr: ToastrService,
    private auth: AuthService, private wishListService: WishListService) { }

  apiConfig = API_CONFIG;
  products: ProductDTO[] = [];
  currentImageIndices: { [key: number]: number } = {};

  canScrollLeftTopRatedProduct = false;
  canScrollRightTopRatedProduct = true;

  Math = Math;

  @Input() product: ProductDTO | null = null;

  async ngOnInit() {

    await this.loadProducts();

    this.products.forEach(product => {
      this.currentImageIndices[product.id] = 0;
    });

    this.checkScrollTopRatedProduct();
  }

  async loadProducts(filters?: ProductFilters) {
    try {
      // Get current product details (assuming you have access to these)
      const currentProductId = this.product?.id; // Replace with actual current product ID
      // const currentProductPrice = this.product?.price; // Replace with actual current product price

      // Get all products
      const allProducts = await this.productService.getAllProducts(filters).toPromise() ?? [];

      // Filter and sort products
      this.products = allProducts
        .filter(product => {
          // Basic filters
          const isSameProduct = product.id === currentProductId;
          const hasStock = product.quantity > 0;

          // Category/used condition
          const matchesCategory = product.categoryID === this.product?.categoryID;
          const matchesUsedStatus = product.isUsed === this.product?.isUsed;

          return !isSameProduct && hasStock && (matchesCategory || matchesUsedStatus);
        })
        .sort((a, b) => {
          // Priority 1: Category match
          const aCategoryMatch = a.categoryID === this.product?.categoryID ? 1 : 0;
          const bCategoryMatch = b.categoryID === this.product?.categoryID ? 1 : 0;

          // Priority 2: Used status match
          const aUsedMatch = a.isUsed === this.product?.isUsed ? 1 : 0;
          const bUsedMatch = b.isUsed === this.product?.isUsed ? 1 : 0;

          // Sort descending by priority
          return (bCategoryMatch - aCategoryMatch) ||
            (bUsedMatch - aUsedMatch);
        })
        .slice(0, 5);

      console.log('Filtered products:', this.products);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  @ViewChild('topRatedSlider', { static: false }) topRatedSlider!: ElementRef;

  scrollLeftTopRatedProduct() {
    this.topRatedSlider.nativeElement.scrollBy({ left: -326, behavior: 'smooth' });
  }

  scrollRightTopRatedProduct() {
    this.topRatedSlider.nativeElement.scrollBy({ left: 326, behavior: 'smooth' });
  }

  checkScrollTopRatedProduct() {
    const el = this.topRatedSlider.nativeElement;
    this.canScrollLeftTopRatedProduct = el.scrollLeft > 0;
    this.canScrollRightTopRatedProduct = el.scrollLeft < el.scrollWidth - (el.clientWidth + 5);
    // Trigger change detection manually to prevent the ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

  toggleWishList(product: any) {
    // Optimistic UI update
    const previousState = product.isFavorite;
    product.isFavorite = !previousState;

    this.wishListService.toggleProductWishlist(product.id).subscribe({
      next: (response) => {
        if(product.isFavorite)
          {
            this.toastr.success("Added to Favourite Successfully");
            // Optional: Update with actual API state if needed
          }
          else{
            this.toastr.success("Removed From Favourite Successfully");
           }
      },
      error: (err) => {
        // Revert UI state on error
        product.isFavorite = previousState;
        this.toastr.error('Error updating wishlist');
        console.error(err);
      }
    });
  }

  nextImage(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] + 1) % product.productimage.length;
    }
  }

  prevImage(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndices[productId] =
        (this.currentImageIndices[productId] - 1 + product.productimage.length) % product.productimage.length;
    }
  }

  openedProductId: number | null = null;
  toggleColorList(productId: number): void {
    this.openedProductId = this.openedProductId === productId ? null : productId;
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }


}
