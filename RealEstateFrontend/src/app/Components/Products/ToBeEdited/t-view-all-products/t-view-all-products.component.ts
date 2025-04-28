import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Product, SharedService } from '../../../../Services/shared.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-t-view-all-products',
    imports: [CommonModule, RouterModule, FormsModule, NgxSliderModule],
    templateUrl: './t-view-all-products.component.html',
    styleUrls: ['./t-view-all-products.component.css']
})
export class TViewAllProductsComponent implements OnInit, AfterViewInit {

    products: Product[] = [];
    filteredProducts: Product[] = [];

    currentImageIndices: { [key: number]: number } = {};
    Math = Math;

    viewModes: { id: 'grid' | 'list'; icon: string }[] = [
        { id: 'grid', icon: 'bi-grid' },
        { id: 'list', icon: 'bi-list' },
    ];

    // Filters
    searchQuery = '';
    selectedCondition: string | boolean = '';
    selectedCategory = '';
    selectedRating = 0;
    minPrice = 0;
    maxPrice = 1000000;
    // isColorListVisible = false;
    openedProductId: number | null = null;

    // Sorting & View
    sortBy = '';

    sliderOptions: Options = {
        floor: 0,
        ceil: 1000000,
        translate: () => '',       // Remove all value labels
        showSelectionBar: true,   // Keep the selection bar (optional)
        hideLimitLabels: true,    // Explicitly hide min/max labels
        hidePointerLabels: true,  // Hide handle labels
        showTicks: false,         // Disable ticks
        showTicksValues: false    // Disable tick labels
      };

      isSticky: boolean = false;

    constructor(private _sharedService: SharedService, private elRef: ElementRef) { }

    ngOnInit(): void {
        this.products = this._sharedService.products;

        this.minPrice = Math.min(...this.products.map(p => p.price));
        this.maxPrice = Math.max(...this.products.map(p => p.price));
        this.sliderOptions.ceil = this.maxPrice;
        this.updateRatingOptions();

        this.products.forEach(product => {
            this.currentImageIndices[product.id] = 0;
        });

        this.sliderOptions = {
            floor: this.minPrice,
            ceil: this.maxPrice,
            translate: (value: number) => `${value.toLocaleString()} EGP`
        };

        this.applyFilters();
    }

    get currentCategoryCount(): number {
        if (!this.selectedCategory) return this.products.length;
        const category = this.categoriesWithCounts.find(c => c.name === this.selectedCategory);
        return category ? category.count : 0;
    }

    get productConditions() {
        return [
          { label: 'All Conditions', value: '', count: this.products.length },
          { label: 'Used', value: 'Used', count: this.products.filter(p => p.isUsed === true).length },
          { label: 'New', value: 'New', count: this.products.filter(p => p.isUsed === false).length }
        ];
      }

      get ratings() {
        return [
            { value: 0, label: 'All Ratings' },
            { value: 5, label: '5 Stars', icon: 'bi-star-fill' },
            { value: 4, label: '4 Stars', icon: 'bi-star-fill' },
            { value: 3, label: '3 Stars', icon: 'bi-star-fill' },
            { value: 2, label: '2 Stars', icon: 'bi-star-fill' },
            { value: 1, label: '1 Star', icon: 'bi-star-fill' }
        ];
    }

      updateRatingOptions(): void {
        const ratingCounts = new Map<number, number>();
        
        // Initialize counts
        [5, 4, 3, 2, 1].forEach(rating => {
          ratingCounts.set(rating, this.products.filter(p => p.averageRating >= rating).length);
        });
      
    }

    // Filtering & Sorting
  applyFilters(): void {
    this.filteredProducts = this.products
      .filter(product => {
        const matchesSearch = !this.searchQuery ||
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase());

        const matchesCondition = this.selectedCondition === '' || product.isUsed === this.selectedCondition;
        const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
        const matchesPrice = product.price >= this.minPrice && product.price <= this.maxPrice;
        const matchesRating = this.selectedRating === 0 || (product.averageRating >= this.selectedRating && product.averageRating < (this.selectedRating + 1));

        return matchesSearch && matchesCondition && matchesCategory && matchesPrice && matchesRating;
      })
      .sort((a, b) => {
        switch (this.sortBy) {
          case 'priceAsc': return a.price - b.price;
          case 'priceDesc': return b.price - a.price;
          case 'dateNewest': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          case 'dateOldest': return new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          default: return 0;
        }
      });

    this.currentPage = 1;
  }

  // Getters
  get categoriesWithCounts() {
    const counts = new Map<string, number>();
    this.products.forEach(p => {
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
  }

  getSortLabel(value: string): string {
    switch (value) {
      case 'priceAsc': return 'Price: Low to High';
      case 'priceDesc': return 'Price: High to Low';
      case 'dateNewest': return 'Newest First';
      case 'dateOldest': return 'Oldest First';
      default: return '';
    }
  }

  getSelectedRatingLabel(): string {
    const rating = this.ratings.find(r => r.value === this.selectedRating);
    return rating ? rating.label : '';
}

  // UI Handlers
  toggleCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  toggleRating(rating: number): void {
    this.selectedRating = this.selectedRating === rating ? 0 : rating;
    this.applyFilters();
  }

  toggleProductCondition(type: string): void {
    this.selectedCondition = type === 'Used' ? true : type === 'New' ? false : '';
    this.applyFilters();
  }
    
    toggleWishList(productId: number): void {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            product.wishlisted = !product.wishlisted;
        }
    }

    // @HostListener('document:click', ['$event'])
    // onDocumentClick(event: MouseEvent): void {
    //   // Close color list when clicking outside
    //   if (!this.elRef.nativeElement.contains(event.target)) {
    //     this.openedProductId = null;
    //   }
    // }

  toggleColorList(productId: number): void {
    this.openedProductId = this.openedProductId === productId ? null : productId;
  }

    clearFilters(): void {
        this.searchQuery = '';
        this.selectedCondition = '';
        this.selectedCategory = '';
        this.selectedRating = 0;
        this.updateRatingOptions();
        this.minPrice = Math.min(...this.products.map(p => p.price));
        this.maxPrice = Math.max(...this.products.map(p => p.price));
        this.sortBy = '';
        this.applyFilters();
      }

    addToCart(productId: number): void {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // Add your cart logic here
            console.log('Added to cart:', product.name);
        }
    }

    nextImage(productId: number): void {
        const product = this.products.find(p => p.id === productId);
        if (product && this.currentImageIndices[productId] < product.images.length - 1) {
            this.currentImageIndices[productId]++;
        }
    }

    prevImage(productId: number): void {
        const product = this.products.find(p => p.id === productId);
        if (product && this.currentImageIndices[productId] > 0) {
            this.currentImageIndices[productId]--;
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
                url: window.location.href
            }).then(() => console.log('Shared successfully'))
                .catch(err => console.error('Sharing failed', err));
        } else {
            // Fallback for browsers that don’t support navigator.share
            console.error(`Copy and share this: ${shareText}`);
        }
    }

    currentPage = 1;
    itemsPerPage = 8;

    private _viewMode: 'grid' | 'list' = 'grid';

    get viewMode(): 'grid' | 'list' {
        return this._viewMode;
    }

    set viewMode(mode: 'grid' | 'list') {
        this._viewMode = mode;
        this.itemsPerPage = mode === 'grid' ? 8 : 4;
        this.currentPage = 1; // optional: reset to page 1 on view change
    }

    // Calculate the total number of pages
    get totalPages() {
        return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    }

    // Get paginated events
    get paginatedProducts() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        return this.filteredProducts.slice(start, start + this.itemsPerPage);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    @ViewChild('tabLinks') tabLinks!: ElementRef;

  stopSection!: HTMLElement;
  private stickyThreshold = 0;

  ngAfterViewInit() {
    this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

  }

    private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    let scrollPosition = scrollY;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    let flag = true;

    this.isSticky = tabBar.classList.contains('sticky');

    // Detect Scroll Direction
    const scrollingDown = (scrollY) > this.lastScrollTop;

    // Stop scrolling effect at "YOU MIGHT ALSO LIKE"
    if (this.stopSection) {

      const stopPoint = this.stopSection.offsetTop;

      if (scrollingDown) {
        //tabBar
        if (scrollingDown && scrollPosition >= stopPoint) {
          flag = false;
          tabBar.classList.remove('sticky'); // Remove when reaching stop section
          // console.log('---------------------------------');
        }

        //tabBar
        else if (!scrollingDown && scrollPosition < stopPoint) {
          flag = true;
          tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
          // console.log('**************************************');

        }
      }

      // Keep tabBar sticky only when scrolling down and past the tabBar's original position
      //tabBar
      if (scrollingDown && scrollY >= tabBarOffset && flag) {
        tabBar.classList.add('sticky');
        // console.log('///////////////////////////////////////////////////');

      }
      else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
        flag = true;
        tabBar.classList.remove('sticky'); // Return to original position when scrolling up
        // console.log('####################################################');

      }

      this.lastScrollTop = scrollY; // Update last scroll position
    }



  }
}