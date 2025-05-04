import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { CatSliderComponent } from '../Sliders/cat-slider/cat-slider.component';
import { ProductDTO, ProductFilters, ProductService } from '../../../../Services/ApiServices/product.service';
import { AuthService } from '../../../../Services/ApiServices/auth.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';
import { ToastrService } from '../../../../Services/toastr.service';
import { API_CONFIG } from '../../../../app.config';
import { CategoryDTOShow, CategoryService } from '../../../../Services/ApiServices/category.service';
import { ProductFilterService } from '../../../../Services/product-filter.service';

@Component({
  selector: 'app-p-home',
  imports: [CommonModule, RouterModule, CatSliderComponent, FormsModule, NgxSliderModule],
  templateUrl: './p-home.component.html',
  styleUrl: './p-home.component.css'
})
export class PHomeComponent implements OnInit, OnDestroy {

  constructor(private cdr: ChangeDetectorRef, private router: Router,
    private productService: ProductService, private categoryService: CategoryService,
    private auth: AuthService, private wishListService: WishListService,
    private toastr: ToastrService, private filterService: ProductFilterService) { }

  apiConfig = API_CONFIG;
  products: ProductDTO[] = [];
  recentProducts: ProductDTO[] = [];
  topRatedProducts: ProductDTO[] = [];
  hoverStates: { [key: number]: boolean } = {};
  currentImageIndices: { [key: number]: number } = {};
  currentImageIndicesTopRated: { [key: number]: number } = {};

  Math = Math;
  activeSlide = 0;
  private sliderAutoScrollSubscription: Subscription | null = null;
  private sliderAutoScrollInterval = 3000;

  sliderOptions: Options = {
    floor: 0,
    ceil: Number.MAX_SAFE_INTEGER,
    translate: () => '',          // Remove value labels
    hideLimitLabels: true,        // Hide default min/max labels (0 and 1,000,000)
    hidePointerLabels: true,      // Hide handle labels
    showTicks: false,             // Remove tick marks
    showTicksValues: false        // Remove numbers under ticks
  };


  categories: CategoryDTOShow[] = [];
  message: string = '';

  async ngOnInit() {

    await this.loadProducts();

    await this.loadCategories();

    this.getRecentProducts();

    this.getTopRatedProducts();

    this.sliderStartAutoScroll();

    this.products.forEach(product => {
      this.currentImageIndices[product.id] = 0;
      this.currentImageIndicesTopRated[product.id] = 0;
      this.hoverStates[product.id] = false;
    });

    this.minPrice = Math.min(...this.products.map(p => p.price));
    this.maxPrice = Math.max(...this.products.map(p => p.price));
    this.sliderOptions.ceil = this.maxPrice;

    this.sliderOptions = {
      floor: this.minPrice,
      ceil: this.maxPrice,
      translate: (value: number) => `${value.toLocaleString()} EGP`
    };

    this.checkScroll();

    this.checkScrollTopRatedProduct();
  }

  async loadProducts(filters?: ProductFilters) {
    try {
      this.products = await this.productService.getAllProducts(filters).toPromise() ?? [];
      console.log(this.products);
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  async loadCategories() {
    try {
      const response = await this.categoryService.getAllCategories().toPromise();
      this.categories = response?.categoryDto ?? [];
      console.log(this.categories);
      console.log(response);
      this.message = response?.message ?? 'No categories found';
      this.cdr.detectChanges();
    } catch (err) {
      console.error('Error loading categories:', err);
      this.message = 'Failed to load categories';
      this.cdr.detectChanges();
    }
  }

  private getRecentProducts(): void {
    if (!this.products.length) return;

    // Sort by oldest first (ascending order)
    const sortedProducts = [...this.products].sort((a, b) => {
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

    // Take first 5 items
    this.recentProducts = sortedProducts.slice(0, 6);
  }

  private getTopRatedProducts(): void {
    // Sort products by averageRating descending, then by number of reviews
    this.topRatedProducts = [...this.products].sort((a, b) => {
      // First sort by rating
      if (b.averageRating !== a.averageRating) {
        return b.averageRating - a.averageRating;
      }
      // If ratings are equal, sort by number of reviews
      return b.numberOfReviews - a.numberOfReviews;
    });

    // Optional: Take only top 10 products
    this.topRatedProducts = this.topRatedProducts.slice(0, 6);
  }

  //---------------------------------------------------------------------------------------------

  filteredProducts: ProductDTO[] = this.products;

  selectedCategory: string = '';
  selectedState: string = '';
  selectedRating: number = 0;
  minPrice = 0;
  maxPrice = Number.MAX_SAFE_INTEGER;
  openedProductId: number | null = null;


  toggleCategory(category: string): void {
    this.selectedCategory = category === 'All Categories' ? '' : category;
  }

  toggleState(state: string): void {
    this.selectedState = state === 'All Conditions' ? '' : state;
  }

  toggleRating(rating: number): void {
    this.selectedRating = this.selectedRating === rating ? 0 : rating;
  }

  toggleColorList(productId: number): void {
    this.openedProductId = this.openedProductId === productId ? null : productId;
  }


  goToViewAllPage() {
    this.filterService.updateFilters({
      category: this.selectedCategory,
      condition: this.selectedState.toLowerCase(),
      rating: this.selectedRating,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice
    });

    this.router.navigate(['/products/all']);
  }

  newProductView() {
    this.filterService.updateFilters({
      sortBy: 'dateNewest'
    });

    this.router.navigate(['/products/all']);
  }


  TopProductView() {
    this.filterService.updateFilters({
      sortBy: 'ratingDesc'
    });

    this.router.navigate(['/products/all']);
  }

  limitedProductView(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.filterService.updateFilters({
      sortBy: 'limitedStock'
    });

    this.router.navigate(['/products/all']);
  }


  NewProductView(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.filterService.updateFilters({
      condition: 'new',
    });

    this.router.navigate(['/products/all']);
  }

  UsedProductView(event: Event) {
    event.preventDefault(); // Prevent default anchor behavior
    this.filterService.updateFilters({
      condition: 'used',
    });

    this.router.navigate(['/products/all']);
  }

  ngOnDestroy() {
    // this.filterService.resetFilters();
  }

  //--------------------------------------------------------------------------------------------
  toggleWishList(product: any) {
    // Optimistic UI update
    const previousState = product.isFavorite;
    product.isFavorite = !previousState;

    this.wishListService.toggleProductWishlist(product.id).subscribe({
      next: (response) => {
        if (product.isFavorite) {
          this.toastr.success("Added to Favourite Successfully");
          // Optional: Update with actual API state if needed
        }
        else {
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


  shareItem(item: any): void {
    const shareText = `Check out this product: ${item.name} - ${item.description}.
    Category: ${item.category?.name || 'General'}
    Price: EGP ${item.price}
    Condition: ${item.isUsed ? 'Used' : 'New'}`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: shareText,
        // url: window.location.origin + "products" + item.id
        url: `${window.location.origin}/products/${item.id}`
      }).then(() => console.log('Shared successfully'))
        .catch(err => console.error('Sharing failed', err));
    } else {
      // Fallback for browsers that don’t support navigator.share
      console.error(`Copy and share this: ${shareText}`);
    }
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

  //-----------------------------------------------------------------------------------

  slides = [
    {
      imageUrl: 'https://www.crossegyptchallenge.com/wp-content/uploads/2022/07/cairo01.jpg',
      alt: 'Modern living room furniture collection',
      title: 'Elegant Living Room Sets',
      subtitle: 'Comfort meets style in our latest designs'
    },
    {
      imageUrl: 'https://cairo.realestate/uploads/images/2022-12/757.jpg',
      alt: 'Stylish sofas and sectionals on display',
      title: 'Shop Trending Sofas & Sectionals',
      subtitle: 'Upgrade your living space with comfort and style'
    },
    {
      imageUrl: 'https://digital.ihg.com/is/image/ihg/intercontinental-cairo-10367348719-2x1',
      alt: 'Minimalist home decor and furniture',
      title: 'Smart Solutions for Small Spaces',
      subtitle: 'Stylish furniture that fits anywhere'
    }
  ];

  sliderStartAutoScroll(): void {
    this.sliderStopAutoScroll(); // Ensure we don't have multiple subscriptions

    this.sliderAutoScrollSubscription = interval(this.sliderAutoScrollInterval).subscribe(() => {
      this.next();
    });
  }

  sliderStopAutoScroll(): void {
    if (this.sliderAutoScrollSubscription) {
      this.sliderAutoScrollSubscription.unsubscribe();
      this.sliderAutoScrollSubscription = null;
    }
  }

  next(): void {
    this.activeSlide = (this.activeSlide + 1) % this.slides.length;
  }

  prev(): void {
    this.activeSlide = (this.activeSlide - 1 + this.slides.length) % this.slides.length;
  }

  setActiveSlide(index: number): void {
    this.activeSlide = index;
    this.resetAutoScroll();
  }

  resetAutoScroll(): void {
    // Reset the timer when manually changing slides
    this.sliderStartAutoScroll();
    this.sliderStopAutoScroll();
  }

  @ViewChild('slider', { static: false }) slider!: ElementRef;
  @ViewChild('topRatedSlider', { static: false }) topRatedSlider!: ElementRef;

  canScrollLeftProduct = false;
  canScrollRightProduct = true;

  canScrollLeftTopRatedProduct = false;
  canScrollRightTopRatedProduct = true;



  //--------------------------------------------------------------------------------------------
  scrollLeft() {
    this.slider.nativeElement.scrollBy({ left: -326, behavior: 'smooth' });
  }

  scrollRight() {
    this.slider.nativeElement.scrollBy({ left: 326, behavior: 'smooth' });
  }

  checkScroll() {
    const el = this.slider.nativeElement;
    this.canScrollLeftProduct = el.scrollLeft > 0;
    this.canScrollRightProduct = el.scrollLeft < el.scrollWidth - (el.clientWidth + 5);
    // Trigger change detection manually to prevent the ExpressionChangedAfterItHasBeenCheckedError
    this.cdr.detectChanges();
  }

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

  nextImageTopRated(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndicesTopRated[productId] =
        (this.currentImageIndicesTopRated[productId] + 1) % product.productimage.length;
    }
  }

  prevImageTopRated(productId: number) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.currentImageIndicesTopRated[productId] =
        (this.currentImageIndicesTopRated[productId] - 1 + product.productimage.length) % product.productimage.length;
    }
  }


}
