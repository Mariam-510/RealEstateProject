import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ToastrService } from '../../../../Services/toastr.service';
import { ZoomDirective } from '../../../../drectives/zoom.directive';
import { AuthService, User } from '../../../../Services/ApiServices/auth.service';
import { ProductService, ProductDTO, ProductStockDto } from '../../../../Services/ApiServices/product.service';
import { API_CONFIG } from '../../../../app.config';
import { OrderItemService } from '../../../../Services/ApiServices/order-item.service';
import { CartService } from '../../../../Services/ApiServices/cart.service';
import { ReviewResponseDto, ReviewService } from '../../../../Services/ApiServices/review.service';
import { WishListService } from '../../../../Services/ApiServices/wish-list.service';


@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, NgxImageZoomModule, ZoomDirective],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  apiConfig = API_CONFIG;
  product: ProductDTO | null = null; // ✅ Correct interface
  reviews: ReviewResponseDto[] = [];
  loggedInUser!: User | undefined;
  quantity = 1;
  selectedColorStock: ProductStockDto | undefined;

  constructor(
    private route: ActivatedRoute, private renderer: Renderer2,
    private elRef: ElementRef, private cdr: ChangeDetectorRef, private toastr: ToastrService,
    private productService: ProductService, private auth: AuthService, private orderItemService: OrderItemService,
    private cartService: CartService, private reviewService: ReviewService, private wishListService: WishListService
  ) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = parseInt(params['id'], 10);
      if (!isNaN(productId)) {
        this.loadProduct(productId);

        // Get reviews for this product
        this.reviewService.getReviewsByProduct(productId).subscribe({
          next: (reviews) => {
            this.reviews = reviews;
          },
          error: (err) => {
            this.toastr.error('Failed to load reviews');
            console.error(err);
          }
        });
      } else {
        this.toastr.error('Invalid product ID');
      }
    });
    // Auto-select first available color
    if (this.product?.productStockDtos?.length) {
      this.selectedColorStock = this.product.productStockDtos[0];
    }

    this.auth.currentUser$.subscribe(user => {
      if (user) {
        this.loggedInUser = user;
        console.log(this.loggedInUser)
      }
    });

  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => { // Correct type
        this.product = response;
        console.log(this.product)
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.toastr.error('Failed to load product');
        console.error('Error loading product:', err);
      }
    });
  }
  //-----------------------------------------------------------------------------
  @HostListener('pan', ['$event'])
  onPan(event: any) {
    if (event.deltaX > 0) {
      this.prevSlide();
    } else if (event.deltaX < 0) {
      this.nextSlide();
    }
  }

  @ViewChild('thumbnailContainer') thumbnailContainer!: ElementRef;
  @ViewChildren('thumbnail') thumbnails!: QueryList<ElementRef>;

  private _selectedIndex = 0;

  get selectedIndex(): number {
    return this._selectedIndex;
  }

  set selectedIndex(value: number) {
    this._selectedIndex = value;
    this.scrollToActiveThumbnail();
  }

  prevSlide() {
    if (this.product?.productimage) {
      this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.product?.productimage.length - 1;
    }
  }

  nextSlide() {
    if (this.product?.productimage) {
      this.selectedIndex = this.selectedIndex < this.product?.productimage.length - 1 ? this.selectedIndex + 1 : 0;
    }
  }


  private scrollToActiveThumbnail() {
    setTimeout(() => {
      const thumbnails = this.thumbnails.toArray();
      if (thumbnails.length > this.selectedIndex) {
        const thumbnailEl = thumbnails[this.selectedIndex].nativeElement;
        thumbnailEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 0);
  }


  //-----------------------------------------------------------------------------
  isModalOpen = false;

  private _modalIndex = 0;

  get modalIndex(): number {
    return this._modalIndex;
  }

  set modalIndex(value: number) {
    this._modalIndex = value;
    this.scrollToModalThumbnail();
  }

  openModal(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.isModalOpen = true;
    this.modalIndex = this.selectedIndex;
    console.log(this.modalIndex);
  }

  closeModal(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('custom-modal')) {
      this.isModalOpen = false;
    }
  }

  modalPrev(event: MouseEvent) {
    event.stopPropagation();
    if (this.product?.productimage) {
      this.modalIndex = this.modalIndex > 0 ? this.modalIndex - 1 : this.product?.productimage.length - 1;
    }
  }

  modalNext(event: MouseEvent) {
    event.stopPropagation();
    if (this.product?.productimage) {
      this.modalIndex = this.modalIndex < this.product?.productimage.length - 1 ? this.modalIndex + 1 : 0;
    }
  }

  // Add this to handle body scroll
  @HostListener('body:class.modal-open', ['$event'])
  onBodyClassChange() {
    if (this.isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  @ViewChild('modalThumbnailContainer') modalThumbnailContainer!: ElementRef;
  @ViewChildren('modalThumbnail') modalThumbnails!: QueryList<ElementRef>;

  private scrollToModalThumbnail() {
    setTimeout(() => {
      const thumbnails = this.modalThumbnails.toArray();
      if (thumbnails.length > this.modalIndex) {
        const thumbnailEl = thumbnails[this.modalIndex].nativeElement;
        thumbnailEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }, 0);
  }

  isZoomed = false;
  toggleZoom() {
    this.isZoomed = !this.isZoomed;
  }

  //-----------------------------------------------------------------------------
  @ViewChild('heroSection') heroSection!: ElementRef;
  @ViewChild('productCard') productCard!: ElementRef;
  @ViewChild('tabLinks') tabLinks!: ElementRef;

  sections!: NodeListOf<HTMLElement>;
  stopSection!: HTMLElement;
  isNavigationSticky: boolean = false;
  currentActiveSection: string = 'overview';
  private initialCardTop = 0;
  private stickyThreshold = 0;

  ngAfterViewInit() {
    this.calculateInitialPosition();

    this.sections = this.elRef.nativeElement.querySelectorAll('section');
    this.stopSection = this.elRef.nativeElement.querySelector('#stop-scroll')!;

    if (!this.tabLinks) {
      console.warn("tabLinks is not available in ngAfterViewInit");
      return;
    }
  }

  private calculateInitialPosition() {
    const hero = this.heroSection.nativeElement;
    const card = this.productCard.nativeElement;
    this.stickyThreshold = hero.offsetTop + hero.offsetHeight - card.offsetHeight;
  }

  private lastScrollTop: number = 0;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const card = this.productCard.nativeElement;

    // Handle tab bar stickiness
    if (!this.tabLinks || !this.tabLinks.nativeElement) return;

    let scrollPosition = scrollY + 100;
    const tabBar = this.tabLinks.nativeElement;
    const tabBarOffset = tabBar.offsetTop;
    let flag = true;

    // Detect Scroll Direction
    const scrollingDown = (scrollY) > this.lastScrollTop;
    // console.log(card.offsetHeight);

    // Stop scrolling effect at "YOU MIGHT ALSO LIKE"
    if (this.stopSection) {
      const stopPoint = this.stopSection.offsetTop - 300;

      if (scrollingDown) {
        //card
        if (scrollPosition >= stopPoint - 300) {
          this.renderer.removeClass(card, 'fixed-event-card');
          // this.renderer.setStyle(card, 'position', 'absolute');
          this.renderer.setStyle(card, 'top', `${stopPoint - card.offsetHeight + 100}px`);
          // console.log('card-----------------------------------------');
        }
        else {
          this.renderer.addClass(card, 'fixed-event-card');
          // console.log('card************************************************');
        }
      }
      //card
      if (!scrollingDown && scrollPosition < stopPoint - 300) {
        this.renderer.addClass(card, 'fixed-event-card');
        // console.log('card#################################################');
      }

      //tabBar
      if (scrollingDown && scrollPosition >= stopPoint) {
        flag = false;
        tabBar.classList.remove('sticky'); // Remove when reaching stop section
        // this.renderer.removeClass(card, 'mt-5');
        // console.log('---------------------------------');
      }

      //tabBar
      else if (!scrollingDown && scrollPosition < stopPoint) {
        flag = true;
        tabBar.classList.add('sticky'); // Re-add when scrolling up above stop section
        // this.renderer.addClass(card, 'mt-5');
        // console.log('**************************************');

      }
    }

    // Keep tabBar sticky only when scrolling down and past the tabBar's original position
    //tabBar
    if (scrollingDown && scrollY >= tabBarOffset && flag) {
      tabBar.classList.add('sticky');
      // this.renderer.addClass(card, 'mt-5');
      // console.log('///////////////////////////////////////////////////');

    }
    else if (!scrollingDown && scrollY <= tabBarOffset + 500) {
      flag = true;
      tabBar.classList.remove('sticky'); // Return to original position when scrolling up
      // this.renderer.removeClass(card, 'mt-5');
      // console.log('####################################################');

    }

    // Change active tab based on scroll
    this.sections.forEach((section) => {
      if (
        scrollPosition >= section.offsetTop - 50 &&
        scrollPosition < section.offsetTop + section.offsetHeight && scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("*************************************");
      }

      if (
        scrollPosition >= section.offsetTop - 250 &&
        scrollPosition < section.offsetTop + section.offsetHeight && !scrollingDown
      ) {
        this.setActiveTab(section.id);
        // console.log("---------------------------------------------");
      }
    });

    this.lastScrollTop = scrollY; // Update last scroll position
  }

  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private setActiveTab(activeId: string) {
    const tabs = this.tabLinks.nativeElement.querySelectorAll('a');
    tabs.forEach((tab: HTMLElement) => {
      tab.classList.remove('active');
      if (tab.getAttribute('href')?.includes(activeId)) {
        tab.classList.add('active');
      }
    });
  }

  //-----------------------------------------------------------------------------
  Math = Math;

  // In your component
  toggleFavorite(product: any) {
    // Optimistic UI update
    const previousState = product.isFavorite;
    product.isFavorite = !previousState;

    this.wishListService.toggleProductWishlist(product.id).subscribe({
      next: (response) => {
        this.toastr.success(response);
        // Optional: Update with actual API state if needed
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
      this.toastr.success(`Copy and share this: ${shareText}`);
    }
  }

  selectColor(stock: ProductStockDto) {
    this.selectedColorStock = stock;
    this.quantity = 1; // Reset quantity when color changes
    if (stock.quantity == 0) {
      this.quantity = 0; // Reset quantity when color changes
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) this.quantity--;
  }

  // Update quantity validation
  increaseQuantity() {
    if (this.selectedColorStock && this.quantity < this.selectedColorStock.quantity) {
      this.quantity++;
    }
  }

  // Add this method for button text
  getAddToCartButtonText(): string {
    if (!this.selectedColorStock) return 'Select Color';
    if (this.selectedColorStock.quantity === 0) return 'Out of Stock';
    if (this.quantity > this.selectedColorStock.quantity) return 'Exceeds Stock';
    return 'Add to Cart';
  }


  addToCart() {
    if (!this.selectedColorStock) {
      alert('Please select a color');
      return;
    }

    this.orderItemService.createOrderItem({
      ProductId: this.product!.id,
      Quantity: this.quantity,
      Color: this.selectedColorStock.color
    }).subscribe({
      next: (response) => {
        alert('Added to cart successfully!');
        this.cartService.notifyCartUpdated(); // <-- Add this line
        // Reset or update state as needed
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert(err.error?.message || 'Failed to add to cart');
      }
    });
  }

  isProductNew(): boolean {
    // Use a fallback date (e.g., current date) if dateAdded is undefined
    const creationDate = new Date(this.product?.dateAdded ?? new Date());
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - creationDate.getTime();
    const daysSinceCreation = Math.floor(timeDifference / (1000 * 3600 * 24));

    return daysSinceCreation < 5;
  }

  //------------------------------------------------------------------------s-----
  showMore: boolean = false;

  //-----------------------------------------------------------------------------
  showHelpPopup = true;
  closeHelpPopup = false;

  toggleHelp() {
    this.showHelpPopup = !this.showHelpPopup;
  }

  //-----------------------------------------------------------------------------
  printPage() {
    window.print();
  }

  //-----------------------------------------------------------------------------
  hasRole(requiredRole: string) {
    return this.auth.hasRole(requiredRole);
  }

  hasRoleOrNoUser(requiredRole: string) {
    return !this.auth.isAuthenticated() || this.auth.hasRole(requiredRole);
  }

  hasUser() {
    return this.auth.isAuthenticated();
  }

  //-----------------------------------------------------------------------------
  // Pagination variables
  currentPageReviews = 1;
  itemsPerPageReviews = 4; // Adjust number of items per page as needed

  get totalPagesReviews(): number {
    return Math.ceil(this.reviews.length / this.itemsPerPageReviews);
  }

  get paginatedReviews() {
    const start = (this.currentPageReviews - 1) * this.itemsPerPageReviews;
    return this.reviews.slice(start, start + this.itemsPerPageReviews);
  }

  get startIndex(): number {
    return (this.currentPageReviews - 1) * this.itemsPerPageReviews;
  }

  get endIndex(): number {
    return Math.min(this.currentPageReviews * this.itemsPerPageReviews, this.reviews.length);
  }

  changePageReviews(page: number) {
    if (page >= 1 && page <= this.totalPagesReviews) {
      this.currentPageReviews = page;
    }
  }

  // Calculate container height based on items per page
  getContainerHeight(): number {
    const itemHeight = 150; // Approximate card height in px
    const gap = 16; // Gap between items in px
    return (this.itemsPerPageReviews * itemHeight) + ((this.itemsPerPageReviews - 1) * gap);
  }

}
