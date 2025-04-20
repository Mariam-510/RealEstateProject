import { ChangeDetectorRef, Component, ElementRef, HostListener, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ProductDTO, Review, SharedService } from '../../../Service/shared.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { ZoomDirective } from '../../../drectives/zoom.directive';
import { ToastrService } from '../../../Service/toastr.service';


@Component({
  selector: 'app-product-details',
  imports: [CommonModule, RouterModule, NgxImageZoomModule, ZoomDirective],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  product: ProductDTO = {
    id: 1,
    name: 'Luxury Sectional Sofa',
    description: '3-piece modular sectional sofa with premium top-grain leather upholstery and high-density foam cushions. Features reclining seats, built-in cup holders, and USB charging ports. Configurable in multiple layouts with reversible chaise. Includes decorative throw pillows. Seat depth: 22", total dimensions: 120"W x 60"D x 36"H.',
    price: 0,
    quantity: 0,
    isUsed: false,
    averageRating: 0,
    categoryID: 0,
    categoryName: '',
    Productimages: [
    ],
    isFavorite: false,
    colors: [],
    numOfReviews: 0,
    date: new Date()
  };

  reviews: Review[] = [];

  constructor(
    private route: ActivatedRoute, private sharedService: SharedService, private renderer: Renderer2,
    private elRef: ElementRef, private cdr: ChangeDetectorRef, private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = parseInt(params['id'], 10);
      const foundProduct = this.sharedService.products.find(p => p.id === productId);

      if (foundProduct) {
        this.product = foundProduct;
      } else {
        console.warn(`Product with ID ${productId} not found.`);
      }
    });

    this.reviews = this.sharedService.reviews;
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
    this.selectedIndex = this.selectedIndex > 0 ? this.selectedIndex - 1 : this.product.Productimages.length - 1;
  }

  nextSlide() {
    this.selectedIndex = this.selectedIndex < this.product.Productimages.length - 1 ? this.selectedIndex + 1 : 0;
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
    this.modalIndex = this.modalIndex > 0 ? this.modalIndex - 1 : this.product.Productimages.length - 1;
  }

  modalNext(event: MouseEvent) {
    event.stopPropagation();
    this.modalIndex = this.modalIndex < this.product.Productimages.length - 1 ? this.modalIndex + 1 : 0;
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

  toggleFavorite(product: any) {
    product.isFavorite = !product.isFavorite;
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

  quantity: number = 1;

  increaseQuantity() {
    if (this.quantity < this.product.quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (this.quantity > 0 && this.quantity <= this.product.quantity) {
      // Your add to cart logic here
      console.log(`Added ${this.quantity} items to cart`);
    }
  }

  isProductNew() {
    // Assuming your product has a creationDate property
    const daysSinceCreation = Math.floor((Date.now() - new Date(this.product.date).getTime()) / (1000 * 3600 * 24));
    return daysSinceCreation < 5; // 5-day threshold for "new" products
  }

  //-----------------------------------------------------------------------------
  showMore: boolean = false;

  //-----------------------------------------------------------------------------
  showHelpPopup = true;
  closeHelpPopup = false;
  // isLoggedIn = true;
  isLoggedIn = false;
  userName = 'Mariam'

  toggleHelp() {
    this.showHelpPopup = !this.showHelpPopup;
  }

  //-----------------------------------------------------------------------------
  printPage() {
    window.print();
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
